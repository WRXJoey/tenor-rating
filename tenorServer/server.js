// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Example route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

//top gifs
app.get("/api/top-gifs", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const { rows } = await pool.query(
      `SELECT id, discord_username, tenor_url, tenor_gif_id, posted_at
       FROM tenor_logs
       ORDER BY posted_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// User leaderboard
app.get("/api/leaderboard", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const { rows } = await pool.query(
      `SELECT
         discord_username,
         COUNT(*) as gif_count,
         MAX(posted_at) as last_post
       FROM tenor_logs
       GROUP BY discord_username
       ORDER BY gif_count DESC, last_post DESC
       LIMIT $1`,
      [limit]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Popular GIFs
app.get("/api/popular-gifs", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const minPosts = parseInt(req.query.min_posts) || 2;

    const { rows } = await pool.query(
      `SELECT
         tenor_gif_id,
         tenor_url,
         COUNT(*) as post_count,
         MAX(posted_at) as last_posted,
         array_agg(DISTINCT discord_username) as posters
       FROM tenor_logs
       WHERE tenor_gif_id IS NOT NULL
       GROUP BY tenor_gif_id, tenor_url
       HAVING COUNT(*) >= $1
       ORDER BY post_count DESC, last_posted DESC
       LIMIT $2`,
      [minPosts, limit]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch popular GIFs" });
  }
});