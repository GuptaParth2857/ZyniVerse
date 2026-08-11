# ZyniVerse Discord Bot

Slash-command bot that lets your Discord members check their ZyniVerse stats (watchlist + manga) right inside Discord.

## Files

- `bot.js` — the bot (slash commands: `/link`, `/mystats`, `/unlink`, `/help`)
- `webhook-notify.js` — lightweight webhook notifier (milestones, episode airs, completions)
- `keys.json` — created automatically; stores each user's ZyniVerse API key (do not commit)

## Bot setup

1. Create a bot application at <https://discord.com/developers/applications>
   - Copy the **Application ID** (→ `DISCORD_CLIENT_ID`)
   - Reset the **Bot Token** (→ `DISCORD_TOKEN`)
   - Invite the bot to your server with `applications.commands` + `bot` scopes
2. Install deps and run:

```bash
cd discord-bot
npm init -y
npm install discord.js
# Windows PowerShell:
#   $env:DISCORD_TOKEN="..."
#   $env:DISCORD_CLIENT_ID="..."
#   $env:ZYNIVERSE_API="https://zyverse.in"
node bot.js
```

## How members use it

1. Member creates a free API key at `https://zyverse.in/profile` → **API Keys**
2. In Discord: `/link <apiKey>`
3. `/mystats` → shows their anime + manga stats in an embed

## Webhook notifier

1. Discord Server → **Server Settings → Integrations → Webhooks → New Webhook** → copy URL
2. Set `DISCORD_WEBHOOK_URL`
3. Trigger from the backend or cron:

```bash
node webhook-notify.js "Sakura completed Naruto!" "https://zyverse.in/anime/20"
```

## Endpoint the bot uses

`GET https://zyverse.in/api/v1/me/stats` with header `Authorization: Bearer <api key>`

Returns anime/manga status counts, episodes logged, average score, chapters read.
