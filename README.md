# tenor-rating

A Discord bot that logs Tenor GIFs posted by users and displays stats on a web dashboard. Hopefully I finish it before Discord or Microsoft shuts down Tenor.

## What it does

- Monitors a Discord server for Tenor GIFs
- Logs each GIF with the username and timestamp to a PostgreSQL database
- Serves a web dashboard showing leaderboards, charts, and a GIF log

## Stack

- **Bot**: Discord.js
- **Server**: Express + PostgreSQL
- **Frontend**: React + Chart.js 

## Bot commands

| Command | Description |
|---|---|
| `!j ping` | Check bot responsiveness |
| `!j stats` | Total GIFs logged |
| `!j stats <username>` | Stats for a specific user |
| `!j recent` | 5 most recently posted GIFs |
| `!j random` | Post a random GIF from the logs |
| `!j leaderboard` | Top 5 GIF posters |
| `!j help` | List commands |

## Setup (if you really want to run it currently, no plans to deploy anything yet)

1. Create a `.env` file in `tenorServer/` with `DISCORD_TOKEN` and `PGPASSWORD`
2. Run `npm install` in the root, `tenorServer/`, and `TenorApp/client/`
3. Run `npm run dev` from the root to start everything (server, bot, and frontend)
