import { pool } from "./db.js";
import dotenv from "dotenv";

dotenv.config();

async function testDatabase() {
  try {
    console.log("Testing database connection...");

    // Check table structure
    console.log("\n1. Checking table structure:");
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'tenor_logs'
      ORDER BY ordinal_position;
    `);
    console.table(tableInfo.rows);

    // Try a test insert
    console.log("\n2. Testing INSERT query:");
    const testResult = await pool.query(
      `INSERT INTO tenor_logs
       (discord_username, tenor_url, tenor_gif_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      ['test_user', 'https://test.com/gif.mp4', '12345']
    );
    console.log("✓ Insert successful!");
    console.log("Inserted row:", testResult.rows[0]);

    // Clean up test data
    await pool.query(`DELETE FROM tenor_logs WHERE discord_username = 'test_user'`);
    console.log("✓Test data cleaned up");

    console.log("\n Database is working correctly!");
  } catch (err) {
    console.error("Database test failed:", err.message);
    console.error("Full error:", err);
  } finally {
    await pool.end();
  }
}

testDatabase();
