import { pool } from "./db.js";
import dotenv from "dotenv";

dotenv.config();

async function runMigration() {
  try {
    console.log("Starting database migration...");

    // Add id column
    console.log("Adding id column...");
    await pool.query(`ALTER TABLE tenor_logs ADD COLUMN id SERIAL PRIMARY KEY;`);
    console.log("✓ Added id column");

    // Add posted_at column
    console.log("Adding posted_at column...");
    await pool.query(`ALTER TABLE tenor_logs ADD COLUMN posted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL;`);
    console.log("✓ Added posted_at column");

    // Backfill existing rows
    console.log("Backfilling existing rows with current timestamp...");
    const result = await pool.query(`UPDATE tenor_logs SET posted_at = CURRENT_TIMESTAMP WHERE posted_at IS NULL;`);
    console.log(`✓ Updated ${result.rowCount} rows`);

    // Create indexes
    console.log("Creating indexes...");
    await pool.query(`CREATE INDEX idx_tenor_logs_posted_at ON tenor_logs(posted_at DESC);`);
    console.log("✓ Created index on posted_at");

    await pool.query(`CREATE INDEX idx_tenor_logs_gif_id ON tenor_logs(tenor_gif_id);`);
    console.log("✓ Created index on tenor_gif_id");

    await pool.query(`CREATE INDEX idx_tenor_logs_username ON tenor_logs(discord_username);`);
    console.log("✓ Created index on discord_username");

    console.log("\n✅ Migration completed successfully!");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
