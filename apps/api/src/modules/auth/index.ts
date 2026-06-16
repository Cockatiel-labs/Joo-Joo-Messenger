import { usernameRegex } from "@cockatiel/shared/constants/regex";
import { checkUsernameQuery, signinSchema, signupSchema } from "@cockatiel/shared/schemas/auth/auth.schema";
import { Elysia } from "elysia";
import { accessTokenCookieOptions } from "../../constants/cookie";
import { ACCESS_TOKEN_EXP } from "../../constants/jwt";
import { authGuard } from "../../guards/auth.guard";
import { jwtConfig } from "../../plugins/jwt";
import { AuthResult } from "./model";
import { getIsUsernameAvailable, signIn, signup } from "./service";

export const auth = new Elysia({ prefix: "/v1/auth" })
  .use(jwtConfig)
  .get(
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
  )
  .group("/profile", (app) =>
    app.use(authGuard).get("/", async ({ payload }) => {
      return payload;
    }),
  )
  .post(
    "/sign-up",
    async ({ jwt, body, cookie: { accessToken }, set }) => {
      try {
        const user = await signup(body);

        if (!user) {
          set.status = 409;

          return {
            success: false,
            message: "Username already exists",
          };
        }

        const token = await jwt.sign({
          sub: user.id,
          exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXP, // 15 min
        });

        accessToken.set({
          value: token,
          ...accessTokenCookieOptions,
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
  .group("/profile", (app) =>
    app.use(authGuard).get("/", async ({ payload }) => {
      return payload;
    }),
  )
  .post(
    "/sign-up",
    async ({ jwt, body, cookie: { accessToken }, set }) => {
      try {
        const user = await signup(body);

        if (!user) {
          set.status = 409;

          return {
            success: false,
            message: "Username already exists",
          };
        }

        const token = await jwt.sign({
          sub: user.id,
          exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXP, // 15 min
        });

        accessToken.set({
          value: token,
          ...accessTokenCookieOptions,
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
    async ({ jwt, body, cookie: { accessToken }, set }) => {
      try {
        const user = await signIn(body);

        if (!user) {
          set.status = 401;
          return {
            success: false,
            message: "Invalid username or password",
          };
        }

        const token = await jwt.sign({
          sub: user.id,
          exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXP, // 15 min
        });

        accessToken.set({
          value: token,
          ...accessTokenCookieOptions,
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
  )
  .post(
    "/logout",
    async ({ cookie: { accessToken } }) => {
      accessToken.set({
        value: "",
        ...accessTokenCookieOptions,
        maxAge: 0, // overwrite
        expires: new Date(0), // overwrite
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
  );
