import cors from "@elysia/cors";
import { Elysia } from "elysia";
import { envConfig } from "./config/env";
import { auth } from "./modules/auth";
import { checkDatabaseHealth } from "./modules/health/database";

await checkDatabaseHealth();

export const app = new Elysia({ prefix: "/api" })
  .use(
    cors({
      origin: envConfig.ORIGIN,
      methods: ["GET", "POST", "OPTIONS"],
      credentials: true,
    }),
  )
  .use(auth)
  .listen(envConfig.PORT);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
