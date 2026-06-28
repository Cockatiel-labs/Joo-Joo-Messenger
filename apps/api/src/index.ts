import cors from "@elysia/cors";
import { Elysia } from "elysia";
import { envConfig } from "./config/env";
import { auth } from "./modules/auth";
import { checkDatabaseHealth } from "./modules/health/database";
import { modernCsrf } from "modern-csrf";

await checkDatabaseHealth();

export const app = new Elysia({ prefix: "/api" })
  .use(
    cors({
      origin: envConfig.ORIGIN_ALLOWLIST,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
    }),
  )
  .use(
    modernCsrf({
      trustedOrigins: envConfig.ORIGIN_ALLOWLIST,
    }),
  )
  .use(auth)
  .listen(envConfig.PORT);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
