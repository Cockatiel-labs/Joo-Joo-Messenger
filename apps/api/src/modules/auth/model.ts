import { t, type UnwrapSchema } from "elysia";

export const AuthResult = {
  authResponse: t.Object({
    success: t.Literal(true),
    message: t.String(),
    data: t.Object({
      user: t.Object({
        id: t.String(),
        username: t.String(),
      }),
    }),
  }),

  checkUsernameResponse: t.Boolean(),

  errorResponse: t.Object({
    success: t.Literal(false),
    message: t.String(),
  }),
} as const;

export type AuthModel = {
  [K in keyof typeof AuthResult]: UnwrapSchema<(typeof AuthResult)[K]>;
};
