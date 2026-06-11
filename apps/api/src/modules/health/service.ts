import { pool } from "../../db";

export async function checkDatabaseHealth() {
  await pool.query("SELECT 1");

  console.log("Database connected successfully");
}
