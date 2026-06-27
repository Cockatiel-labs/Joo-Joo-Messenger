import { describe, expect, it } from "bun:test";

// Provide minimal env vars BEFORE any module that imports config/env.ts is loaded.
// This must happen before the dynamic imports below.
process.env.NODE_ENV = "development";
process.env.DATABASE_URL = "postgres://localhost:5432/test";
process.env.ACCESS_JWT_SECRET = "test-access-secret-minimum-32-chars-long!!";
process.env.REFRESH_JWT_SECRET = "test-refresh-secret-minimum-32-chars-long!";
process.env.ORIGIN_ALLOWLIST = "http://localhost:3000";

const { Elysia } = await import("elysia");
const { csrf } = await import("./csrf");
const { csrfProtection } = await import("./csrf-middleware");
const { csrfCookieOptions } = await import("../constants/cookie");

/**
 * Helper: extract the `csrf_token` cookie value from a `set-cookie` header string.
 */
function extractCsrfCookie(setCookieHeader: string | null): string | null {
  if (!setCookieHeader) return null;
  const match = setCookieHeader.match(/csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Helper: extract all `set-cookie` headers as an array.
 */
function getSetCookieHeaders(headers: Headers): string[] {
  // Bun's Headers exposes getSetCookie() in newer versions; fall back to raw.
  const headersWithGetSetCookie = headers as Headers & { getSetCookie?: () => string[] };
  if (typeof headersWithGetSetCookie.getSetCookie === "function") {
    return headersWithGetSetCookie.getSetCookie();
  }
  const raw = headers.get("set-cookie");
  if (!raw) return [];
  // Split combined set-cookie header on commas that are followed by a cookie name.
  const parts: string[] = [];
  let current = "";
  for (const segment of raw.split(",")) {
    if (/^\s*[A-Za-z_-]+=/.test(segment)) {
      if (current) parts.push(current);
      current = segment.trim();
    } else {
      current += `,${segment}`;
    }
  }
  if (current) parts.push(current);
  return parts;
}

describe("modern-csrf integration", () => {
  it("csrf.create() returns a token in the expected format", async () => {
    const token = await csrf.create();
    expect(typeof token).toBe("string");
    expect(token).toContain("-");
    const [secret, salt] = token.split("-");
    expect(secret.length).toBeGreaterThan(0);
    expect(salt.length).toBe(4);
  });

  it("csrf.update() rotates the salt but keeps the secret", async () => {
    const token = await csrf.create();
    const [originalSecret] = token.split("-");
    const updated = csrf.update(token);
    const [updatedSecret, updatedSalt] = updated.split("-");
    expect(updatedSecret).toBe(originalSecret);
    expect(updatedSalt.length).toBe(4);
    expect(updated).not.toBe(token);
  });

  it("csrf.verify() returns true for a token and its updated version", async () => {
    const token = await csrf.create();
    const updated = csrf.update(token);
    expect(csrf.verify(token, updated)).toBe(true);
    expect(csrf.verify(updated, token)).toBe(true);
  });

  it("csrf.verify() returns false for unrelated tokens", async () => {
    const token1 = await csrf.create();
    const token2 = await csrf.create();
    expect(csrf.verify(token1, token2)).toBe(false);
  });
});

describe("csrfProtection middleware", () => {
  it("sets a csrf_token cookie on a safe GET request", async () => {
    const testApp = new Elysia().use(csrfProtection).get("/test", () => ({ ok: true }));

    const response = await testApp.handle(new Request("http://localhost/test", { method: "GET" }));

    expect(response.status).toBe(200);
    const setCookies = getSetCookieHeaders(response.headers);
    const csrfCookie = setCookies.find((c) => c.startsWith("csrf_token="));
    expect(csrfCookie).toBeTruthy();
    // SameSite is environment-aware (strict in production, lax in development).
    expect(csrfCookie?.toLowerCase()).toMatch(/samesite=(strict|lax)/);
    // The cookie must have a non-empty token value.
    if (!csrfCookie) throw new Error("Expected csrf_token cookie in GET response");
    const tokenValue = extractCsrfCookie(csrfCookie);
    expect(tokenValue).toBeTruthy();
    expect(tokenValue?.length).toBeGreaterThan(0);
  });

  it("rejects a POST request without a CSRF token (403)", async () => {
    const testApp = new Elysia().use(csrfProtection).post("/test", () => ({ ok: true }));

    const response = await testApp.handle(
      new Request("http://localhost/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain("CSRF");
  });

  it("rejects a POST request with a mismatched CSRF token (403)", async () => {
    const testApp = new Elysia().use(csrfProtection).post("/test", () => ({ ok: true }));

    const fakeToken = await csrf.create();

    const response = await testApp.handle(
      new Request("http://localhost/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": fakeToken,
          Cookie: "csrf_token=totally-different-token",
        },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain("invalid");
  });

  it("accepts a POST request with a valid CSRF token (double-submit cookie)", async () => {
    const validToken = await csrf.create();

    const testApp = new Elysia().use(csrfProtection).post("/test", () => ({ ok: true }));

    const response = await testApp.handle(
      new Request("http://localhost/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": validToken,
          Cookie: `csrf_token=${validToken}`,
        },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });

  it("rotates the CSRF token after a successful state-changing request", async () => {
    const validToken = await csrf.create();

    const testApp = new Elysia().use(csrfProtection).post("/test", () => ({ ok: true }));

    const response = await testApp.handle(
      new Request("http://localhost/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": validToken,
          Cookie: `csrf_token=${validToken}`,
        },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(200);

    const setCookies = getSetCookieHeaders(response.headers);
    const csrfCookieHeader = setCookies.find((c) => c.startsWith("csrf_token="));
    expect(csrfCookieHeader).toBeTruthy();

    if (!csrfCookieHeader) throw new Error("Expected csrf_token cookie after POST");
    const newToken = extractCsrfCookie(csrfCookieHeader);
    expect(newToken).toBeTruthy();
    // The rotated token should verify against the original (same secret, new salt).
    expect(csrf.verify(newToken, validToken)).toBe(true);
    // But it should not be identical (salt changed).
    expect(newToken).not.toBe(validToken);
  });

  it("rejects a DELETE request without a CSRF token (403)", async () => {
    const testApp = new Elysia().use(csrfProtection).delete("/test/:id", () => ({ ok: true }));

    const response = await testApp.handle(new Request("http://localhost/test/123", { method: "DELETE" }));

    expect(response.status).toBe(403);
  });

  it("does not block OPTIONS requests", async () => {
    const testApp = new Elysia().use(csrfProtection).options("/test", () => ({ ok: true }));

    const response = await testApp.handle(new Request("http://localhost/test", { method: "OPTIONS" }));

    expect(response.status).toBe(200);
  });
});

describe("cookie security", () => {
  it("csrfCookieOptions uses SameSite=Strict or SameSite=Lax (never None)", () => {
    expect(["strict", "lax"]).toContain(csrfCookieOptions.sameSite);
  });

  it("csrfCookieOptions is not httpOnly (so JS can read it for double-submit)", () => {
    expect(csrfCookieOptions.httpOnly).toBe(false);
  });

  it("csrfCookieOptions uses root path so it is sent with all requests", () => {
    expect(csrfCookieOptions.path).toBe("/");
  });
});

describe("CSRF bootstrap endpoint", () => {
  it("GET /v1/csrf-token sets a csrf_token cookie and returns the token", async () => {
    const { csrfModule } = await import("../modules/csrf");

    const testApp = new Elysia().use(csrfModule);

    const response = await testApp.handle(new Request("http://localhost/v1/csrf-token", { method: "GET" }));

    expect(response.status).toBe(200);

    // Cookie must be set.
    const setCookies = getSetCookieHeaders(response.headers);
    const csrfCookie = setCookies.find((c) => c.startsWith("csrf_token="));
    if (!csrfCookie) throw new Error("Expected csrf_token cookie in bootstrap response");
    expect(csrfCookie.toLowerCase()).toContain("samesite=");

    // Response body must contain the token.
    const body = (await response.json()) as { success: boolean; csrfToken: string };
    expect(body.success).toBe(true);
    expect(body.csrfToken).toBeTruthy();
    expect(body.csrfToken).toContain("-");
  });

  it("bootstrap token can be used for a subsequent state-changing request", async () => {
    // Simulate the full flow: GET bootstrap → extract cookie → POST with header.
    const { csrfModule } = await import("../modules/csrf");

    const testApp = new Elysia()
      .use(csrfProtection)
      .use(csrfModule)
      .post("/test", () => ({ ok: true }));

    // Step 1: Bootstrap.
    const bootstrapResponse = await testApp.handle(
      new Request("http://localhost/v1/csrf-token", { method: "GET" }),
    );
    expect(bootstrapResponse.status).toBe(200);

    const bootstrapCookies = getSetCookieHeaders(bootstrapResponse.headers);
    const csrfCookieHeader = bootstrapCookies.find((c) => c.startsWith("csrf_token="));
    if (!csrfCookieHeader) throw new Error("Expected csrf_token cookie in bootstrap response");
    const token = extractCsrfCookie(csrfCookieHeader);
    if (!token) throw new Error("Expected non-empty CSRF token in cookie");

    // Step 2: Use the token for a POST.
    const postResponse = await testApp.handle(
      new Request("http://localhost/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": token,
          Cookie: `csrf_token=${token}`,
        },
        body: JSON.stringify({}),
      }),
    );

    expect(postResponse.status).toBe(200);
  });
});

describe("fresh-client-first-POST rejection", () => {
  it("rejects a POST from a client that has never made a safe request (no CSRF cookie)", async () => {
    const testApp = new Elysia().use(csrfProtection).post("/test", () => ({ ok: true }));

    // No Cookie header at all — simulates a fresh browser.
    const response = await testApp.handle(
      new Request("http://localhost/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(403);
    const body = (await response.json()) as { success: boolean; message: string };
    expect(body.success).toBe(false);
    expect(body.message).toContain("missing");
  });
});
