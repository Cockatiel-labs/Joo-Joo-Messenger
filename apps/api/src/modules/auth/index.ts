import { usernameRegex } from "@joo-joo/shared/constants/regex";
import {
  changePasswordSchema,
  checkUsernameQuery,
  signinSchema,
  signupSchema,
} from "@joo-joo/shared/schemas/auth/auth.schema";
import { Elysia, status } from "elysia";
import { accessTokenCookieOptions, refreshTokenCookieOptions } from "../../constants/cookie";
import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from "../../constants/jwt";
import { authGuard } from "../../guards/auth.guard";
import { accessJwtConfig, refreshJwtConfig } from "../../plugins/jwt";
import { authRateLimit, mediumRateLimit, refreshTokenRateLimit } from "../../plugins/rate-limiter";
import { AuthResult } from "./model";
import { createSession, deleteSession, getAllSessionsForUser, getSessionById, getUserById } from "./repository";
import { changePassword, getIsUsernameAvailable, signIn, signup } from "./service";

export const auth = new Elysia({ prefix: "/v1/auth" })
  .use(accessJwtConfig)
  .use(refreshJwtConfig)

  // ─── Check Username ───────────────────────────────────────────────
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
          return { success: false, message: "Internal server error" };
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

  // ─── Profile ──────────────────────────────────────────────────────
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

  // ─── Sign Up & Sign In ────────────────────────────────────────────
  .group("", (app) =>
    app
      .use(authRateLimit)
      .post(
        "/sign-up",
        async ({
          headers,
          accessJwtNamespace,
          refreshJwtNamespace,
          body,
          cookie: { accessToken, refreshToken },
          set,
        }) => {
          try {
            const user = await signup(body);

            if (!user) {
              set.status = 409;
              return { success: false, message: "Username already exists" };
            }

            // [#37] Create session on sign-up
            const userAgent = headers["user-agent"];
            const session = await createSession({ userId: user.id, userAgent });

            const accessJwtToken = await accessJwtNamespace.sign({
              sub: user.id,
              sid: session.id,
              exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXP,
            });

            const refreshJwt = await refreshJwtNamespace.sign({
              sub: user.id,
              sid: session.id,
              exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXP,
            });

            accessToken.set({ value: accessJwtToken, ...accessTokenCookieOptions });
            refreshToken.set({ value: refreshJwt, ...refreshTokenCookieOptions });

            set.status = 201;
            return {
              success: true,
              message: "User created Successfully",
              data: { user: { id: user.id, username: user.username } },
            };
          } catch (error) {
            console.error("Sign-up error:", error);
            set.status = 500;
            return { success: false, message: "Internal server error" };
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
        async ({
          headers,
          accessJwtNamespace,
          refreshJwtNamespace,
          body,
          cookie: { accessToken, refreshToken },
          set,
        }) => {
          try {
            const user = await signIn(body);

            if (!user) {
              set.status = 401;
              return { success: false, message: "Invalid username or password" };
            }

            // [#37] Create session on sign-in
            const userAgent = headers["user-agent"];
            const session = await createSession({ userId: user.id, userAgent });

            const accessJwt = await accessJwtNamespace.sign({
              sub: user.id,
              sid: session.id,
              exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXP,
            });

            const refreshJwt = await refreshJwtNamespace.sign({
              sub: user.id,
              sid: session.id,
              exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXP,
            });

            accessToken.set({ value: accessJwt, ...accessTokenCookieOptions });
            refreshToken.set({ value: refreshJwt, ...refreshTokenCookieOptions });

            return {
              success: true,
              message: "Login Successfully",
              data: { user: { id: user.id, username: user.username } },
            };
          } catch (error) {
            console.error("Sign-in error:", error);
            set.status = 500;
            return { success: false, message: "Internal server error" };
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

  // ─── Logout ───────────────────────────────────────────────────────
  .group("", (app) =>
    app.use(authGuard).post(
      "/logout",
      async ({ payload, cookie: { accessToken, refreshToken } }) => {
        // [#37] Delete session from DB on logout
        if (payload.sid) {
          await deleteSession(payload.sid);
        }

        accessToken.set({ value: "", ...accessTokenCookieOptions, maxAge: 0, expires: new Date(0) });
        refreshToken.set({ value: "", ...refreshTokenCookieOptions, maxAge: 0, expires: new Date(0) });

        return { success: true, message: "Logged out successfully" };
      },
      {
        response: { 200: AuthResult.logoutResponse },
      },
    ),
  )

  // ─── Session Management (#38) ─────────────────────────────────────
  .group("/sessions", (app) =>
    app
      .use(authGuard)
      .get("/", async ({ payload }) => {
        const sessions = await getAllSessionsForUser(payload.sub);
        return { success: true, data: { sessions } };
      })
      .delete("/:id", async ({ payload, params: { id }, set }) => {
        const session = await getSessionById(id);

        if (!session || session.userId !== payload.sub) {
          set.status = 404;
          return { success: false, message: "Session not found" };
        }

        await deleteSession(id);
        return { success: true, message: "Session revoked successfully" };
      }),
  )

  // ─── Change Password (#39) ────────────────────────────────────────
  .group("", (app) =>
    app.use(authGuard).post(
      "/change-password",
      async ({ payload, body, cookie: { accessToken, refreshToken }, set }) => {
        try {
          const success = await changePassword(payload.sub, body.currentPassword, body.newPassword);

          if (!success) {
            set.status = 400;
            return { success: false, message: "Invalid current password or user not found" };
          }

          // Clear cookies — all sessions already deleted in service layer
          accessToken.set({ value: "", ...accessTokenCookieOptions, maxAge: 0, expires: new Date(0) });
          refreshToken.set({ value: "", ...refreshTokenCookieOptions, maxAge: 0, expires: new Date(0) });

          return { success: true, message: "Password updated successfully. All sessions revoked." };
        } catch (error) {
          console.error("Change password error:", error);
          set.status = 500;
          return { success: false, message: "Internal server error" };
        }
      },
      { body: changePasswordSchema },
    ),
  )

  // ─── Refresh Token (#37) ──────────────────────────────────────────
  .group("", (app) =>
    app
      .use(refreshTokenRateLimit)
      .post(
        "/refresh",
        async ({ refreshJwtNamespace, accessJwtNamespace, cookie: { refreshToken, accessToken }, set }) => {
          const token = refreshToken.value as string | undefined;

          if (!token) {
            set.status = 401;
            return { success: false, message: "Refresh token missing" };
          }

          const payload = (await refreshJwtNamespace.verify(token)) as { sub: string; sid?: string } | false;

          if (!payload?.sid) {
            set.status = 401;
            return { success: false, message: "Invalid refresh token" };
          }

          // [#37] Verify session still exists in DB
          const session = await getSessionById(payload.sid);
          if (!session) {
            set.status = 401;
            return { success: false, message: "Session revoked. Please log in again." };
          }

          const newAccessToken = await accessJwtNamespace.sign({
            sub: payload.sub,
            sid: payload.sid,
            exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXP,
          });

          accessToken.set({ value: newAccessToken, ...accessTokenCookieOptions });

          return { success: true, message: "Access token refreshed" };
        },
      ),
  );
