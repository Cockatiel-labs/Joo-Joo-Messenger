import jwt from "@elysia/jwt";
import { envConfig } from "../config/env";
import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from "../constants/jwt";

export const accessJwtConfig = jwt({
  name: "accessJwtNamespace",
  secret: envConfig.ACCESS_JWT_SECRET,
  exp: ACCESS_TOKEN_EXP, // 15 minutes
});

export const refreshJwtConfig = jwt({
  name: "refreshJwtNamespace",
  secret: envConfig.REFRESH_JWT_SECRET,
  exp: REFRESH_TOKEN_EXP, // 7 days
});
