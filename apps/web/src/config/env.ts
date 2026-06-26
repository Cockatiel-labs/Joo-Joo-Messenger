import { frontendEnvSchema } from "@joo-joo/shared/config/frontend-env";

export const envConfig = frontendEnvSchema.parse({
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
});
