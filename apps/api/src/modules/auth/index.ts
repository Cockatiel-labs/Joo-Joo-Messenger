import { checkUsernameQuery, signinSchema, signupSchema } from "@cockatiel/shared/schemas/auth/auth.schema";
import jwt from "@elysia/jwt";
import { Elysia } from "elysia";
import { envConfig } from "../../config/env";
import { ACCESS_TOKEN_TTL_SECONDS } from "../../constants/jwt";
import { AuthResult } from "./model";
import { getIsUsernameAvailable, signIn, signup } from "./service";

export const auth = new Elysia({ prefix: "/v1/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: envConfig.JWT_SECRET,
    }),
  )
  .get(
    "/check-username",
    async ({ query: { username }, set }) => {
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
        500: AuthResult.errorResponse,
      },
    },
  )
  .post(
    "/sign-in",
    async ({ jwt, body, set }) => {
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
          exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL_SECONDS, // 15 min
        });

        return {
          success: true,
          message: "Login Successfully",
          data: {
            user: {
              id: user.id,
              username: user.username,
            },
            token,
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
    "/sign-up",
    async ({ body, jwt, set }) => {
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
          exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL_SECONDS, // 15 min
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
            token,
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
  );
