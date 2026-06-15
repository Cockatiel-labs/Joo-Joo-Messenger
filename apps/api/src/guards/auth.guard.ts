import Elysia, { t } from "elysia";
import { jwtConfig } from "../plugins/jwt";

export const authGuard = new Elysia({ name: "authGuard" })
  .use(jwtConfig)
  .guard({
    cookie: t.Cookie({
      accessToken: t.String(),
    }),
  })
  .resolve({ as: "global" }, async ({ jwt, cookie: { accessToken }, status }) => {
    const token = accessToken.value as string | undefined;

    if (!token) {
      throw status(401, "Unauthorized");
    }

    const payload = await jwt.verify(token);

    return { payload };
  });
