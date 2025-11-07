import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.includes("tenor.com")) {
    console.log(`${message.author.username} posted a Tenor GIF: ${message.content}`);
    try {
        await message.react("🎬");
    } catch (error) {
        console.error("Failed to add reaction:", error);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);