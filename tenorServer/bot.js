import { Client, GatewayIntentBits } from "discord.js";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

//just got news that discord is getting rid of tenor, hopefuilly this bot will still be useful or can be adapted F*CK 

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

  if (message.content.includes("tenor.com")) {
    const tenor = extractTenorInfo(message.content);
    if (!tenor) return;

    logTenorUsage(
      message.author.id,
      tenor.tenorUrl,
      tenor.tenorGifId
    );

    console.log(
      `Logged → user:${message.author.id} gif:${tenor.tenorGifId}`
    );

    try {
      await message.react("🎬");
    } catch (err) {
      console.error("Reaction failed:", err);
    }
  }
});
function logTenorUsage(userId, tenorUrl, tenorGifId) {
  const entry = {
    userId,
    tenorUrl,
    tenorGifId,
  };

  fs.appendFileSync(
    "tenor_logs.json",
    JSON.stringify(entry) + "\n"
  );
}

client.login(process.env.DISCORD_TOKEN);