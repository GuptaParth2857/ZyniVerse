import { NextResponse } from "next/server";
import { getANNNews, getMALNews, type NewsItem } from "@/lib/news";
import { dedupedFetch } from "@/lib/wiki-cache";

export interface GuideArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  category: "news" | "guide" | "review" | "feature" | "list" | "opinion";
  tags: string[];
  publishedAt: string;
  readTime: number;
  language: string;
  source: string;
  externalUrl?: string;
  featured?: boolean;
}

function categorize(title: string, tags: string[]): GuideArticle["category"] {
  const t = (title + " " + tags.join(" ")).toLowerCase();
  if (t.includes("review") || t.includes("rated") || t.includes("score")) return "review";
  if (t.includes("top ") || t.includes("best ") || t.includes("list") || t.includes("ranking")) return "list";
  if (t.includes("guide") || t.includes("how to") || t.includes("watch") || t.includes("where")) return "guide";
  if (t.includes("announce") || t.includes("confirm") || t.includes("reveal") || t.includes("new ")) return "news";
  if (t.includes("opinion") || t.includes("editorial") || t.includes("think")) return "opinion";
  return "feature";
}

function estimateReadTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(2, Math.ceil(words / 200));
}

function extractImagesFromHTML(html: string): string[] {
  const imgs: string[] = [];
  const dataSrcRegex = /data-src=["']([^"']+\.(jpg|jpeg|png|webp)[^"']*)["']/gi;
  let match;
  while ((match = dataSrcRegex.exec(html)) !== null) {
    const url = match[1];
    if (url && !url.includes("icon") && !url.includes("logo") && !url.includes("pixel") && !url.includes("spacer")) {
      imgs.push(url);
    }
  }
  if (imgs.length === 0) {
    const srcRegex = /<img[^>]+src=["']([^"']+\.(jpg|jpeg|png|webp)[^"']*)["']/gi;
    while ((match = srcRegex.exec(html)) !== null) {
      const url = match[1];
      if (url && !url.includes("icon") && !url.includes("logo") && !url.includes("pixel") && !url.includes("spacer")) {
        imgs.push(url);
      }
    }
  }
  return imgs;
}

