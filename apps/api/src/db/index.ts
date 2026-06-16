import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { envConfig } from "../config/env";
import * as schema from "./schema";

export const pool = new Pool({
  connectionString: envConfig.DATABASE_URL,
  max: 20,
  connectionTimeoutMillis: 2 * 1000,
  idleTimeoutMillis: 30 * 1000,
  maxLifetimeSeconds: 3600,
});

export const db = drizzle(pool, { schema });

// Monitor pool health
pool.on("error", (error) => {
  console.error("Unexpected pool error:", error);
});

// Graceful shutdown for app termination
async function shutdown() {
  await pool.end();
  console.log("PostgreSQL connection closed due to app termination.");
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
