import { describe, expect, it } from "bun:test";

// Provide minimal env vars BEFORE any module that imports config/env.ts is loaded.
process.env.NODE_ENV = "development";
process.env.DATABASE_URL = "postgres://localhost:5432/test";
process.env.ACCESS_JWT_SECRET = "test-access-secret-minimum-32-chars-long!!";
process.env.REFRESH_JWT_SECRET = "test-refresh-secret-minimum-32-chars-long!";
process.env.ORIGIN_ALLOWLIST = "http://localhost:3000";

const { Elysia } = await import("elysia");
const { csrf } = await import("./csrf");
const { csrfProtection } = await import("./csrf-middleware");
const { csrfCookieOptions } = await import("../constants/cookie");
const { deleteCsrfToken, getCsrfToken, setCsrfToken } = await import("./csrf-store");

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

describe("csrf-store", () => {
  it("stores and retrieves a CSRF token by user ID", () => {
    const userId = "user-123";
    const token = "test-token-value";
    setCsrfToken(userId, token);
    expect(getCsrfToken(userId)).toBe(token);
  });

  it("returns undefined for unknown user ID", () => {
    expect(getCsrfToken("nonexistent")).toBeUndefined();
  });

  it("deletes a stored CSRF token", () => {
    const userId = "user-456";
    setCsrfToken(userId, "some-token");
    deleteCsrfToken(userId);
    expect(getCsrfToken(userId)).toBeUndefined();
  });
});

describe("csrfProtection middleware", () => {
  it("skips verification for safe methods (GET, HEAD, OPTIONS)", async () => {
    const testApp = new Elysia().use(csrfProtection).get("/test", () => ({ ok: true }));

    const response = await testApp.handle(new Request("http://localhost/test", { method: "GET" }));
    expect(response.status).toBe(200);
  });

  it("skips verification for unauthenticated state-changing requests (no user payload)", async () => {
    // Sign-in/sign-up are public — no auth guard, so no payload.sub.
    const testApp = new Elysia().use(csrfProtection).post("/test", () => ({ ok: true }));

    const response = await testApp.handle(
      new Request("http://localhost/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
    );
    expect(response.status).toBe(200);
  });

  it("rejects an authenticated POST without a CSRF token (403)", async () => {
    // Simulate an authenticated route: authGuard sets payload.sub.
    const testApp = new Elysia()
      .resolve(() => ({ payload: { sub: "user-789" } }))
      .use(csrfProtection)
      .post("/test", () => ({ ok: true }));

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
    expect(body.message).toContain("missing");
  });

  it("rejects an authenticated POST with an invalid CSRF token (403)", async () => {
    const userId = "user-abc";
    setCsrfToken(userId, await csrf.create());

    const testApp = new Elysia()
      .resolve(() => ({ payload: { sub: userId } }))
      .use(csrfProtection)
      .post("/test", () => ({ ok: true }));

    const response = await testApp.handle(
      new Request("http://localhost/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": "completely-wrong-token",
        },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain("invalid");
  });

  it("accepts an authenticated POST with a valid CSRF token and rotates it", async () => {
    const userId = "user-def";
    const originalToken = await csrf.create();
    setCsrfToken(userId, originalToken);

    const testApp = new Elysia()
      .onError(({ code, error }) => {
        console.error(`[test] onError: ${code} ${error.message}`);
      })
      .resolve(() => ({ payload: { sub: userId } }))
      .use(csrfProtection)
      .post("/test", () => ({ ok: true }));

    const response = await testApp.handle(
      new Request("http://localhost/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": originalToken,
        },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(200);

    // The stored token should have been rotated.
    const rotatedToken = getCsrfToken(userId);
    expect(rotatedToken).toBeTruthy();
    expect(rotatedToken).not.toBe(originalToken);
    // The rotated token should still verify against the original (same secret).
    if (!rotatedToken) throw new Error("Expected rotated token to be stored");
    expect(csrf.verify(rotatedToken, originalToken)).toBe(true);
  });

  it("rejects a DELETE without a CSRF token (403)", async () => {
    const testApp = new Elysia()
      .resolve(() => ({ payload: { sub: "user-ghi" } }))
      .use(csrfProtection)
      .delete("/test/:id", () => ({ ok: true }));

    const response = await testApp.handle(new Request("http://localhost/test/123", { method: "DELETE" }));
    expect(response.status).toBe(403);
  });
});

describe("cookie security", () => {
  it("csrfCookieOptions uses SameSite=Strict or SameSite=Lax (never None)", () => {
    expect(["strict", "lax"]).toContain(csrfCookieOptions.sameSite);
  });

  it("csrfCookieOptions is not httpOnly (so JS can read it)", () => {
    expect(csrfCookieOptions.httpOnly).toBe(false);
  });

  it("csrfCookieOptions uses root path so it is sent with all requests", () => {
    expect(csrfCookieOptions.path).toBe("/");
  });
});