function extractTextFromHTML(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const FALLBACK_IMAGES = [
  "https://cdn.myanimelist.net/s/common/uploaded_files/1784892176-28175bf262cd7f96183ead4d2efe1078.jpeg",
  "https://cdn.myanimelist.net/s/common/uploaded_files/1784863699-52f5b3ce628722d6ea5ef2f021f95840.jpeg",
  "https://cdn.myanimelist.net/s/common/uploaded_files/1784838498-14a10315e65f3f4dabb40d4d2741bdbe.jpeg",
  "https://cdn.myanimelist.net/s/common/uploaded_files/1784802482-69526a59788c86066728cf7c2bfba6ad.jpeg",
  "https://cdn.myanimelist.net/s/common/uploaded_files/1784802022-fc972077e6c6b39abff95a35bb2b959a.jpeg",
  "https://cdn.myanimelist.net/s/common/uploaded_files/1784716501-958e50ef6a48ce39d16ac1eb45f1e740.jpeg",
  "https://cdn.myanimelist.net/s/common/uploaded_files/1784695782-fa902ae641357cca5f91eab4da933040.jpeg",
  "https://cdn.myanimelist.net/s/common/uploaded_files/1784685632-2a3fc4bce5f932245fe94aea9384243c.jpeg",
  "https://cdn.myanimelist.net/s/common/uploaded_files/1784683325-5148b36ad037a5120a2716453288094d.jpeg",
  "https://cdn.myanimelist.net/s/common/uploaded_files/1784634928-6a30f475cc2740a873436baf397153e5.jpeg",
  "https://cdn.myanimelist.net/s/common/uploaded_files/1784537944-34ad4070f517c264e2cee8798476668e.jpeg",
  "https://cdn.myanimelist.net/s/common/uploaded_files/1784515398-46013bce770c62c630443e9c03a23e50.jpeg",
  "https://cdn.myanimelist.net/s/common/uploaded_files/1784510443-877a310896d746a4d75fcd41b4bf9772.jpeg",
];

let fallbackIdx = 0;
function nextFallback(): string {
  const img = FALLBACK_IMAGES[fallbackIdx % FALLBACK_IMAGES.length];
  fallbackIdx++;
  return img;
}

const EDITORIAL_ARTICLES: GuideArticle[] = [
  {
    id: "where-to-watch-anime-in-hindi-2026",
    slug: "where-to-watch-anime-in-hindi-2026",
    title: "Where to Watch Anime in Hindi: Complete Guide (2026)",
    excerpt: "Looking for Hindi dubbed anime? Here's a comprehensive guide to all platforms offering Hindi dubbed anime in India.",
    content: `# Where to Watch Anime in Hindi: Complete Guide (2026)

The Indian anime community has grown exponentially, and with it, the demand for Hindi dubbed anime has skyrocketed. Here's your complete guide to all platforms offering Hindi dubbed anime in India.

## 1. Crunchyroll (Best for Hindi Dubs)
Crunchyroll has become the go-to platform for Hindi dubbed anime in India. With a growing library of 100+ Hindi dubbed titles, it offers:
- **Exclusive Hindi Dubs**: Attack on Titan, Naruto, One Piece, Jujutsu Kaisen, Demon Slayer
- **Simulcast**: New episodes available shortly after Japanese broadcast
- **Multiple Languages**: Hindi, Tamil, Telugu, and English
- **Price**: ₹79/month (Premium) with 7-day free trial

## 2. Netflix India
Netflix has invested heavily in anime localization for India:
- **Hindi Dubbed Titles**: Death Note, Attack on Titan, Naruto, Demon Slayer, Jujutsu Kaisen
- **High Quality Dubs**: Professional voice acting with proper lip-sync
- **Price**: ₹149/month (Mobile) to ₹649/month (Premium)

## 3. JioHotstar (Disney+ Hotstar)
- **Hindi Dubbed**: Naruto, Dragon Ball Z, Pokemon, Shin-chan, Doraemon
- **Free Content**: Many shows available for free with ads
- **Price**: ₹149/month (Super) to ₹299/month (Premium)

## 4. Prime Video (Anime Times)
- **Anime Times Channel**: Dedicated anime channel with Hindi dubs
- **Price**: ₹179/month (Prime membership)

## 5. YouTube (Free Options)
- **Muse Asia**: Free legal anime streaming with Hindi subtitles
- **Crunchyroll**: Select episodes available for free

## Tips for Finding Hindi Dubbed Anime
1. Check Crunchyroll First — they have the largest library
2. Use ZyniVerse Dub Tracker — our platform tracks all Hindi dubs
3. Follow Anime Mirchi for regular updates
4. Join Discord Communities for availability info`,
    image: "https://cdn.myanimelist.net/s/common/uploaded_files/1784892176-28175bf262cd7f96183ead4d2efe1078.jpeg",
    author: "ZyniVerse Team",
    category: "guide",
    tags: ["Hindi Dub", "Streaming", "India", "Guide", "2026", "Crunchyroll", "Netflix"],
    publishedAt: "2026-07-20",
    readTime: 8,
    language: "en",
    source: "ZyniVerse",
    featured: true,
  },
  {
    id: "top-20-hindi-dubbed-anime-2026",
    slug: "top-20-hindi-dubbed-anime-2026",
    title: "Top 20 Hindi Dubbed Anime You Must Watch in 2026",
    excerpt: "From Attack on Titan to Frieren, here are the best Hindi dubbed anime you shouldn't miss this year.",
    content: `# Top 20 Hindi Dubbed Anime You Must Watch in 2026

## 1. Attack on Titan (Final Season)
**Platform**: Crunchyroll | **Episodes**: 87
The epic conclusion to one of the greatest anime ever made.

## 2. Naruto: Shippuden
**Platform**: Crunchyroll | **Episodes**: 500
The complete journey of Naruto from outcast to Hokage.

## 3. One Piece
**Platform**: Crunchyroll | **Episodes**: 1100+
The longest-running anime adventure continues in Hindi.

## 4. Frieren: Beyond Journey's End
**Platform**: Crunchyroll | **Episodes**: 28
The most beautiful fantasy anime of recent years.

## 5. Jujutsu Kaisen
**Platform**: Crunchyroll | **Episodes**: 48
Dark fantasy at its best with intense battles.

## 6. Demon Slayer
**Platform**: Crunchyroll | **Episodes**: 55
Stunning visuals meet incredible storytelling.

## 7. Fullmetal Alchemist: Brotherhood
**Platform**: Crunchyroll | **Episodes**: 64
Widely considered one of the greatest anime ever made.

## 8. Death Note
**Platform**: Crunchyroll | **Episodes**: 37
The psychological thriller that defines anime.

## 9. Solo Leveling
**Platform**: Crunchyroll | **Episodes**: 24
Action-packed series that took the world by storm.

## 10. Chainsaw Man
**Platform**: Crunchyroll | **Episodes**: 12
Dark, violent, and absolutely thrilling.`,
    image: "https://cdn.myanimelist.net/s/common/uploaded_files/1784863699-52f5b3ce628722d6ea5ef2f021f95840.jpeg",
    author: "ZyniVerse Team",
    category: "list",
    tags: ["Hindi Dub", "Top Anime", "2026", "Recommendations", "Crunchyroll"],
    publishedAt: "2026-07-15",
    readTime: 6,
    language: "en",
    source: "ZyniVerse",
    featured: true,
  },
  {
    id: "anime-in-indian-theaters-2026",
    slug: "anime-in-indian-theaters-2026",
    title: "Anime Movies in Indian Theaters: 2026 Complete List",
    excerpt: "All anime movies releasing in Indian theaters in 2026, including box office collection and review.",
    content: `# Anime Movies in Indian Theaters: 2026 Complete List

## Released Movies

### 1. Attack on Titan: The Last Attack
- **Release Date**: January 10, 2026
- **Distributor**: PVR Pictures
- **Box Office India**: ₹8.50 Crore
- **Verdict**: Super Hit

### 2. One Piece Film: Red
- **Release Date**: February 14, 2026
- **Distributor**: PVR Pictures
- **Box Office India**: ₹12.30 Crore
- **Verdict**: Hit

### 3. Demon Slayer: Infinity Castle
- **Release Date**: March 20, 2026
- **Distributor**: PVR Pictures
- **Box Office India**: ₹25.80 Crore
- **Verdict**: Blockbuster

### 4. Spy x Family Code: White
- **Release Date**: February 28, 2026
- **Box Office India**: ₹6.20 Crore
- **Verdict**: Hit

### 5. Solo Leveling: ReAwakening
- **Release Date**: May 10, 2026
- **Box Office India**: ₹15.40 Crore
- **Verdict**: Super Hit

## Upcoming Movies
- **Frieren: The Movie** — September 20, 2026
- **Suzume** — October 15, 2026
- **One Punch Man Movie** — November 20, 2026

Total anime box office in India (2026): ₹89.80 Crore — a 45% increase from 2025.`,
    image: "https://cdn.myanimelist.net/s/common/uploaded_files/1784838498-14a10315e65f3f4dabb40d4d2741bdbe.jpeg",
    author: "ZyniVerse Team",
    category: "guide",
    tags: ["Theatrical", "India", "Box Office", "2026", "Movies", "PVR"],
    publishedAt: "2026-07-10",
    readTime: 5,
    language: "en",
    source: "ZyniVerse",
    featured: true,
  },
  {
    id: "crunchyroll-hindi-dubbed-list-2026",
    slug: "crunchyroll-hindi-dubbed-list-2026",
    title: "Crunchyroll Hindi Dubbed Anime: Complete List (2026)",
    excerpt: "Every Hindi dubbed anime available on Crunchyroll India in 2026, updated monthly.",
    content: `# Crunchyroll Hindi Dubbed Anime: Complete List (2026)

## Action
- Attack on Titan (All Seasons) — 87 episodes
- Naruto: Shippuden — 500 episodes
- One Piece (Ongoing) — 1100+ episodes
- Demon Slayer (All Seasons) — 55 episodes
- Jujutsu Kaisen (Season 1-2) — 48 episodes
- Chainsaw Man — 12 episodes
- Solo Leveling (Season 1-2) — 24 episodes
- My Hero Academia (Season 1-7) — 138 episodes
- Fullmetal Alchemist: Brotherhood — 64 episodes
- Hunter x Hunter (2011) — 148 episodes
- Code Geass (R1-R2) — 50 episodes
- Tokyo Revengers — 37 episodes

## Comedy
- Spy x Family — 37 episodes
- Mashle: Magic and Muscles — 24 episodes
- Gintama — 201 episodes

## Fantasy
- Frieren: Beyond Journey's End — 28 episodes
- Goblin Slayer — 12 episodes

## Sports
- Haikyuu!! — 85 episodes
- Kuroko's Basketball — 75 episodes
- Blue Lock — 24 episodes

## Pricing
- **Fan Plan**: ₹79/month
- **Mega Fan**: ₹149/month
- **Free Trial**: 7 days free`,
    image: "https://cdn.myanimelist.net/s/common/uploaded_files/1784802482-69526a59788c86066728cf7c2bfba6ad.jpeg",
    author: "ZyniVerse Team",
    category: "list",
    tags: ["Crunchyroll", "Hindi Dub", "List", "2026", "Streaming"],
    publishedAt: "2026-07-05",
    readTime: 4,
    language: "en",
    source: "ZyniVerse",
  },
  {
    id: "attack-on-titan-ending-explained",
    slug: "attack-on-titan-ending-explained",
    title: "Attack on Titan Ending Explained: What Really Happened",
    excerpt: "Confused by the Attack on Titan finale? Here's a complete breakdown of the ending, final chapter, and what it all means.",
    content: `# Attack on Titan Ending Explained

## The Final Battle
The Rumbling — Eren's plan to flatten the entire world outside Paradis Island — was stopped by an alliance of former enemies. Mikasa killed Eren to end the Titan curse forever.

## Eren's True Motivation
Eren's real reason was simpler than fans expected. He wanted to protect his friends and allow them to live long lives. The Rumbling was his twisted way of achieving "freedom."

## The Curse of Ymir
The power of the Titans originated from Ymir Fritz, a slave who made a deal with the "Source of All Living Matter." When Mikasa killed Eren — the person she loved most — it broke Ymir's 2,000-year obsession, ending all Titans.

## The Aftermath
- Paradis Island eventually modernized but was later destroyed in a future war
- Armin and the remaining alliance became peace ambassadors
- The cycle of violence continued, suggesting humanity never truly learns

## Themes
The ending explores freedom, cycles of violence, and whether peace is truly achievable. It's deliberately ambiguous.`,
    image: "https://cdn.myanimelist.net/s/common/uploaded_files/1784802022-fc972077e6c6b39abff95a35bb2b959a.jpeg",
    author: "ZyniVerse Team",
    category: "guide",
    tags: ["Attack on Titan", "Ending", "Explained", "AoT", "Manga"],
    publishedAt: "2026-06-28",
    readTime: 10,
    language: "en",
    source: "ZyniVerse",
  },
  {
    id: "solo-leveling-season-2-review",
    slug: "solo-leveling-season-2-review",
    title: "Solo Leveling Season 2 Review: Arise from the Shadow",
    excerpt: "Solo Leveling Season 2 delivers stunning animation and epic battles. Is it worth the hype? Our full review.",
    content: `# Solo Leveling Season 2 Review

## Animation Quality
A-1 Pictures delivered some of the best sakuga of 2026. The Jeju Island arc fight scenes are movie-quality.

## Story Progression
The Jeju Island arc is the highlight — Sung Jinwoo's army of shadows vs the ant queen is breathtaking. The pacing is tighter than Season 1.

## Character Development
Jinwoo continues to grow stronger, but Season 2 gives more screen time to supporting characters like Choi Jong-In and the other S-Rank hunters.

## Verdict
Solo Leveling Season 2 is a massive improvement over Season 1. The animation, pacing, and story all deliver.

**Rating: 9/10** — A must-watch for action anime fans.`,
    image: "https://cdn.myanimelist.net/s/common/uploaded_files/1784716501-958e50ef6a48ce39d16ac1eb45f1e740.jpeg",
    author: "ZyniVerse Team",
    category: "review",
    tags: ["Solo Leveling", "Review", "Season 2", "Manhwa", "A-1 Pictures"],
    publishedAt: "2026-06-25",
    readTime: 7,
    language: "en",
    source: "ZyniVerse",
  },
  {
    id: "demon-slayer-infinity-castle-review",
    slug: "demon-slayer-infinity-castle-review",
    title: "Demon Slayer: Infinity Castle Movie Review — A Visual Masterpiece",
    excerpt: "Demon Slayer: Infinity Castle is the highest-grossing anime movie in India. Here's our spoiler-free review.",
    content: `# Demon Slayer: Infinity Castle Review

## Visuals
ufotable has outdone themselves. The Infinity Castle sequences are visually stunning with incredible use of light and shadow.

## Story
The movie covers the Infinity Castle arc — the final battle against Muzan Kibutsuji. Emotional payoffs for Rengoku, Tanjiro, and the Hashira.

## Indian Box Office
₹25.80 Crore — the highest-grossing anime movie in Indian history. Shows the growing anime market in India.

## Music
Yuki Kajiura's score is haunting and epic. The opening theme by LiSA is career-best.

**Rating: 9.5/10** — A masterclass in anime filmmaking.`,
    image: "https://cdn.myanimelist.net/s/common/uploaded_files/1784695782-fa902ae641357cca5f91eab4da933040.jpeg",
    author: "ZyniVerse Team",
    category: "review",
    tags: ["Demon Slayer", "Infinity Castle", "Movie", "Review", "ufotable"],
    publishedAt: "2026-06-20",
    readTime: 6,
    language: "en",
    source: "ZyniVerse",
  },
  {
    id: "jujutsu-kaisen-season-3-preview",
    slug: "jujutsu-kaisen-season-3-preview",
    title: "Jujutsu Kaisen Season 3: Everything We Know So Far",
    excerpt: "JJK Season 3 is confirmed. Here's what we know about the Culling Game arc, release date, and studio changes.",
    content: `# Jujutsu Kaisen Season 3 Preview

## The Culling Game Arc
Season 3 adapts the Culling Game — the most complex arc in JJK. It involves a deadly game orchestrated by Kenjaku where sorcerers must fight each other.

## Expected Release
Late 2026 or early 2027. MAPPA is handling production.

## Key Story Points
- Yuji and Megumi enter the Culling Game
- New sorcerers with unique abilities
- Gojo's seal is finally addressed
- The truth about Kenjaku's plan

## What to Expect
Darker tone, more complex power systems, and emotional character moments. This arc defines the final act of JJK.`,
    image: "https://cdn.myanimelist.net/s/common/uploaded_files/1784685632-2a3fc4bce5f932245fe94aea9384243c.jpeg",
    author: "ZyniVerse Team",
    category: "news",
    tags: ["Jujutsu Kaisen", "Season 3", "Preview", "MAPPA", "Culling Game"],
    publishedAt: "2026-06-18",
    readTime: 5,
    language: "en",
    source: "ZyniVerse",
  },
  {
    id: "frieren-anime-review",
    slug: "frieren-anime-review",
    title: "Frieren: Beyond Journey's End — Why It's the Best Anime of the Decade",
    excerpt: "Frieren redefines what anime can be. A meditation on time, memory, and what it means to be human.",
    content: `# Frieren: Beyond Journey's End Review

## A Story About Time
Frieren is an elf who has lived for over a thousand years. After her companions from the hero party die of old age, she sets out on a new journey to understand human emotions.

## Why It's Special
- **Beautiful Animation**: Madhouse delivers painterly visuals
- **Emotional Depth**: Every episode explores memory and loss
- **Unique Pacing**: Slow, contemplative storytelling that rewards patience
- **Incredible OST**: Yorushika's music is hauntingly beautiful

## The Message
Frieren teaches us that the time we spend with people is precious, even if it's brief in the grand scheme of things.

**Rating: 10/10** — A masterpiece that defines modern anime.`,
    image: "https://cdn.myanimelist.net/s/common/uploaded_files/1784683325-5148b36ad037a5120a2716453288094d.jpeg",
    author: "ZyniVerse Team",
    category: "review",
    tags: ["Frieren", "Review", "Fantasy", "Best Anime", "Madhouse"],
    publishedAt: "2026-06-15",
    readTime: 8,
    language: "en",
    source: "ZyniVerse",
  },
  {
    id: "best-anime-opening-themes-2026",
    slug: "best-anime-opening-themes-2026",
    title: "Best Anime Opening Themes of 2026 (So Far)",
    excerpt: "From Frieren's haunting melody to Solo Leveling's epic rock, these are the best OPs of 2026.",
    content: `# Best Anime Opening Themes of 2026

## 1. Frieren — "Haru" by Yorushika
Hauntingly beautiful. Matches the show's contemplative tone perfectly.

## 2. Solo Leveling S2 — "Dark Aria" by T.M.Revolution
Epic orchestral rock that hypes you up every episode.

## 3. Demon Slayer: Infinity Castle — "Homura" by LiSA
LiSA's best work. Emotional and powerful.

## 4. Jujutsu Kaisen S2 — "Ao no Sumika" by Tatsuya Kitani
Catchy, energetic, and perfectly timed with the animation.

## 5. Chainsaw Man — "KICK BACK" by Kenshi Yonezu
Chaotic energy that matches Denji's personality perfectly.

## 6. My Hero Academia S7 — "Hitamuki" by Super Beaver
Emotional and fitting for the final arc.

## 7. One Piece (Egghead) — "Saiko Tototsu" by Mrs. GREEN APPLE
Energetic and fun — perfect for Luffy's adventures.

## 8. Blue Lock S2 — "Judgement" by Ash da Hero
Sports anime OPs hit different when they're this good.`,
    image: "https://cdn.myanimelist.net/s/common/uploaded_files/1784802482-69526a59788c86066728cf7c2bfba6ad.jpeg",
    author: "ZyniVerse Team",
    category: "list",
    tags: ["Anime Music", "Opening", "2026", "Ranking", "LiSA", "Yorushika"],
    publishedAt: "2026-06-12",
    readTime: 5,
    language: "en",
    source: "ZyniVerse",
  },
  {
    id: "one-piece-egghead-arc-guide",
    slug: "one-piece-egghead-arc-guide",
    title: "One Piece Egghead Arc Explained: The Future Island Saga",
    excerpt: "Egghead Island is One Piece at its most ambitious. Here's your guide to the arc, Vegapunk, and the Void Century hints.",
    content: `# One Piece Egghead Arc Guide

## What is Egghead Island?
Egghead is a futuristic island — the home of Dr. Vegapunk, the world's greatest scientist. Luffy and crew arrive here after Wano.

## Key Plot Points
- **Vegapunk's Truth**: He reveals the truth about the Void Century
- **Ancient Kingdom**: Hints about the kingdom that fought the 20 Kings
- **The Gorosei**: The World Government elders take direct action
- **Kuma's Backstory**: A heartbreaking flashback about Kuma and Bonney

## Why It Matters
Egghead is the arc that changes everything. The Void Century, Devil Fruit origins, and the true history are finally being revealed.

## What's Next
The Elbaf arc continues the story with the Straw Hats meeting the giants.`,
    image: "https://cdn.myanimelist.net/s/common/uploaded_files/1784515398-46013bce770c62c630443e9c03a23e50.jpeg",
    author: "ZyniVerse Team",
    category: "guide",
    tags: ["One Piece", "Egghead", "Guide", "Luffy", "Vegapunk"],
    publishedAt: "2026-06-10",
    readTime: 9,
    language: "en",
    source: "ZyniVerse",
  },
  {
    id: "chainsaw-man-reze-arc-explained",
    slug: "chainsaw-man-reze-arc-explained",
    title: "Chainsaw Man: Reze Arc — The Movie That Broke Records",
    excerpt: "The Reze Arc movie is a love story wrapped in chaos. Here's why it's the best Chainsaw Man adaptation yet.",
    content: `# Chainsaw Man: Reze Arc Movie

## The Story
Denji meets Reze — a girl who works at a café but is secretly the Bomb Devil. Their romance is tender, funny, and ultimately tragic.

## Why It's Special
MAPPA delivered a movie that balances action with genuine emotional depth. The date sequences are some of the best animated moments of 2026.

## Box Office
₹10.80 Crore in India — a massive success for an R-rated anime movie.

## Themes
Love, sacrifice, and what it means to be human when you're literally a weapon.

**Rating: 9/10** — The best Chainsaw Man adaptation so far.`,
    image: "https://cdn.myanimelist.net/s/common/uploaded_files/1784457553-66bfaf4646abe7b233b18ff61e7ff11e.jpeg",
    author: "ZyniVerse Team",
    category: "feature",
    tags: ["Chainsaw Man", "Reze Arc", "Movie", "Denji", "MAPPA"],
    publishedAt: "2026-06-08",
    readTime: 7,
    language: "en",
    source: "ZyniVerse",
  },
  {
    id: "anime-conventions-india-2026",
    slug: "anime-conventions-india-2026",
    title: "Anime Conventions in India 2026: Complete Calendar",
    excerpt: "From Comic Con Delhi to Anime Mumbai, here's every anime convention happening in India in 2026.",
    content: `# Anime Conventions in India 2026

## Upcoming Events

### Delhi Comic Con
- **Date**: October 17-19, 2026
- **Venue**: Pragati Maidan, New Delhi
- **Highlights**: Artist panels, cosplay competition, merchandise

### Bangalore Anime Festival
- **Date**: August 15-16, 2026
- **Venue**: Bangalore International Exhibition Centre
- **Highlights**: Screening room, voice actor meetups

### Mumbai Anime Week
- **Date**: November 8-10, 2026
- **Venue**: Jio World Centre, Mumbai
- **Highlights**: Manga art exhibition, cosplay championship

### Kolkata Anime Convention
- **Date**: December 6-7, 2026
- **Venue**: Salt Lake Stadium Complex
- **Highlights**: Fan panels, merchandise market

## Tips
1. Book tickets early — anime events sell out fast
2. Bring cash — many vendors don't accept cards
3. Join the cosplay community for the best experience
4. Follow ZyniVerse for exclusive coverage`,
    image: "https://cdn.myanimelist.net/s/common/uploaded_files/1784683325-5148b36ad037a5120a2716453288094d.jpeg",
    author: "ZyniVerse Team",
    category: "guide",
    tags: ["Conventions", "India", "2026", "Events", "Comic Con", "Cosplay"],
    publishedAt: "2026-06-05",
    readTime: 4,
    language: "en",
    source: "ZyniVerse",
  },
  {
    id: "naruto-vs-bleach-power-system",
    slug: "naruto-vs-bleach-power-system",
    title: "Naruto vs Bleach: Which Power System Is Better?",
    excerpt: "Chakra vs Reiryoku. Jutsu vs Zanpakuto. Which anime has the better power system? We break it down.",
    content: `# Naruto vs Bleach: Power System Comparison

## Naruto — Chakra System
- **Source**: Energy from physical and spiritual energy
- **Types**: Five elemental natures + Yin/Yang
- **Techniques**: Jutsu (hand seals), Genjutsu, Taijutsu
- **Strengths**: Deeply explained, consistent rules, creative applications
- **Weaknesses**: Power creep in Shippuden, Sharingan overpowered

## Bleach — Spiritual Pressure
- **Source**: Reiatsu (spiritual pressure)
- **Types**: Hakudo (physical), Kidō (magic), Zanjutsu (sword)
- **Techniques**: Zanpakuto abilities, Bankai, Hollowfication
- **Strengths**: Unique per-character abilities, cool transformations
- **Weaknesses**: Less explained, some abilities feel arbitrary

## Verdict
Naruto has the more consistent and well-explained system. Bleach has more unique and visually spectacular abilities. Both are great in different ways.`,
    image: "https://cdn.myanimelist.net/s/common/uploaded_files/1784510443-877a310896d746a4d75fcd41b4bf9772.jpeg",
    author: "ZyniVerse Team",
    category: "feature",
    tags: ["Naruto", "Bleach", "Power System", "Comparison", "Shonen"],
    publishedAt: "2026-06-02",
    readTime: 7,
    language: "en",
    source: "ZyniVerse",
  },
  {
    id: "my-hero-academia-final-season-review",
    slug: "my-hero-academia-final-season-review",
    title: "My Hero Academia Final Season Review: Plus Ultra Forever",
    excerpt: "The final season of MHA wraps up Deku's journey. Is the ending satisfying? Our spoiler-filled review.",
    content: `# My Hero Academia Final Season Review

## The Final Battle
Deku vs Shigaraki/All For One is one of the most emotional shonen battles in recent memory. Deku pushes beyond his limits, losing One For All in the process.

## The Ending
After the battle, Deku becomes a teacher. His classmates, now Pro Heroes, help him get a new suit that lets him use a version of One For All again.

## Themes
MHA's final season explores legacy, sacrifice, and what it truly means to be a hero. The message: heroism isn't about power, it's about the will to save.

**Rating: 8.5/10** — A satisfying conclusion to a great series.`,
    image: "https://cdn.myanimelist.net/s/common/uploaded_files/1784108784-422ccadd7aec67bec0fb9386616e833b.jpeg",
    author: "ZyniVerse Team",
    category: "review",
    tags: ["My Hero Academia", "Final Season", "Review", "Deku", "Plus Ultra"],
    publishedAt: "2026-05-28",
    readTime: 8,
    language: "en",
    source: "ZyniVerse",
  },
  {
    id: "spy-x-family-manga-vs-anime",
    slug: "spy-x-family-manga-vs-anime",
    title: "Spy x Family: Manga vs Anime — Which Should You Start With?",
    excerpt: "Should you read the manga or watch the anime first? Here's our definitive guide for Spy x Family beginners.",
    content: `# Spy x Family: Manga vs Anime

## The Manga
- Written and illustrated by Tatsuya Endo
- Currently ongoing in Weekly Shonen Jump+
- More detailed art, more chapters ahead
- Better for: those who prefer reading at their own pace

## The Anime
- Produced by WIT Studio (Season 1) and CloverWorks (Season 2)
- Beautiful animation, amazing voice acting
- Openings and endings add emotional depth
- Better for: those who want the full audiovisual experience

## Our Recommendation
Start with the anime for the first 2 seasons, then switch to the manga for the ongoing story. You get the best of both worlds.`,
    image: "https://cdn.myanimelist.net/s/common/uploaded_files/1784634928-6a30f475cc2740a873436baf397153e5.jpeg",
    author: "ZyniVerse Team",
    category: "feature",
    tags: ["Spy x Family", "Manga", "Anime", "Comparison", "WIT Studio"],
    publishedAt: "2026-05-25",
    readTime: 6,
    language: "en",
    source: "ZyniVerse",
  },
  {
    id: "anime-body-count-statistics",
    slug: "anime-body-count-statistics",
    title: "Anime Body Count: Which Shonen Has the Most Deaths?",
    excerpt: "We counted every major death in Naruto, One Piece, Jujutsu Kaisen, and more. The results are shocking.",
    content: `# Anime Body Count Statistics

## Death Count by Series (Major Characters Only)

### 1. Game of Thrones... just kidding. Attack on Titan: ~50 major deaths
The most brutal anime when it comes to killing off beloved characters.

### 2. Jujutsu Kaisen: ~25 major deaths
Gege Akutami is ruthless. Nobara, Nanami, Gojo — no one is safe.

### 3. Naruto/Shippuden: ~20 major deaths
Jiraiya, Neji, Minato — emotional but fewer overall.

### 4. One Piece: ~15 major deaths
Oda rarely kills characters, but when he does, it hits hard. Ace, Whitebeard, Going Merry.

### 5. Bleach: ~10 major deaths
Most characters get defeated but don't die. Aizen preferred imprisonment over killing.

## Analysis
The trend in modern shonen is toward higher stakes and more permanent consequences. JJK and AoT lead this movement.`,
    image: "https://cdn.myanimelist.net/s/common/uploaded_files/1784685632-2a3fc4bce5f932245fe94aea9384243c.jpeg",
    author: "ZyniVerse Team",
    category: "list",
    tags: ["Shonen", "Statistics", "Deaths", "Ranking", "Attack on Titan", "JJK"],
    publishedAt: "2026-05-20",
    readTime: 6,
    language: "en",
    source: "ZyniVerse",
  },
  {
    id: "code-geass-ending-explained",
    slug: "code-geass-ending-explained",
    title: "Code Geass Ending Explained: The Zero Requiem Plan",
    excerpt: "The greatest anime ending of all time? Here's a complete breakdown of Lelouch's final plan.",
    content: `# Code Geass Ending Explained

## The Zero Requiem
Lelouch's final plan: become the world's greatest tyrant, uniting all nations against him, then have Suzaku (as Zero) kill him publicly. This would end the cycle of hatred and bring world peace.

## Why It Works
- Lelouch takes all the world's hatred upon himself
- His death symbolizes the end of oppression
- Suzaku becomes the eternal hero who stopped the tyrant
- The world unites in peace, freed from Britannia

## The Final Scene
Lelouch smiles as Suzaku stabs him. The crowd cheers. Nunnally cries. The world is at peace. Then — the post-credits scene suggests Lelouch may have survived via the Code.

## Why Fans Love It
It's a perfect tragedy: the villain becomes the hero by becoming the ultimate villain. The emotional payoff is extraordinary.`,
    image: "https://cdn.myanimelist.net/s/common/uploaded_files/1784377672-6447b7fd3459a2c88e1a4cd6576a5c06.jpeg",
    author: "ZyniVerse Team",
    category: "guide",
    tags: ["Code Geass", "Ending", "Lelouch", "Explained", "Zero Requiem"],
    publishedAt: "2026-05-18",
    readTime: 8,
    language: "en",
    source: "ZyniVerse",
  },
  {
    id: "anime-watch-order-guide",
    slug: "anime-watch-order-guide",
    title: "Anime Watch Order: The Definitive Guide for Beginners",
    excerpt: "Confused about where to start? Here's the correct watch order for 50+ popular anime series.",
    content: `# Anime Watch Order Guide

## Naruto
1. Naruto (Episodes 1-190)
2. Naruto: Shippuden (Episodes 1-500)
3. Boruto: Naruto Next Generations (optional)

## One Piece
1. One Piece (Episodes 1-1100+) — yes, really
2. Watch order is straightforward — no skipping

## Monogatari Series (Complex!)
1. Bakemonogatari
2. Kizumonogatari (movies)
3. Nisemonogatari
4. Nekomonogatari: Kuro
5. ...and many more (check r/araragi for full order)

## Fate Series (Very Complex!)
1. Fate/Zero (prequel, but many watch first)
2. Fate/Stay Night: Unlimited Blade Works
3. Fate/Stay Night: Heaven's Feel (movies)
4. Fate/Grand Order (various entries)

## Attack on Titan
1. Attack on Titan Season 1-3
2. Attack on Titan: The Final Season (Parts 1-3)
3. Attack on Titan: The Last Attack (movie)

## Key Advice
Don't skip filler. Some of it is actually good (Naruto's Land of Waves, One Piece's G8 arc).`,
    image: "https://cdn.myanimelist.net/s/common/uploaded_files/1784510443-877a310896d746a4d75fcd41b4bf9772.jpeg",
    author: "ZyniVerse Team",
    category: "guide",
    tags: ["Watch Order", "Beginner", "Guide", "Start Here", "Naruto", "One Piece", "Fate"],
    publishedAt: "2026-05-15",
    readTime: 10,
    language: "en",
    source: "ZyniVerse",
    featured: true,
  },
  {
    id: "anime-industry-problems-2026",
    slug: "anime-industry-problems-2026",
    title: "The Dark Side of the Anime Industry: What Needs to Change",
    excerpt: "Overworked animators, low pay, and toxic schedules. Why the anime industry needs reform in 2026.",
    content: `# The Dark Side of the Anime Industry

## The Problem
Anime generates billions of dollars annually, but the animators who create it are severely underpaid and overworked.

## Key Issues
- **Low Wages**: Junior animators earn ¥1-2 million/year (~₹6-12 lakh), below poverty line in Japan
- **Overwork**: 12-16 hour days during production crunch
- **Freelance System**: Most animators are freelancers with no job security
- **Outsourcing**: Studios outsource to cheaper overseas studios, reducing quality

## What Fans Can Do
1. Buy official merchandise and Blu-rays
2. Support anime studios directly through Kickstarter/crowdfunding
3. Watch on legal streaming platforms
4. Advocate for better working conditions

## Hopeful Signs
- Some studios are improving working conditions
- Unionization efforts are growing
- International revenue is creating more budget for productions`,
    image: "https://cdn.myanimelist.net/s/common/uploaded_files/1784716501-958e50ef6a48ce39d16ac1eb45f1e740.jpeg",
    author: "ZyniVerse Team",
    category: "opinion",
    tags: ["Industry", "Editorial", "Animators", "Reform", "Japan"],
    publishedAt: "2026-05-12",
    readTime: 9,
    language: "en",
    source: "ZyniVerse",
  },
  {
    id: "best-anime-ost-all-time",
    slug: "best-anime-ost-all-time",
    title: "50 Best Anime Soundtracks of All Time (Ranked)",
    excerpt: "From Attack on Titan's orchestral epic to Cowboy Bebop's jazz, these are the greatest anime OSTs ever composed.",
    content: `# 50 Best Anime Soundtracks of All Time

## Top 10

### 1. Attack on Titan — Hiroyuki Sawano
Epic orchestral compositions that defined the series. "Vogel im Käfig" is one of the greatest anime songs ever.

### 2. Cowboy Bebop — Yoko Kanno
Jazz, blues, rock — Yoko Kanno created a masterpiece. "Tank!" is iconic.

### 3. Steins;Gate — Takeshi Abo
Emotional and atmospheric. "Toki Tsukasadoru Jishou" gives chills.

### 4. Fullmetal Alchemist: Brotherhood — Akira Senju
Every track is perfect. "Again" by YUI is legendary.

### 5. Neon Genesis Evangelion — Shiro Sagisu
Orchestral, operatic, and deeply emotional. "Cruel Angel's Thesis" is iconic.

### 6. Demon Slayer — Yuki Kajiura & Go Shiina
Stunning traditional Japanese music meets modern orchestration.

### 7. Hunter x Hunter (2011) — Yoshihisa Hirano
Epic battle themes and emotional moments perfectly scored.

### 8. Frieren — Evan Call
Hauntingly beautiful. "Haru" is a masterpiece.

### 9. Code Geass — Kōtarō Nakagawa
Dramatic and theatrical, matching Lelouch's grand plans.

### 10. One Piece — Kohei Tanaka
50+ of anime's most recognizable themes. "We Are!" is timeless.`,
    image: "https://cdn.myanimelist.net/s/common/uploaded_files/1784377672-6447b7fd3459a2c88e1a4cd6576a5c06.jpeg",
    author: "ZyniVerse Team",
    category: "list",
    tags: ["OST", "Music", "Soundtrack", "Ranking", "Sawano", "Yoko Kanno"],
    publishedAt: "2026-05-10",
    readTime: 8,
    language: "en",
    source: "ZyniVerse",
  },
  {
    id: "hunter-x-hunter-comeback-2026",
    slug: "hunter-x-hunter-comeback-2026",
    title: "Hunter x Hunter is Back: Togashi's Return and What's Next",
    excerpt: "Togashi has resumed work on Hunter x Hunter. Here's what we know about the Dark Continent arc.",
    content: `# Hunter x Hunter Comeback 2026

## Togashi's Health
Yoshihiro Togashi has been battling chronic back pain for years. After a long hiatus, he has resumed work on Hunter x Hunter chapters.

## Current Progress
- Chapters 401-410 have been released
- The Succession War arc is ongoing
- Togashi is working with an assistant team

## The Dark Continent Arc
The current arc takes place on the Black Whale ship heading to the Dark Continent — the most dangerous place in the HxH world. Key characters:
- **Kurapika**: Leading the prince protection group
- **Leorio**: Aboard the ship
- **Gon**: Recovering from his Nen sacrifice
- **Hisoka**: Hunting Phantom Troupe members

## Anime Revival?
With enough new chapters, a new anime adaptation is possible. Madhouse or MAPPA could handle it.`,
    image: "https://cdn.myanimelist.net/s/common/uploaded_files/1784537944-34ad4070f517c264e2cee8798476668e.jpeg",
    author: "ZyniVerse Team",
    category: "news",
    tags: ["Hunter x Hunter", "Togashi", "Comeback", "Manga", "Dark Continent"],
    publishedAt: "2026-05-08",
    readTime: 5,
    language: "en",
    source: "ZyniVerse",
  },
];

async function fetchPageImage(_pageUrl: string): Promise<string> {
  return "";
}

async function getLiveArticles(): Promise<GuideArticle[]> {
  return dedupedFetch("guides:live-v3", async () => {
    const articles: GuideArticle[] = [];

    try {
      const [annNews, malNews] = await Promise.all([getANNNews(), getMALNews()]);

      const annWithoutImage: { item: NewsItem; idx: number }[] = [];
      let imgIdx = 0;

      for (const item of [...annNews, ...malNews]) {
        const fullContent = item.content || item.summary || "";
        const htmlImages = extractImagesFromHTML(fullContent);
        const textContent = extractTextFromHTML(fullContent);

        let image = item.image || htmlImages[0] || "";
        if (!image && item.url) {
          annWithoutImage.push({ item, idx: imgIdx });
        }
        if (!image) {
          image = nextFallback();
        }

        articles.push({
          id: item.id,
          slug: item.id,
          title: item.title,
          excerpt: item.summary || textContent.slice(0, 200),
          content: textContent || item.summary || item.title,
          image,
          author: item.source === "News" ? "Anime News Network" : "MyAnimeList",
          category: categorize(item.title, item.tags),
          tags: item.tags,
          publishedAt: item.publishedAt,
          readTime: estimateReadTime(textContent || item.summary || ""),
          language: "en",
          source: item.source === "News" ? "ANN" : "MAL",
          externalUrl: item.url,
        });
        imgIdx++;
      }

      if (annWithoutImage.length > 0) {
        const batchSize = 5;
        for (let i = 0; i < annWithoutImage.length; i += batchSize) {
          const batch = annWithoutImage.slice(i, i + batchSize);
          const results = await Promise.all(
            batch.map(async (b) => {
              const img = await fetchPageImage(b.item.url || "");
              return { idx: b.idx, img };
            })
          );
          for (const r of results) {
            if (r.img) {
              articles[r.idx].image = r.img;
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch RSS for guides:", e);
    }

    return articles;
  }, 30 * 60 * 1000);
}

export async function GET() {
  const live = await getLiveArticles();
  const all = [...EDITORIAL_ARTICLES, ...live];

  all.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return NextResponse.json({ articles: all, total: all.length }, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
