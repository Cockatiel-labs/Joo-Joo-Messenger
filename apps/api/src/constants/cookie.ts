import { envConfig } from "../config/env";
import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from "./jwt";

/**
 * SameSite policy for cookies.
 *
 * In development the frontend (localhost:3000) and API (localhost:4000) are
 * different origins. Using Strict there would prevent cookies from being sent
 * on the very first navigation from the frontend to the API, breaking the
 * auth flow. Lax is safe here because CSRF protection is enforced via the
 * server-side token pattern on all state-changing routes.
 *
 * In production we use Strict for maximum cross-origin protection, assuming
 * the deployment is configured so that the frontend and API are same-site
 * (e.g. same domain, or API is a subdomain with appropriate cookie scope).
 */
const sameSitePolicy = envConfig.NODE_ENV === "production" ? "strict" : "lax";

export const accessTokenCookieOptions = {
  httpOnly: true,
  maxAge: ACCESS_TOKEN_EXP,
  secure: envConfig.NODE_ENV === "production",
  sameSite: sameSitePolicy,
  path: "/",
} as const;

export const refreshTokenCookieOptions = {
  httpOnly: true,
  maxAge: REFRESH_TOKEN_EXP,
  secure: envConfig.NODE_ENV === "production",
  sameSite: sameSitePolicy,
  path: "/api/v1/auth/refresh",
} as const;

/**
 * CSRF cookie options.
 *
 * This cookie is intentionally NOT httpOnly so the frontend JavaScript can read it
 * and echo its value back in the `x-csrf-token` header. The server holds the
 * canonical token; the cookie is only a transport mechanism.
 */
export const csrfCookieOptions = {
  httpOnly: false,
  maxAge: REFRESH_TOKEN_EXP,
  secure: envConfig.NODE_ENV === "production",
  sameSite: sameSitePolicy,
  path: "/",
} as const;
