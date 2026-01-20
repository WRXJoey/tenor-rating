import { Client, GatewayIntentBits } from "discord.js";
import fs from "fs";
import { pool } from "./db.js";
import dotenv from "dotenv";
dotenv.config();

//just got news that discord is getting rid of tenor, hopefully this bot will still be useful or can be adapted F*CK 

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});
function extractTenorInfo(content) {
  const match = content.match(/https?:\/\/tenor\.com\/view\/[^\s]+-(\d+)/);
  if (!match) return null;

  return {
    tenorUrl: match[0],
    tenorGifId: match[1],
  };
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.includes("tenor.com")) return;

  const tenor = extractTenorInfo(message.content);
  if (!tenor) return;

  try {
    await pool.query(
      `INSERT INTO tenor_logs (discord_username, tenor_url, tenor_gif_id)
       VALUES ($1, $2, $3)`,
      [message.author.username, tenor.tenorUrl, tenor.tenorGifId]
    );

    await message.react("🎬");
    console.log("Saved:", message.author.username, tenor.tenorGifId);
  } catch (err) {
    console.error("DB insert failed:", err);
  }
});
client.login(process.env.DISCORD_TOKEN);