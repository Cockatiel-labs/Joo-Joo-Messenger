import { checkUsernameQuery, signinSchema, signupSchema } from "@cockatiel/shared/schemas/auth/auth.schema";
import { Elysia } from "elysia";
import { AuthResult } from "./model";
import { getIsUsernameAvailable, signIn, signup } from "./service";

export const auth = new Elysia({ prefix: "/v1/auth" })
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
    async ({ body, set }) => {
      try {
        const response = await signIn(body);

        if (!response.success) {
          set.status = 401;
          return {
            success: false,
            message: "Invalid username or password",
          };
        }

        return {
          success: true,
          message: "Login Successfully",
          data: response.data,
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
    async ({ body, set }) => {
      try {
        const response = await signup(body);

        if (!response.success) {
          set.status = response.message === "Username already exists" ? 409 : 400;
          return {
            success: false,
            message: response.message,
          };
        }

        set.status = 201;
        return {
          success: true,
          message: response.message,
          data: response.data,
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
        200: AuthResult.authResponse,
        401: AuthResult.errorResponse,
        500: AuthResult.errorResponse,
      },
    },
  );
