import { pool } from "../../db";

export async function checkDatabaseHealth() {
  try {
    await pool.query("SELECT 1");

    console.log("✅ Database connected successfully");
  } catch (error) {
    console.log("❌ Database connection failed");
    console.error(error);

    process.exit(1);
  }
}
