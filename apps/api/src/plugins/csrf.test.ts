import { describe, expect, it } from "bun:test";

// Provide minimal env vars BEFORE any module that imports config/env.ts is loaded.
process.env.NODE_ENV = "development";
process.env.DATABASE_URL = "postgres://localhost:5432/test";
process.env.ACCESS_JWT_SECRET = "test-access-secret-minimum-32-chars-long!!";
process.env.REFRESH_JWT_SECRET = "test-refresh-secret-minimum-32-chars-long!";
process.env.ORIGIN_ALLOWLIST = "http://localhost:3000";

const { Elysia } = await import("elysia");
const { modernCsrf } = await import("modern-csrf");

describe("modern-csrf middleware", () => {
  it("allows safe methods (GET, HEAD, OPTIONS) without checking", async () => {
    const app = new Elysia()
      .use(modernCsrf({ trustedOrigins: ["http://localhost:3000"] }))
      .get("/test", () => ({ ok: true }))
      .options("/test", () => ({ ok: true }));

    const getRes = await app.handle(new Request("http://localhost/test", { method: "GET" }));
    expect(getRes.status).toBe(200);

    const optionsRes = await app.handle(new Request("http://localhost/test", { method: "OPTIONS" }));
    expect(optionsRes.status).toBe(200);
  });

  it("blocks cross-site POST without Sec-Fetch-Site header (403)", async () => {
    const app = new Elysia()
      .use(modernCsrf({ trustedOrigins: ["http://localhost:3000"] }))
      .post("/test", () => ({ ok: true }));

    // No Sec-Fetch-Site header — browser would send this for cross-site
    const response = await app.handle(
      new Request("http://localhost/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("blocks cross-site POST with Sec-Fetch-Site: cross-site (403)", async () => {
    const app = new Elysia()
      .use(modernCsrf({ trustedOrigins: ["http://localhost:3000"] }))
      .post("/test", () => ({ ok: true }));

    const response = await app.handle(
      new Request("http://localhost/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Sec-Fetch-Site": "cross-site",
        },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("allows same-origin POST with Sec-Fetch-Site: same-origin", async () => {
    const app = new Elysia()
      .use(modernCsrf({ trustedOrigins: ["http://localhost:3000"] }))
      .post("/test", () => ({ ok: true }));

    const response = await app.handle(
      new Request("http://localhost/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Sec-Fetch-Site": "same-origin",
        },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(200);
  });

  it("allows same-site POST with Sec-Fetch-Site: same-site", async () => {
    const app = new Elysia()
      .use(modernCsrf({ trustedOrigins: ["http://localhost:3000"] }))
      .post("/test", () => ({ ok: true }));

    const response = await app.handle(
      new Request("http://localhost/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Sec-Fetch-Site": "same-site",
        },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(200);
  });

  it("allows cross-site POST when Origin is in trustedOrigins", async () => {
    const app = new Elysia()
      .use(modernCsrf({ trustedOrigins: ["https://trusted-app.com"] }))
      .post("/test", () => ({ ok: true }));

    const response = await app.handle(
      new Request("http://localhost/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Sec-Fetch-Site": "cross-site",
          Origin: "https://trusted-app.com",
        },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(200);
  });

  it("blocks cross-site POST when Origin is NOT in trustedOrigins", async () => {
    const app = new Elysia()
      .use(modernCsrf({ trustedOrigins: ["https://trusted-app.com"] }))
      .post("/test", () => ({ ok: true }));

    const response = await app.handle(
      new Request("http://localhost/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Sec-Fetch-Site": "cross-site",
          Origin: "https://evil.com",
        },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("blocks cross-site DELETE (403)", async () => {
    const app = new Elysia()
      .use(modernCsrf({ trustedOrigins: ["http://localhost:3000"] }))
      .delete("/test/:id", () => ({ ok: true }));

    const response = await app.handle(
      new Request("http://localhost/test/123", {
        method: "DELETE",
        headers: { "Sec-Fetch-Site": "cross-site" },
      }),
    );

    expect(response.status).toBe(403);
  });

  it("blocks cross-site PUT (403)", async () => {
    const app = new Elysia()
      .use(modernCsrf({ trustedOrigins: ["http://localhost:3000"] }))
      .put("/test", () => ({ ok: true }));

    const response = await app.handle(
      new Request("http://localhost/test", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Sec-Fetch-Site": "cross-site",
        },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("blocks cross-site PATCH (403)", async () => {
    const app = new Elysia()
      .use(modernCsrf({ trustedOrigins: ["http://localhost:3000"] }))
      .patch("/test", () => ({ ok: true }));

    const response = await app.handle(
      new Request("http://localhost/test", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Sec-Fetch-Site": "cross-site",
        },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("sets Vary: Sec-Fetch-Site header on responses", async () => {
    const app = new Elysia()
      .use(modernCsrf({ trustedOrigins: ["http://localhost:3000"] }))
      .get("/test", () => ({ ok: true }));

    const response = await app.handle(new Request("http://localhost/test", { method: "GET" }));
    expect(response.status).toBe(200);

    const vary = response.headers.get("Vary");
    expect(vary).toBeTruthy();
    expect(vary).toContain("Sec-Fetch-Site");
  });
});

describe("cookie security", () => {
  it("uses SameSite=Strict or SameSite=Lax (never None)", async () => {
    const { accessTokenCookieOptions, refreshTokenCookieOptions } = await import(
      "../constants/cookie"
    );

    expect(["strict", "lax"]).toContain(accessTokenCookieOptions.sameSite);
    expect(["strict", "lax"]).toContain(refreshTokenCookieOptions.sameSite);
  });

  it("auth cookies are httpOnly", async () => {
    const { accessTokenCookieOptions, refreshTokenCookieOptions } = await import(
      "../constants/cookie"
    );

    expect(accessTokenCookieOptions.httpOnly).toBe(true);
    expect(refreshTokenCookieOptions.httpOnly).toBe(true);
  });
});
