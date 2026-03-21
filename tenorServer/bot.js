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
    tenorUrl: embed.video?.url || embed.thumbnail?.url || null,
  };
}


const COMMANDS = {
  ping: {
    //!j ping
    desc: "Check bot responsiveness",
    run: async (message) => {
      message.channel.send("Pong!");
    },
  },
  stats: {
    //!j stats
    desc: "Total GIFs logged",
    run: async (message) => {
      const res = await pool.query("SELECT COUNT(*) FROM tenor_logs");
      message.channel.send(`Total Tenor GIFs logged: ${res.rows[0].count}`);
    },
  },
  recent: {
    //!j recent
    desc: "Show the 5 most recently posted GIFs",
    run: async (message) => {
      const res = await pool.query(
        "SELECT discord_username, tenor_url FROM tenor_logs ORDER BY id DESC LIMIT 5"
      );
      if (res.rows.length === 0) {
        message.channel.send("No Tenor GIFs logged yet.");
        return;
      }
      const lines = res.rows.map(row => `${row.discord_username}: ${row.tenor_url}`).join("\n");
      message.channel.send(`Recent Tenor GIFs:\n${lines}`);
    },
  },
  random: {
    //!j random 
    desc: "Post a random GIF from the logs",
    run: async (message) => {
      const res = await pool.query(
        "SELECT discord_username, tenor_url FROM tenor_logs ORDER BY RANDOM() LIMIT 1"
      );
      if (res.rows.length === 0) {
        message.channel.send("No GIFs logged yet.");
        return;
      }
      const { discord_username, tenor_url } = res.rows[0];
      message.channel.send(`🎲 Random GIF from **${discord_username}**:\n${tenor_url}`);
    },
  },
  leaderboard: {
    //!j leaderboard
    desc: "Show the top 5 GIF posters",
    run: async (message) => {
      const res = await pool.query(
        "SELECT discord_username, COUNT(*) as gif_count FROM tenor_logs GROUP BY discord_username ORDER BY gif_count DESC LIMIT 5"
      );
      if (res.rows.length === 0) {
        message.channel.send("No GIFs logged yet.");
        return;
      }
      const medals = ["🥇", "🥈", "🥉"];
      const board = res.rows
        .map((row, i) => `${medals[i] || `${i + 1}.`} **${row.discord_username}** — ${row.gif_count} GIFs`)
        .join("\n");
      const embed = {
        color: 0xf4a261,
        title: "🏆 Top GIF Posters",
        description: board,
        footer: { text: "!j leaderboard" },
        timestamp: new Date().toISOString(),
      };
      message.channel.send({ embeds: [embed] });
    },
  },
  help: {
    //!j help
    desc: "Show this help message",
    run: async (message) => {
      const lines = Object.entries(COMMANDS)
        .map(([name, cmd]) => `!j ${name} - ${cmd.desc}`)
        .join("\n");
      message.channel.send(`Commands:\n${lines}`);
    },
  },
};

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();

  if (content.startsWith("!j")) {
    const commandName = content.slice(2).trim();
    const command = COMMANDS[commandName];

    if (command) {
      try {
        await command.run(message);
      } catch (err) {
        console.error(`Command !j ${commandName} failed:`, err);
        message.channel.send("Something went wrong. Try again later.");
      }
    } else {
      message.channel.send("Unknown command. Type !j help for a list of commands.");
    }
    return;
  }

  const tenor = extractTenorFromEmbeds(message);
  if (!tenor || !tenor.tenorUrl) return;

  console.log(`[TENOR] ${message.author.username}: ${tenor.tenorGifId}`);
  await saveTenorGif(message.author.username, tenor);
});

async function saveTenorGif(username, tenor) {
  try {
    const result = await pool.query(
      `INSERT INTO tenor_logs (discord_username, tenor_url, tenor_gif_id)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [username, tenor.tenorUrl, tenor.tenorGifId]
    );

    if (result.rows.length > 0) {
      //await message.react("🎬"); //movie clapper reaction
      console.log("Saved with ID:", result.rows[0].id, username, tenor.tenorGifId);
    }
  } catch (err) {
    console.error("Database insert failed:", err.message);
    console.error("Full error:", err);
  }
}

client.on("messageUpdate", async (oldMessage, newMessage) => {
  if (newMessage.author?.bot) return;
  if (oldMessage.embeds.length > 0) return; // embeds already existed, not a new load

  const tenor = extractTenorFromEmbeds(newMessage);
  if (!tenor || !tenor.tenorUrl) return;

  console.log("[TENOR] Detected Tenor GIF via messageUpdate");
  await saveTenorGif(newMessage.author.username, tenor);
});

client.login(process.env.DISCORD_TOKEN);
