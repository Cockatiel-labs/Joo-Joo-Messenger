import * as z from "zod";

export const frontendEnvSchema = z.object({
  NEXT_PUBLIC_BASE_URL: z.url(),
  PORT: z.coerce.number().int().positive().default(3000),
});

export type frontendEnv = z.infer<typeof frontendEnvSchema>;
