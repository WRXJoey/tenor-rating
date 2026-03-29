import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";

dotenv.config();
const app = express();
app.disable("x-powered-by");
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Example route
app.get("/", (_req, res) => {
  res.send("Server is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

//top gifs
app.get("/api/top-gifs", async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 1000);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);

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
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 1000);

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
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 1000);
    const minPosts = Math.max(parseInt(req.query.min_posts) || 2, 1);

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

// Site-wide stats
app.get("/api/stats", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM tenor_logs) AS total_gifs,
         (SELECT COUNT(DISTINCT discord_username) FROM tenor_logs) AS total_users,
         DATE(posted_at) AS most_active_day,
         COUNT(*) AS most_active_day_count
       FROM tenor_logs
       GROUP BY DATE(posted_at)
       ORDER BY most_active_day_count DESC
       LIMIT 1`
    );

    if (rows.length === 0) {
      return res.json({ total_gifs: 0, total_users: 0, most_active_day: null, most_active_day_count: 0 });
    }

    res.json({
      total_gifs: Number(rows[0].total_gifs),
      total_users: Number(rows[0].total_users),
      most_active_day: rows[0].most_active_day,
      most_active_day_count: Number(rows[0].most_active_day_count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Activity over time (posts per day)
app.get("/api/activity", async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days) || 30, 1), 365);
    const username = req.query.username || null;
    const { rows } = username
      ? await pool.query(
          `SELECT
             DATE(posted_at) AS day,
             COUNT(*) AS count
           FROM tenor_logs
           WHERE posted_at >= NOW() - INTERVAL '1 day' * $1
             AND discord_username = $2
           GROUP BY day
           ORDER BY day ASC`,
          [days, username]
        )
      : await pool.query(
          `SELECT
             DATE(posted_at) AS day,
             COUNT(*) AS count
           FROM tenor_logs
           WHERE posted_at >= NOW() - INTERVAL '1 day' * $1
           GROUP BY day
           ORDER BY day ASC`,
          [days]
        );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});

// User detail page
app.get("/api/users/:username", async (req, res) => {
  try {
    const { username } = req.params;
    if (!username || username.length === 0) {
      return res.status(400).json({ error: "Username requires characters" });
    }

    const [statsResult, postsResult, favoriteGifsResult] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS total_gifs, MIN(posted_at) AS first_post, MAX(posted_at) AS last_post
         FROM tenor_logs
         WHERE discord_username = $1`,
        [username]
      ),
      pool.query(
        `SELECT tenor_gif_id, tenor_url, posted_at
         FROM tenor_logs
         WHERE discord_username = $1
         ORDER BY posted_at DESC
         LIMIT 20`,
        [username]
      ),
      pool.query(
        `SELECT
           tenor_gif_id,
           tenor_url,
           COUNT(*) as count,
           MAX(posted_at) as last_posted
         FROM tenor_logs
         WHERE discord_username = $1 AND tenor_gif_id IS NOT NULL
         GROUP BY tenor_gif_id, tenor_url
         HAVING COUNT(*) >= 2
         ORDER BY count DESC, last_posted DESC
         LIMIT 10`,
        [username]
      ),
    ]);

    if (Number(statsResult.rows[0].total_gifs) === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const { total_gifs, first_post, last_post } = statsResult.rows[0];

    res.json({
      discord_username: username,
      total_gifs: Number(total_gifs),
      first_post,
      last_post,
      all_posts: postsResult.rows,
      favorite_gifs: favoriteGifsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});