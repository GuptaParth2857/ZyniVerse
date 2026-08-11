/**
 * ZyniVerse Discord Bot
 * ---------------------
 * Slash commands that let members check their ZyniVerse stats right from Discord.
 *
 * Setup:
 *   1. Create a bot at https://discord.com/developers/applications
 *   2. Enable "MESSAGE CONTENT" not needed; use slash commands (app commands)
 *   3. npm install discord.js
 *   4. Set env vars (see .env.example):
 *        DISCORD_TOKEN=your_bot_token
 *        ZYNIVERSE_API=https://zyverse.in
 *   5. Run: node bot.js
 *
 * The bot stores each Discord user's ZyniVerse API key (created at
 * https://zyverse.in/profile → API Keys) locally in keys.json.
 */

import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEYS_FILE = join(__dirname, "keys.json");

const TOKEN = process.env.DISCORD_TOKEN;
const API_BASE = process.env.ZYNIVERSE_API || "https://zyverse.in";
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
  console.error("Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in environment.");
  process.exit(1);
}

function loadKeys() {
  if (!existsSync(KEYS_FILE)) return {};
  try { return JSON.parse(readFileSync(KEYS_FILE, "utf8")); } catch { return {}; }
}
function saveKeys(keys) {
  writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
}

const keys = loadKeys();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  new SlashCommandBuilder()
    .setName("link")
    .setDescription("Connect your ZyniVerse account using your API key")
    .addStringOption((o) => o.setName("apikey").setDescription("Your zvn_... API key from zyverse.in/profile").setRequired(true)),
  new SlashCommandBuilder()
    .setName("mystats")
    .setDescription("Show your ZyniVerse watchlist & reading stats"),
  new SlashCommandBuilder()
    .setName("unlink")
    .setDescription("Remove your connected ZyniVerse account"),
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("How to use the ZyniVerse bot"),
];

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  try {
    await new REST({ version: "10" }).setToken(TOKEN).put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log("Slash commands registered.");
  } catch (e) {
    console.error("Failed to register commands:", e);
  }
});

async function apiGet(apiKey, path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName, user } = interaction;

  if (commandName === "help") {
    return interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xd946ef)
        .setTitle("ZyniVerse Bot")
        .setDescription(
          "1. Create a free API key at https://zyverse.in/profile (API Keys section)\n" +
          "2. Run /link with that key\n" +
          "3. Use /mystats anytime to see your stats."
        )],
    });
  }

  if (commandName === "link") {
    const apiKey = interaction.options.getString("apikey");
    const { ok, data } = await apiGet(apiKey, "/api/v1/me/stats");
    if (!ok) {
      return interaction.reply({
        content: `❌ That API key is invalid (${data.error || "error"}). Create one at https://zyverse.in/profile → API Keys.`,
        ephemeral: true,
      });
    }
    keys[user.id] = apiKey;
    saveKeys(keys);
    return interaction.reply({
      content: `✅ Linked **@${user.username}** to ZyniVerse. Your list synced! Use /mystats to view.`,
      ephemeral: true,
    });
  }

  if (commandName === "unlink") {
    delete keys[user.id];
    saveKeys(keys);
    return interaction.reply({ content: "✅ Unlinked your ZyniVerse account.", ephemeral: true });
  }

  if (commandName === "mystats") {
    const apiKey = keys[user.id];
    if (!apiKey) {
      return interaction.reply({
        content: "You haven't linked an account yet. Run /link with your ZyniVerse API key first.",
        ephemeral: true,
      });
    }
    const { ok, data } = await apiGet(apiKey, "/api/v1/me/stats");
    if (!ok) {
      return interaction.reply({
        content: "❌ Could not fetch stats. Your API key may have expired — run /link again.",
        ephemeral: true,
      });
    }

    const anime = data.anime || {};
    const manga = data.manga || {};
    const embed = new EmbedBuilder()
      .setColor(0xd946ef)
      .setTitle(`📊 @${user.username} — ZyniVerse Stats`)
      .addFields(
        { name: "Anime", value: `▶️ ${anime.CURRENT || 0} watching\n✅ ${anime.COMPLETED || 0} completed\n📋 ${anime.PLANNING || 0} planned\n⏸ ${anime.PAUSED || 0} on hold`, inline: true },
        { name: "Manga", value: `📖 ${manga.READING || 0} reading\n✅ ${manga.COMPLETED || 0} completed\n📋 ${manga.PLANNING || 0} planned\n📚 ${data.chaptersRead || 0} chapters read`, inline: true },
        { name: "Overview", value: `🎬 ${data.episodesLogged || 0} episodes logged\n★ ${data.averageScore || "—"}/10 avg rating\n💬 ${data.activityCount || 0} activities`, inline: false }
      )
      .setFooter({ text: "zyverse.in — India's #1 anime platform" });
    return interaction.reply({ embeds: [embed] });
  }
});

client.login(TOKEN);
