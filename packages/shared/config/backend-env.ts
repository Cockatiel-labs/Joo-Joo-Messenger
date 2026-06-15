import * as z from "zod";

export const backendEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  DATABASE_URL: z.url(),
  ORIGIN: z.string().default("*"),
  PORT: z.coerce.number().int().positive().default(4000),
  JWT_SECRET: z.string(),
});

export type BackendEnv = z.infer<typeof backendEnvSchema>;
