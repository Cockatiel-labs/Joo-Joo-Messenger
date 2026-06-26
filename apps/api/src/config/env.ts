import { backendEnvSchema } from "@joo-joo/shared/config/backend-env";

export const envConfig = backendEnvSchema.parse(process.env);
