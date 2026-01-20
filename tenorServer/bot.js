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

function extractTenorFromEmbeds(message) {
  const embed = message.embeds.find(
    e => e.provider?.name === "Tenor" || e.url?.includes("tenor.com")
  );
  if (!embed) return null;

  return {
    tenorGifId: embed.url?.match(/-(\d+)/)?.[1] ?? null,
    tenorUrl:
      embed.video?.url ||
      embed.thumbnail?.url ||
      null,
  };
}
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const tenor = extractTenorFromEmbeds(message);
  if (!tenor || !tenor.tenorUrl) return;

  try {
    await pool.query(
      `INSERT INTO tenor_logs
       (discord_username, tenor_url, tenor_gif_id)
       VALUES ($1, $2, $3)`,
      [
        message.author.username,
        tenor.tenorUrl,  //returns media url
        tenor.tenorGifId,
      ]
    );

    await message.react("🎬");
    console.log("Saved:", message.author.username, tenor.tenorGifId);
  } catch (err) {
    console.error("DB insert failed:", err);
  }
});
client.login(process.env.DISCORD_TOKEN);