/**
 * ZyniVerse Discord Webhook Notifier
 * ----------------------------------
 * Posts a message to a Discord channel when triggered by the ZyniVerse backend
 * (e.g. a user completes an anime, hits a milestone, or a new episode airs).
 *
 * Setup:
 *   1. In your Discord server: Server Settings → Integrations → Webhooks → New Webhook
 *   2. Copy the Webhook URL and set it as DISCORD_WEBHOOK_URL
 *   3. Run: node webhook-notify.js '<title>' 'http://zyverse.in/anime/123'
 *
 * The backend can call this script (or the webhook URL directly) like:
 *   node webhook-notify.js "Naruto completed!" "https://zyverse.in/anime/20"
 */

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

const [title = "ZyniVerse Update", url = "https://zyverse.in"] = process.argv.slice(2);

if (!WEBHOOK_URL) {
  console.error("Set DISCORD_WEBHOOK_URL (from Discord Server Settings → Integrations → Webhooks).");
  process.exit(1);
}

const payload = {
  username: "ZyniVerse",
  avatar_url: "https://zyverse.in/logo.png",
  embeds: [
    {
      color: 0xd946ef,
      title: String(title),
      url: String(url),
      description: "Join the conversation on ZyniVerse — India's #1 anime platform.",
      footer: { text: "zyverse.in" },
      timestamp: new Date().toISOString(),
    },
  ],
};

fetch(WEBHOOK_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
})
  .then((res) => {
    if (!res.ok) throw new Error(`Webhook returned ${res.status}`);
    console.log("Webhook sent ✓");
  })
  .catch((e) => {
    console.error("Failed to send webhook:", e.message);
    process.exit(1);
  });
