import Elysia, { t } from "elysia";
import { accessJwtConfig } from "../plugins/jwt";

export const authGuard = new Elysia({ name: "authGuard" })
  .use(accessJwtConfig)
  .guard({
    cookie: t.Cookie({
      accessToken: t.String(),
    }),
  })
  .resolve({ as: "global" }, async ({ accessJwtNamespace, cookie: { accessToken }, status }) => {
    const token = accessToken.value as string | undefined;

    if (!token) {
      throw status(401, "Unauthorized");
    }

    const payload: { sub: string; sessionId: string;exp: number; iat: number } | false = await accessJwtNamespace.verify(token);

    if (!payload) {
      throw status(401, "Unauthorized");
    }
    // [UPDATED] - Fetch session from DB to ensure it's still active
    const { getSessionById } = await import("../modules/auth/repository");
    const session = await getSessionById(payload.sessionId);

    if (!session) {
      throw status(401, "Unauthorized");
    }

    return { payload };
  });
