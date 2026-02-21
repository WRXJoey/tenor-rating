import { Client, GatewayIntentBits } from "discord.js";
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

  // Debug: Log all messages
  console.log(`[MSG] ${message.author.username}: ${message.content || '(no content)'}`);

  // Debug: Check if message has embeds
  if (message.embeds.length > 0) {
    console.log(`[EMBEDS] Found ${message.embeds.length} embed(s)`);
    message.embeds.forEach((embed, idx) => {
      console.log(`  Embed ${idx}:`, {
        provider: embed.provider?.name,
        url: embed.url,
        hasVideo: !!embed.video,
        hasThumbnail: !!embed.thumbnail
      });
    });
  }

  if(message.content.trim() === '!j ping') {
    message.channel.send('Pong!');
    return;
  }
  if(message.content.trim() === '!j stats') {
    try {
      const res = await pool.query('SELECT COUNT(*) FROM tenor_logs');
      const count = res.rows[0].count;
      message.channel.send(`Total Tenor GIFs logged: ${count}`);
    } catch (err) {
      console.error("DB query failed:", err);
      message.channel.send('Error retrieving stats.');
    }
    return;
  }
  if(message.content.trim() === '!j help') {
    message.channel.send('Commands:\n!j ping - Check bot responsiveness\n!j stats - Get total logged Tenor GIFs\n!j help - Show this help message');
    return;
  }

  const tenor = extractTenorFromEmbeds(message);
  console.log('[TENOR]', tenor ? 'Detected Tenor GIF' : 'No Tenor GIF found');

  if (!tenor || !tenor.tenorUrl) return;

  console.log('[INSERT] Attempting to save:', {
    username: message.author.username,
    gifId: tenor.tenorGifId,
    url: tenor.tenorUrl.substring(0, 50) + '...'
  });

  try {
    const result = await pool.query(
      `INSERT INTO tenor_logs
       (discord_username, tenor_url, tenor_gif_id)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [
        message.author.username,
        tenor.tenorUrl,  //returns media url
        tenor.tenorGifId,
      ]
    );

    await message.react("🎬");
    console.log("Saved with ID:", result.rows[0].id, message.author.username, tenor.tenorGifId);
  } catch (err) {
    console.error("Database insert failed:", err.message);
    console.error("Full error:", err);
  }
});
client.login(process.env.DISCORD_TOKEN);