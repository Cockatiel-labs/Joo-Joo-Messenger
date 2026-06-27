import { Elysia } from "elysia";
import { csrf } from "./csrf";
import { csrfCookieOptions } from "../constants/cookie";
import { deleteCsrfToken, getCsrfToken, setCsrfToken } from "./csrf-store";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"] as const;

/**
 * Elysia plugin that enforces CSRF protection following the official `modern-csrf` pattern.
 *
 * Flow (per the library docs):
 *  1. On sign-in/sign-up, the auth routes generate a token via csrf.create(),
 *     store it server-side (in memory, keyed by user ID), and set it as a cookie.
 *  2. The client reads the cookie and echoes it back via the `x-csrf-token` header.
 *  3. On state-changing requests, the middleware verifies the incoming token
 *     against the stored server token using csrf.verify().
 *  4. On success, the client token is rotated via csrf.update() and the new
 *     value is sent back in the response cookie. The stored server token is
 *     also updated so subsequent rotations chain correctly.
 *
 * Safe methods (GET/HEAD/OPTIONS) pass through without verification.
 * Returns 403 on missing or invalid CSRF token.
 */
export const csrfProtection = new Elysia({ name: "csrfProtection" })
  .onBeforeHandle({ as: "global" }, async ({ request, set, payload }) => {
    const method = request.method.toUpperCase();

    if (SAFE_METHODS.includes(method as (typeof SAFE_METHODS)[number])) {
      return;
    }

    // State-changing request — enforce CSRF verification.
    // The user ID comes from the auth guard's JWT payload (set by authGuard).
    // For unauthenticated routes (sign-in, sign-up), payload.sub is undefined,
    // so we skip CSRF verification for those specific routes.
    const userId = (payload as { sub?: string } | undefined)?.sub;

    // If there's no authenticated user (e.g., sign-in, sign-up, refresh),
    // skip CSRF verification — these routes are public and don't rely on
    // the auth guard. The auth routes themselves handle their own security
    // via rate limiting.
    if (!userId) {
      return;
    }

    const storedToken = getCsrfToken(userId);
    const headerToken = request.headers.get("x-csrf-token");

    if (!storedToken || !headerToken) {
      set.status = 403;
      return {
        success: false,
        message: "CSRF token missing. Include the x-csrf-token header.",
      };
    }

    const isValid = await csrf.verify(headerToken, storedToken);

    if (!isValid) {
      set.status = 403;
      return {
        success: false,
        message: "CSRF token invalid. Request rejected.",
      };
    }

    // Rotate the client token (BREACH mitigation per modern-csrf docs).
    const rotatedToken = csrf.update(storedToken);
    setCsrfToken(userId, rotatedToken);

    // Send the rotated token back to the client via cookie.
    set.headers["set-cookie"] = buildCsrfSetCookie(rotatedToken);
  });

/**
 * Build a Set-Cookie header string for the CSRF token cookie.
 */
function buildCsrfSetCookie(token: string): string {
  const parts = [
    `csrf_token=${encodeURIComponent(token)}`,
    `Path=${csrfCookieOptions.path}`,
    `SameSite=${csrfCookieOptions.sameSite}`,
  ];
  if (csrfCookieOptions.secure) parts.push("Secure");
  if (typeof csrfCookieOptions.maxAge === "number") {
    parts.push(`Max-Age=${csrfCookieOptions.maxAge}`);
  }
  return parts.join("; ");
}

export { deleteCsrfToken };
