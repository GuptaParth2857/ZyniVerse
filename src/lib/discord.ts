export const DISCORD_SHARE_URL = "https://discord.com/share";

export function buildDiscordShareLink(data: {
  title: string;
  url: string;
  description?: string;
}): string {
  const params = new URLSearchParams({
    text: `${data.title}${data.description ? ` - ${data.description}` : ""}\n${data.url}`,
  });
  return `${DISCORD_SHARE_URL}?${params.toString()}`;
}

export function buildDiscordEmbed(data: {
  title: string;
  url: string;
  description?: string;
  imageUrl?: string;
  color?: number;
}) {
  return {
    title: data.title,
    url: data.url,
    description: data.description || "",
    image: data.imageUrl ? { url: data.imageUrl } : undefined,
    color: data.color || 0x29f2e0,
    footer: { text: "ZyniVerse" },
  };
}

export function generateDiscordWebhookPayload(data: {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
}) {
  return {
    embeds: [
      buildDiscordEmbed({
        title: data.title,
        description: data.description,
        url: data.url,
        imageUrl: data.imageUrl,
        color: 0x29f2e0,
      }),
    ],
  };
}
