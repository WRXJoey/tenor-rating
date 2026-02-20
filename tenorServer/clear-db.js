import { pool } from "./db.js";
import dotenv from "dotenv";

dotenv.config();

async function clearDatabase() {
  try {
    console.log("⚠️  Clearing all data from tenor_logs table...");

    const result = await pool.query(`DELETE FROM tenor_logs`);

    console.log(`✓ Deleted ${result.rowCount} rows`);
    console.log("✓ Database cleared!");

    // Reset the auto-increment counter
    await pool.query(`ALTER SEQUENCE tenor_logs_id_seq RESTART WITH 1`);
    console.log("✓ ID sequence reset to 1");

  } catch (err) {
    console.error("❌ Failed to clear database:", err.message);
  } finally {
    await pool.end();
  }
}

clearDatabase();
