export interface NewsDeskFact {
  label: string;
  value: string;
}

export interface NewsDeskLink {
  label: string;
  href: string;
}

export interface NewsDeskItem {
  slug: string;
  title: string;
  category: "Dub Release" | "Announcement" | "Schedule" | "Industry";
  source: string;
  publishedAt: string;
  tags: string[];
  summary: string;
  body: string[];
  facts: NewsDeskFact[];
  links: NewsDeskLink[];
}

export const NEWS_DESK: NewsDeskItem[] = [
  {
    slug: "iruma-kun-season-3-hindi-dub-muse-india",
    title: "Welcome to Demon School! Iruma-kun Season 3 Now Streaming in Hindi — New Episodes Daily",
    category: "Dub Release",
    source: "Muse India (YouTube)",
    publishedAt: "2026-08-30T12:00:00+05:30",
    tags: ["Hindi Dub", "Muse India", "Iruma-kun", "Shounen", "School"],
    summary:
      "Season 3 of Welcome to Demon School! Iruma-kun is streaming on Muse India with a Hindi dub, and a fresh episode lands every day at 8:30 PM IST.",
    body: [
      "Welcome to Demon School! Iruma-kun Season 3 is now live in Hindi on the official Muse India YouTube channel — yet another addition to the free home base of Indian anime fans. New dubbed episodes arrive daily at 8:30 PM IST, so the season is one to catch as it airs rather than let pile up.",
      "Arriving late is not a problem. Season 1 and Season 2 of the series are already available in Hindi and other regional dubs on both Muse India and JioHotstar, so the full story so far is one binge away. The show follows Iruma Suzuki, a teenager sold by his parents to the demon realm, who ends up enrolled in the Babyls School for Demons and learns that genuine kindness there is treated as a scandalous superpower.",
      "It is a Comedy-Fantasy-School title with Supernatural and Adventure flavours, and the Hindi track is being produced by Muse India's own dub studio. On IMDb the series holds a solid 7.6/10.",
    ],
    facts: [
      { label: "Dubbing Studio", value: "Muse dub" },
      { label: "IMDb Rating", value: "7.6/10" },
      { label: "Release Cadence", value: "Daily at 8:30 PM IST" },
      { label: "Language", value: "Hindi" },
      { label: "Available On", value: "Muse India (YouTube), JioHotstar" },
    ],
    links: [
      { label: "Browse all Indian dubs", href: "/indian-dubs" },
      { label: "Weekly dub schedule", href: "/dub-schedule" },
    ],
  },
  {
    slug: "mushoku-tensei-season-3-hindi-dub-crunchyroll",
    title: "Mushoku Tensei Season 3 Episode 1 Now Streaming in Hindi on Crunchyroll",
    category: "Dub Release",
    source: "Crunchyroll",
    publishedAt: "2026-08-30T12:05:00+05:30",
    tags: ["Hindi Dub", "Crunchyroll", "Mushoku Tensei", "Isekai"],
    summary:
      "Mushoku Tensei Season 3 is rolling out in Hindi on Crunchyroll — Episode 1 is out now, with new episodes every Sunday at 4:30 PM IST.",
    body: [
      "Mushoku Tensei: Jobless Reincarnation Season 3 is officially underway in Hindi, and Episode 1 is already streaming on Crunchyroll. The season joins a growing list of modern, high-profile anime that Crunchyroll is localising for Indian audiences with only a short delay from the Japanese broadcast.",
      "New Hindi episodes land every Sunday at 4:30 PM IST, giving viewers a fixed weekly slot to keep up. Earlier seasons remain available in Hindi as well, so there is a clean on-ramp for anyone picking the series up fresh.",
    ],
    facts: [
      { label: "Status", value: "Episode 1 airing" },
      { label: "Release Cadence", value: "Sundays 4:30 PM IST" },
      { label: "Language", value: "Hindi" },
      { label: "Platform", value: "Crunchyroll" },
    ],
    links: [
      { label: "Weekly dub schedule", href: "/dub-schedule" },
      { label: "All Hindi, Tamil & Telugu dubs", href: "/indian-dubs" },
    ],
  },
  {
    slug: "bleach-tybw-calamity-hindi-dub-anione-india",
    title: "Bleach: Thousand-Year Blood War Final Part 'The Calamity' — Episode 1 Out, Hindi on AniOne India",
    category: "Dub Release",
    source: "VIZ Media / AniOne India",
    publishedAt: "2026-08-30T12:10:00+05:30",
    tags: ["Hindi Dub", "Bleach", "AniOne India", "Final Arc"],
    summary:
      "The final part of Bleach: Thousand-Year Blood War has premiered on Disney+ and Hulu, and Episode 1 is streaming in Hindi on the AniOne India YouTube channel.",
    body: [
      "Bleach: Thousand-Year Blood War is closing out with its final part, 'The Calamity', and Episode 1 is now available on Disney+ and Hulu following the confirmation from VIZ Media. For Hindi-speaking viewers, AniOne India is already streaming Episode 1 in Hindi on its YouTube channel, which means the finale arc can be watched free and in your language.",
      "Thousand-Year Blood War is the long-delayed adaptation of the last arc of Tite Kubo's Bleach manga, wrapping up Ichigo Kurosaki's war against the Quincies and their all-powerful overseer Yhwach. It is the reason Bleach is remembered as having one of anime's strongest final stretches.",
      "Need the full picture before diving in? A complete chronological watch order for Bleach is available here on ZyniVerse.",
    ],
    facts: [
      { label: "Episode", value: "Episode 1 (Final Part)" },
      { label: "Global Platforms", value: "Disney+, Hulu" },
      { label: "Hindi", value: "AniOne India (YouTube)" },
      { label: "Source", value: "VIZ Media" },
    ],
    links: [
      { label: "Bleach watch order", href: "/watch-order/bleach" },
      { label: "Weekly dub schedule", href: "/dub-schedule" },
    ],
  },
  {
    slug: "jujutsu-kaisen-season-4-culling-game-part-2-key-visual",
    title: "Jujutsu Kaisen Season 4 Reveals New Key Visual at JUJUFEST 2026",
    category: "Announcement",
    source: "JUJUFEST 2026",
    publishedAt: "2026-08-30T12:15:00+05:30",
    tags: ["Jujutsu Kaisen", "Season 4", "Announcement", "Culling Game"],
    summary:
      "Day 1 of JUJUFEST 2026 unveiled the first key visual for Jujutsu Kaisen Season 4 (Culling Game Part 2), and Day 2 is expected to bring a possible release date.",
    body: [
      "The rollout for Jujutsu Kaisen Season 4 — the adaptation of Culling Game Part 2 — just went official. Day 1 of JUJUFEST 2026 revealed a brand-new key visual for the season, making clear that production is firmly underway.",
      "Day 2 of the event is expected to carry the bigger announcements, including a possible release date for Season 4 and additional staff and cast details. If the recent JUJUFEST pattern holds, the second day is where the season finally gets a calendar anchor.",
      "While the new season assembles, all 48 episodes of Jujutsu Kaisen remain fully dubbed in Hindi on Crunchyroll for anyone catching up.",
    ],
    facts: [
      { label: "Event", value: "JUJUFEST 2026" },
      { label: "Arc", value: "Culling Game Part 2" },
      { label: "Status", value: "Key visual revealed" },
      { label: "Next", value: "Day 2 announcements, possible release date" },
    ],
    links: [
      { label: "JJK Hindi dub guide", href: "/indian-dubs/jujutsu-kaisen-hindi-dub" },
      { label: "Weekly dub schedule", href: "/dub-schedule" },
    ],
  },
];

export const getNewsDeskItem = (slug: string): NewsDeskItem | null =>
  NEWS_DESK.find((n) => n.slug === slug) || null;