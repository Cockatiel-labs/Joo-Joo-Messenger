import { Elysia } from "elysia";
import { envConfig } from "./config/env";
import { health } from "./modules/health";

const app = new Elysia({ prefix: "/api" }).use(health).listen(envConfig.PORT);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
