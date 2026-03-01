import { pool } from "./db.js";
import dotenv from "dotenv";

dotenv.config();

// Sample usernames
const usernames = [
  "GifMaster3000",
  "MemeLord",
  "ReactionKing",
  "ComedyQueen",
  "joeym",
  "SillyGoose",
  "ChillVibes",
  "EpicGamer",
];

// Sample Tenor GIF URLs and IDs (real-ish format)
const gifs = [
  { id: "16194400813469791796", url: "https://media.tenor.com/abc123/shocked.mp4" },
  { id: "24885178", url: "https://media.tenor.com/def456/laugh.mp4" },
  { id: "15076279", url: "https://media.tenor.com/ghi789/dance.mp4" },
  { id: "23269415", url: "https://media.tenor.com/jkl012/thumbs-up.mp4" },
  { id: "17425809", url: "https://media.tenor.com/mno345/facepalm.mp4" },
  { id: "13896937", url: "https://media.tenor.com/pqr678/happy.mp4" },
  { id: "20803969", url: "https://media.tenor.com/stu901/sad.mp4" },
  { id: "14882076", url: "https://media.tenor.com/vwx234/excited.mp4" },
];

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomTimestamp() {
  const now = new Date();
  const hoursAgo = Math.random() * 72; // Random time within last 3 days
  return new Date(now - hoursAgo * 60 * 60 * 1000);
}

async function seedDatabase() {
  try {
    console.log("[*] Seeding database with test data...\n");

    const entries = [];

    // Create 50 random GIF posts
    for (let i = 0; i < 50; i++) {
      const user = randomElement(usernames);
      const gif = randomElement(gifs);
      const timestamp = randomTimestamp();

      entries.push({
        username: user,
        gifId: gif.id,
        url: gif.url,
        timestamp: timestamp,
      });
    }

    // Add some guaranteed duplicates for popular GIFs
    const popularGif = gifs[0];
    for (let i = 0; i < 8; i++) {
      entries.push({
        username: randomElement(usernames),
        gifId: popularGif.id,
        url: popularGif.url,
        timestamp: randomTimestamp(),
      });
    }

    const popularGif2 = gifs[1];
    for (let i = 0; i < 5; i++) {
      entries.push({
        username: randomElement(usernames),
        gifId: popularGif2.id,
        url: popularGif2.url,
        timestamp: randomTimestamp(),
      });
    }

    // Insert all entries
    console.log(`Inserting ${entries.length} GIF entries...`);

    for (const entry of entries) {
      await pool.query(
        `INSERT INTO tenor_logs (discord_username, tenor_url, tenor_gif_id, posted_at)
         VALUES ($1, $2, $3, $4)`,
        [entry.username, entry.url, entry.gifId, entry.timestamp]
      );
    }

    console.log(`[OK] Inserted ${entries.length} entries\n`);

    // Show summary
    const userCounts = await pool.query(`
      SELECT discord_username, COUNT(*) as count
      FROM tenor_logs
      GROUP BY discord_username
      ORDER BY count DESC
    `);

    console.log("[*] User Leaderboard:");
    userCounts.rows.forEach((row, idx) => {
      const medal = idx === 0 ? "[1]" : idx === 1 ? "[2]" : idx === 2 ? "[3]" : "   ";
      console.log(`  ${medal} ${row.discord_username}: ${row.count} GIFs`);
    });

    const popularGifs = await pool.query(`
      SELECT tenor_gif_id, COUNT(*) as count
      FROM tenor_logs
      GROUP BY tenor_gif_id
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 5
    `);

    console.log("\n[*] Popular GIFs:");
    popularGifs.rows.forEach((row) => {
      console.log(`  GIF ${row.tenor_gif_id}: posted ${row.count} times`);
    });

    console.log("\nDatabase seeded successfully!");
  } catch (err) {
    console.error("Seeding failed:", err.message);
  } finally {
    await pool.end();
  }
}

seedDatabase();
