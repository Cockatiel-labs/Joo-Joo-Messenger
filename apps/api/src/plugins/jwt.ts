import jwt from "@elysia/jwt";
import { envConfig } from "../config/env";
import { ACCESS_TOKEN_EXP } from "../constants/jwt";

export const jwtConfig = jwt({
  name: "jwt",
  secret: envConfig.JWT_SECRET,
  exp: ACCESS_TOKEN_EXP, // 15 min
});
