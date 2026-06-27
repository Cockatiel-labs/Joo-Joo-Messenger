import { usernameRegex } from "@joo-joo/shared/constants/regex";
import { checkUsernameQuery, signinSchema, signupSchema } from "@joo-joo/shared/schemas/auth/auth.schema";
import { Elysia, status } from "elysia";
import { accessTokenCookieOptions, refreshTokenCookieOptions } from "../../constants/cookie";
import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from "../../constants/jwt";
import { authGuard } from "../../guards/auth.guard";
import { accessJwtConfig, refreshJwtConfig } from "../../plugins/jwt";
import { csrf } from "../../plugins/csrf";
import { deleteCsrfToken, setCsrfToken } from "../../plugins/csrf-store";
import { authRateLimit, mediumRateLimit, refreshTokenRateLimit } from "../../plugins/rate-limiter";
import { AuthResult } from "./model";
import { getUserById } from "./repository";
import { getIsUsernameAvailable, signIn, signup } from "./service";

export const auth = new Elysia({ prefix: "/v1/auth" })
  .use(accessJwtConfig)
  .use(refreshJwtConfig)
  .group("", (app) =>
    app.use(mediumRateLimit).get(
      "/check-username",
      async ({ query: { username }, set }) => {
        if (!usernameRegex.test(username)) {
          set.status = 400;

          return {
            success: false,
            message: "Username must start with a letter and contain only letters, numbers, and underscores",
          };
        }

        try {
          return getIsUsernameAvailable(username);
        } catch (error) {
          console.error("Check-username error:", error);

          set.status = 500;
          return {
            success: false,
            message: "Internal server error",
          };
        }
      },
      {
        query: checkUsernameQuery,
        response: {
          200: AuthResult.checkUsernameResponse,
          400: AuthResult.errorResponse,
          500: AuthResult.errorResponse,
        },
      },
    ),
  )

  .group("/profile", (app) =>
    app.use(authGuard).get("/", async ({ payload }) => {
      const { sub } = payload;

      const user = await getUserById(sub);

      if (!user) {
        throw status(404, "User not found");
      }

      return user;
    }),
  )
  .group("", (app) =>
    app
      .use(authRateLimit)
      .post(
        "/sign-up",
        async ({ accessJwtNamespace, refreshJwtNamespace, body, cookie: { accessToken, refreshToken, csrfToken }, set }) => {
          try {
            const user = await signup(body);

            if (!user) {
              set.status = 409;

              return {
                success: false,
                message: "Username already exists",
              };
            }

            const accessJwtToken = await accessJwtNamespace.sign({
              sub: user.id,
              exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXP, // 15 minutes
            });

            const refreshJwt = await refreshJwtNamespace.sign({
              sub: user.id,
              exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXP, // 7 days
            });

            // Generate and store a CSRF token for the new user (modern-csrf pattern).
            const csrfTokenValue = await csrf.create();
            setCsrfToken(user.id, csrfTokenValue);

            accessToken.set({
              value: accessJwtToken,
              ...accessTokenCookieOptions,
            });

            refreshToken.set({
              value: refreshJwt,
              ...refreshTokenCookieOptions,
            });

            csrfToken.set({
              value: csrfTokenValue,
              ...csrfCookieOptions,
            });

            set.status = 201;
            return {
              success: true,
              message: "User created Successfully",
              data: {
                user: {
                  id: user.id,
                  username: user.username,
                },
              },
            };
          } catch (error) {
            console.error("Sign-up error:", error);

            set.status = 500;
            return {
              success: false,
              message: "Internal server error",
            };
          }
        },
        {
          body: signupSchema,
          response: {
            201: AuthResult.authResponse,
            409: AuthResult.errorResponse,
            500: AuthResult.errorResponse,
          },
        },
      )
      .post(
        "/sign-in",
        async ({ accessJwtNamespace, refreshJwtNamespace, body, cookie: { accessToken, refreshToken, csrfToken }, set }) => {
          try {
            const user = await signIn(body);

            if (!user) {
              set.status = 401;
              return {
                success: false,
                message: "Invalid username or password",
              };
            }

            const accessJwt = await accessJwtNamespace.sign({
              sub: user.id,
              exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXP, // 15 minutes
            });

            const refreshJwt = await refreshJwtNamespace.sign({
              sub: user.id,
              exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXP, // 7 days
            });

            // Generate and store a CSRF token for the authenticated user (modern-csrf pattern).
            const csrfTokenValue = await csrf.create();
            setCsrfToken(user.id, csrfTokenValue);

            accessToken.set({
              value: accessJwt,
              ...accessTokenCookieOptions,
            });

            refreshToken.set({
              value: refreshJwt,
              ...refreshTokenCookieOptions,
            });

            csrfToken.set({
              value: csrfTokenValue,
              ...csrfCookieOptions,
            });

            return {
              success: true,
              message: "Login Successfully",
              data: {
                user: {
                  id: user.id,
                  username: user.username,
                },
              },
            };
          } catch (error) {
            console.error("Sign-in error:", error);

            set.status = 500;
            return {
              success: false,
              message: "Internal server error",
            };
          }
        },
        {
          body: signinSchema,
          response: {
            200: AuthResult.authResponse,
            401: AuthResult.errorResponse,
            500: AuthResult.errorResponse,
          },
        },
      ),
  )

  .post(
    "/logout",
    async ({ payload, cookie: { accessToken, refreshToken } }) => {
      // Clear the stored CSRF token for this user.
      if (payload?.sub) {
        deleteCsrfToken(payload.sub);
      }

      accessToken.set({
        value: "",
        ...accessTokenCookieOptions,
        maxAge: 0, // overwrite
        expires: new Date(0),
      });

      refreshToken.set({
        value: "",
        ...refreshTokenCookieOptions,
        maxAge: 0, // overwrite
        expires: new Date(0),
      });

      return {
        success: true,
        message: "Logged out successfully",
      };
    },
    {
      response: {
        200: AuthResult.logoutResponse,
      },
    },
  )

  .group("", (app) =>
    app
      .use(refreshTokenRateLimit)
      .post(
        "/refresh",
        async ({ refreshJwtNamespace, accessJwtNamespace, cookie: { refreshToken, accessToken }, set }) => {
          const token = refreshToken.value as string | undefined;

          if (!token) {
            set.status = 401;

            return {
              success: false,
              message: "Refresh token missing",
            };
          }

          const payload = await refreshJwtNamespace.verify(token);

          if (!payload) {
            set.status = 401;

            return {
              success: false,
              message: "Invalid refresh token",
            };
          }

          const newAccessToken = await accessJwtNamespace.sign({
            sub: payload.sub,
            exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXP,
          });

          accessToken.set({
            value: newAccessToken,
            ...accessTokenCookieOptions,
          });

          return {
            success: true,
            message: "Access token refreshed",
          };
        },
      ),
  );
