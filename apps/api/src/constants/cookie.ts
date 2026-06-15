import { envConfig } from "../config/env";
import { ACCESS_TOKEN_EXP } from "./jwt";

export const accessTokenCookieOptions = {
  httpOnly: true,
  maxAge: ACCESS_TOKEN_EXP,
  secure: envConfig.NODE_ENV === "production",
  sameSite: envConfig.NODE_ENV === "production" ? "strict" : "lax",
  path: "/",
} as const;
