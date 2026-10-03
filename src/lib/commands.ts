/**
 * Command palette registry.
 *
 * This is deliberately a hand-curated list rather than something generated from
 * the filesystem. A generated list would happily offer `/adminusers` and
 * `/wikicreate` to signed-out visitors, would carry no synonyms ("wl" for
 * watchlist, "wa" for wallpapers), and would rot the moment a route moved.
 * Curating by hand costs an afternoon and is what makes the palette feel like
 * it understands what you meant.
 *
 * Keep it in sync when adding routes — `src/__tests__/commands.test.ts` asserts
 * that every path here actually resolves to a real page, so a typo or a stale
 * entry fails the test suite instead of silently offering a dead link.
 */

export const COMMAND_GROUPS = [
  "Discover",
  "Anime",
  "Track",
  "Community",
  "Contests",
  "Read",
  "Watch",
  "Create",
  "Reference",
  "Tools",
  "Account",
  "Clubs",
] as const;

export type CommandGroup = (typeof COMMAND_GROUPS)[number];

export interface Command {
  /** Stable id, also used as the React key. */
  id: string;
  label: string;
  path: string;
  group: CommandGroup;
  /** Extra search terms that are not in the label. */
  keywords?: string;
  emoji?: string;
  /** Shown under the label when there is room. */
  description?: string;
  /** Only offer to admins. */
  adminOnly?: boolean;
  /** Only offer to signed-in users. */
  auth?: boolean;
  /** Rendered as a keyboard hint, e.g. "G then T". */
  hotkey?: string;
}

export const COMMANDS: Command[] = [
  // ── Discover ───────────────────────────────────────────────────────────────
  { id: "home", label: "Home", path: "/", group: "Discover", keywords: "home start main feed", emoji: "🏠" },
  { id: "discover", label: "Discover", path: "/discover", group: "Discover", keywords: "find explore new", emoji: "🧭" },
  { id: "seasonal", label: "Seasonal", path: "/seasonal", group: "Discover", keywords: "this season current now", emoji: "🍂" },
  { id: "seasonal-tracker", label: "Seasonal Tracker", path: "/seasonal-tracker", group: "Discover", keywords: "follow season track progress", emoji: "📆" },
  { id: "calendar", label: "Calendar", path: "/calendar", group: "Discover", keywords: "airing schedule dates", emoji: "📅" },
  { id: "schedule", label: "Schedule", path: "/schedule", group: "Discover", keywords: "broadcast when airs", emoji: "📺" },
  { id: "random", label: "Random Anime", path: "/random", group: "Discover", keywords: "surprise me shuffle roulette dice", emoji: "🎲" },
  { id: "recommendations", label: "Recommendations", path: "/recommendations", group: "Discover", keywords: "suggestions for you picks", emoji: "✨" },
  { id: "popular-characters", label: "Popular Characters", path: "/popular-characters", group: "Discover", keywords: "famous best loved characters", emoji: "❤️" },

  // ── Anime ──────────────────────────────────────────────────────────────────
  { id: "search", label: "Search", path: "/search", group: "Anime", keywords: "find lookup query", emoji: "🔍", hotkey: "/" },
  { id: "top-anime", label: "Top Anime", path: "/top-anime", group: "Anime", keywords: "best anime ranked chart popular trending greatest", emoji: "🏆" },
  { id: "genre", label: "Genres", path: "/genre/shounen", group: "Anime", keywords: "action romance comedy category shounen", emoji: "🎭" },
  { id: "tags", label: "Tags", path: "/tags", group: "Anime", keywords: "themes motifs descriptors", emoji: "🏷️" },
  { id: "themes", label: "Theme Songs", path: "/themes", group: "Anime", keywords: "opening ending op ed", emoji: "🎵" },
  { id: "a-z", label: "A–Z Index", path: "/a-z", group: "Anime", keywords: "alphabet browse index letters", emoji: "🔤" },
  { id: "anime-night", label: "Anime Night", path: "/anime-night", group: "Anime", keywords: "binge marathon late night" },
  { id: "live-action", label: "Live Action", path: "/live-action", group: "Anime", keywords: "real people adaptation", emoji: "🎬" },
  { id: "characters", label: "Characters", path: "/characters", group: "Anime", keywords: "cast people roster", emoji: "🧑‍🎤" },
  { id: "character-traits", label: "Character Trait Search", path: "/characters/trait-search", group: "Anime", keywords: "personality search find", emoji: "🧬" },
  { id: "backlog", label: "Backlog", path: "/backlog", group: "Anime", keywords: "unwatched pile someday todo catch up", emoji: "📚" },
  { id: "manga-million", label: "Manga Million", path: "/manga-million", group: "Anime", keywords: "quiz challenge million", emoji: "💯" },

  // ── Track ──────────────────────────────────────────────────────────────────
  { id: "watchlist", label: "Watchlist", path: "/watchlist", group: "Track", keywords: "wl my list watch progress", emoji: "📺" },
  { id: "status", label: "My Anime Status", path: "/status", group: "Track", keywords: "watching completed dropped progress", emoji: "📊" },
  { id: "watch-order", label: "Watch Order", path: "/watch-order", group: "Track", keywords: "order to watch sequence", emoji: "1️⃣" },
  { id: "doujin-mine", label: "My Doujin", path: "/doujinshi/mine", group: "Track", keywords: "favorites saved doujinshi", emoji: "🔞" },
  { id: "my-characters", label: "My Characters", path: "/my-characters", group: "Track", keywords: "favourites favorites collection", emoji: "⭐" },
  { id: "saved", label: "Saved", path: "/saved", group: "Track", keywords: "bookmarks saved items", emoji: "🔖" },
  { id: "shared-watchlists", label: "Shared Watchlists", path: "/shared-watchlists", group: "Track", keywords: "collaborate shared team list", emoji: "👥" },
  { id: "lists", label: "Lists", path: "/lists", group: "Track", keywords: "collections curated list", emoji: "📔" },
  { id: "tierlist", label: "Tier Lists", path: "/tierlist", group: "Track", keywords: "s tier ranking rank", emoji: "📊" },
  { id: "my-orders", label: "My Orders", path: "/my-orders", group: "Track", keywords: "merch purchases shipping", emoji: "📦", auth: true },

  // ── Community ──────────────────────────────────────────────────────────────
  { id: "forum", label: "Forum", path: "/forum", group: "Community", keywords: "discussions threads talk", emoji: "💬" },
  { id: "forum-create", label: "New Thread", path: "/forum/create", group: "Community", keywords: "post start discussion", emoji: "✍️", auth: true },
  { id: "posts", label: "Posts", path: "/posts", group: "Community", keywords: "feed timeline", emoji: "📰" },
  { id: "messages", label: "Messages", path: "/messages", group: "Community", keywords: "dm chat inbox private", emoji: "💌", auth: true },
  { id: "notifications", label: "Notifications", path: "/notifications", group: "Community", keywords: "alerts bell inbox", emoji: "🔔", auth: true },
  { id: "friends", label: "Friends", path: "/friends", group: "Community", keywords: "connections following", emoji: "🤝", auth: true },
  { id: "activity", label: "Activity", path: "/activity", group: "Community", keywords: "history recent what i did", emoji: "🕐" },
  { id: "moments", label: "Moments", path: "/moments", group: "Community", keywords: "short posts updates", emoji: "⚡" },
  { id: "critiques", label: "Critiques", path: "/critiques", group: "Community", keywords: "analysis essay deep dive", emoji: "🔬" },
  { id: "theories", label: "Theories", path: "/theories", group: "Community", keywords: "speculation predictions", emoji: "🧠" },
  { id: "polls", label: "Polls", path: "/polls", group: "Community", keywords: "vote survey", emoji: "📊" },
  { id: "challenges", label: "Challenges", path: "/challenges", group: "Community", keywords: "goals streaks", emoji: "🎯" },
  { id: "blog", label: "Blog", path: "/blog", group: "Community", keywords: "articles writing", emoji: "📝" },
  { id: "news", label: "News", path: "/news", group: "Community", keywords: "headlines updates industry", emoji: "📰" },
  { id: "events", label: "Events", path: "/events", group: "Community", keywords: "gatherings meetups", emoji: "🎪" },
  { id: "conventions", label: "Conventions", path: "/conventions", group: "Community", keywords: "comiket expo cons", emoji: "🎫" },
  { id: "feedback", label: "Feedback", path: "/feedback", group: "Community", keywords: "suggestions bugs report", emoji: "📣" },

  // ── Contests ───────────────────────────────────────────────────────────────
  { id: "leaderboard", label: "Leaderboard", path: "/leaderboard", group: "Contests", keywords: "rankings scores top players", emoji: "🏅" },
  { id: "tournaments", label: "Character Tournaments", path: "/character-tournaments", group: "Contests", keywords: "bracket battle versus duel", emoji: "⚔️" },
  { id: "characters-battle", label: "Character Battle", path: "/characters/battle", group: "Contests", keywords: "versus fight compare", emoji: "💥" },
  { id: "awards", label: "Zyni Awards", path: "/awards", group: "Contests", keywords: "oscar nominees winners", emoji: "🏆" },
  { id: "achievements", label: "Achievements", path: "/achievements", group: "Contests", keywords: "badges trophies unlocks", emoji: "🎖️" },
  { id: "bingo", label: "Bingo", path: "/bingo", group: "Contests", keywords: "grid squares challenge", emoji: "🎯" },
  { id: "quiz", label: "Quiz", path: "/quiz", group: "Contests", keywords: "questions trivia test", emoji: "❓" },
  { id: "quiz-daily", label: "Daily Quiz", path: "/quiz/daily", group: "Contests", keywords: "daily challenge today", emoji: "📅" },
  { id: "quiz-personality", label: "Anime Personality", path: "/quiz/personality", group: "Contests", keywords: "which anime character am i test", emoji: "🔮" },
  { id: "quiz-leaderboard", label: "Quiz Leaderboard", path: "/quiz/leaderboard", group: "Contests", keywords: "quiz scores ranking", emoji: "🏅" },
  { id: "wordle", label: "Wordle", path: "/wordle", group: "Contests", keywords: "guess the word daily game", emoji: "🟩" },
  { id: "games", label: "Games", path: "/games", group: "Contests", keywords: "play mini games arcade", emoji: "🎮" },
  { id: "contests", label: "Contests", path: "/contests", group: "Contests", keywords: "competitions entries", emoji: "🏁" },

  // ── Read ───────────────────────────────────────────────────────────────────
  { id: "manga", label: "Manga", path: "/manga", group: "Read", keywords: "comic chapters read", emoji: "📖" },
  { id: "manga-list", label: "My Manga List", path: "/manga-list", group: "Read", keywords: "ml tracking manga", emoji: "📚" },
  { id: "manga-releases", label: "Manga Releases", path: "/manga-releases", group: "Read", keywords: "new chapters schedule", emoji: "🆕" },
  { id: "light-novels", label: "Light Novels", path: "/light-novels", group: "Read", keywords: "ln books volumes", emoji: "📕" },
  { id: "toons", label: "Toons", path: "/toons", group: "Read", keywords: "webcomic strips", emoji: "🗞️" },
  { id: "doujinshi", label: "Doujinshi", path: "/doujinshi", group: "Read", keywords: "dj fan works adult 18", emoji: "🔞" },
  { id: "wiki", label: "Wiki", path: "/wiki", group: "Read", keywords: "reference encyclopedia articles", emoji: "📚" },
  { id: "guides", label: "Guides", path: "/guides", group: "Read", keywords: "how to tutorials help", emoji: "🧭" },
  { id: "dub-guide", label: "Dubbing Guides", path: "/indian-dubs", group: "Read", keywords: "hindi dub voice guide", emoji: "🗣️" },
  { id: "blog-create", label: "Write a Post", path: "/blog/create", group: "Read", keywords: "new article compose", emoji: "✍️", auth: true },

  // ── Watch ──────────────────────────────────────────────────────────────────
  { id: "watch-party", label: "Watch Party", path: "/watch-party", group: "Watch", keywords: "sync together room live", emoji: "📡" },
  { id: "streaming-calendar", label: "Streaming Calendar", path: "/streaming-calendar", group: "Watch", keywords: "where to watch platform netflix", emoji: "📺" },
  { id: "tv-schedule", label: "TV Schedule", path: "/tv-schedule", group: "Watch", keywords: "broadcast times channels", emoji: "📡" },
  { id: "dub-schedule", label: "Dub Schedule", path: "/dub-schedule", group: "Watch", keywords: "dubbed times english", emoji: "🔊" },
  { id: "hindi-dub-schedule", label: "Hindi Dub Schedule", path: "/hindi-dub-schedule", group: "Watch", keywords: "hindi timings", emoji: "🇮🇳" },
  { id: "theatrical-releases", label: "Theatrical Releases", path: "/theatrical-releases", group: "Watch", keywords: "movies in cinema", emoji: "🎬" },
  { id: "ost", label: "OSTs", path: "/ost", group: "Watch", keywords: "soundtrack songs music", emoji: "🎧" },
  { id: "voice-actors", label: "Voice Actors", path: "/voice-actors", group: "Watch", keywords: "seiyuu cast vAs", emoji: "🎙️" },
  { id: "voice-actors-indian", label: "Indian Voice Actors", path: "/voice-actors/indian", group: "Watch", keywords: "hindi dubbing artists", emoji: "🎤" },
  { id: "voice-lines", label: "Voice Lines", path: "/voice-lines", group: "Watch", keywords: "quotes lines random", emoji: "💬" },
  { id: "podcast", label: "Podcast", path: "/podcast", group: "Watch", keywords: "audio shows episodes", emoji: "🎙️" },
  { id: "clips", label: "Clips", path: "/clips", group: "Watch", keywords: "scenes moments video", emoji: "🎬" },
  { id: "reels", label: "Reels", path: "/reels", group: "Watch", keywords: "shorts vertical feed", emoji: "📱" },
  { id: "memes", label: "Memes", path: "/memes", group: "Watch", keywords: "funny images jokes", emoji: "😂" },

  // ── Create ─────────────────────────────────────────────────────────────────
  { id: "fanart", label: "Fanart", path: "/fanart", group: "Create", keywords: "art drawings gallery", emoji: "🎨" },
  { id: "fanart-upload", label: "Upload Fanart", path: "/fanart/upload", group: "Create", keywords: "post art submit", emoji: "🖼️", auth: true },
  { id: "wallpapers", label: "Wallpapers", path: "/wallpapers", group: "Create", keywords: "wa desktop phone background", emoji: "🖥️" },
  { id: "wallpapers-upload", label: "Upload Wallpaper", path: "/wallpapers/upload", group: "Create", keywords: "post wallpaper submit", emoji: "📐", auth: true },
  { id: "cosplay", label: "Cosplay", path: "/cosplay", group: "Create", keywords: "costumes outfits", emoji: "🎭" },
  { id: "figures", label: "Figures", path: "/figures", group: "Create", keywords: "collectibles statues models", emoji: "🗿" },
  { id: "merch", label: "Merch", path: "/merch", group: "Create", keywords: "shop store buy", emoji: "🛍️" },
  { id: "commissions", label: "Commissions", path: "/commissions", group: "Create", keywords: "comm request artists", emoji: "🖊️" },
  { id: "clubs-create", label: "Create a Club", path: "/clubs/create", group: "Create", keywords: "new group community", emoji: "🏛️", auth: true },
  { id: "wiki-create", label: "Edit the Wiki", path: "/wiki/create", group: "Create", keywords: "write article contribute", emoji: "📝", auth: true },
  { id: "developer", label: "Developer", path: "/developer", group: "Create", keywords: "api keys webhooks docs", emoji: "🛠️", auth: true },
  { id: "stats", label: "My Stats", path: "/stats", group: "Create", keywords: "analytics numbers watched", emoji: "📊", auth: true },
  { id: "stats-wrapped", label: "Stats Wrapped", path: "/stats/wrapped", group: "Create", keywords: "year in review recap", emoji: "🎊", auth: true },
  { id: "stats-timeline", label: "Stats Timeline", path: "/stats/timeline", group: "Create", keywords: "history over time", emoji: "📈", auth: true },

  // ── Reference ──────────────────────────────────────────────────────────────
  { id: "about", label: "About", path: "/about", group: "Reference", keywords: "who we are info", emoji: "ℹ️" },
  { id: "premium", label: "Zyni Premium", path: "/premium", group: "Reference", keywords: "upgrade plus subscription", emoji: "💎" },
  { id: "earn", label: "Earn", path: "/earn", group: "Reference", keywords: "referral rewards points coins", emoji: "💰", auth: true },
  { id: "extension", label: "Browser Extension", path: "/extension", group: "Reference", keywords: "chrome firefox addon install", emoji: "🧩" },
  { id: "best-anime-sites", label: "Best Anime Sites", path: "/best-anime-sites", group: "Reference", keywords: "alternatives directory", emoji: "🔗" },
  { id: "alternatives", label: "Alternatives", path: "/alternatives", group: "Reference", keywords: "other sites similar", emoji: "↔️" },
  { id: "docs", label: "Docs", path: "/docs", group: "Reference", keywords: "documentation help api", emoji: "📘" },
  { id: "changelog", label: "Changelog", path: "/docs/changelog", group: "Reference", keywords: "updates release notes history", emoji: "🧾" },

  // ── Tools ──────────────────────────────────────────────────────────────────
  { id: "compare", label: "Compare Users", path: "/compare", group: "Tools", keywords: "diff versus match stats", emoji: "⚖️" },
  { id: "compare-anime", label: "Compare Anime", path: "/compare-anime", group: "Tools", keywords: "diff two anime side by side", emoji: "⚖️" },
  { id: "binge-calculator", label: "Binge Calculator", path: "/tools/binge-calculator", group: "Tools", keywords: "how long watch time", emoji: "⏱️" },
  { id: "filler-time", label: "Filler Time", path: "/tools/filler-time", group: "Tools", keywords: "skip filler worth it", emoji: "⏭️" },
  { id: "watch-stats", label: "Watch Stats", path: "/tools/watch-stats", group: "Tools", keywords: "time watched analysis", emoji: "📊" },
  { id: "filler", label: "Filler Finder", path: "/filler", group: "Tools", keywords: "skip episodes guide", emoji: "✂️" },
  { id: "onboarding", label: "Getting Started", path: "/onboarding", group: "Tools", keywords: "tour setup new user", emoji: "👋" },
  { id: "ai", label: "Zyni AI", path: "/ai", group: "Tools", keywords: "assistant gemini chatbot ask", emoji: "🤖" },

  // ── Account ────────────────────────────────────────────────────────────────
  { id: "profile", label: "My Profile", path: "/profile", group: "Account", keywords: "me account settings", emoji: "👤", auth: true },
  { id: "login", label: "Sign In", path: "/login", group: "Account", keywords: "login log in auth", emoji: "🔑" },
  { id: "register", label: "Create Account", path: "/register", group: "Account", keywords: "signup sign up join", emoji: "✨" },
  { id: "forgot-password", label: "Reset Password", path: "/forgot-password", group: "Account", keywords: "forgot recover account", emoji: "🔒" },

  // ── Clubs ──────────────────────────────────────────────────────────────────
  { id: "clubs", label: "Clubs", path: "/clubs", group: "Clubs", keywords: "groups communities teams", emoji: "🏛️" },
];

/** Admins get these on top of everything else. */
export const ADMIN_COMMANDS: Command[] = [
  { id: "admin", label: "Admin Dashboard", path: "/admin", group: "Account", keywords: "control panel moderation", emoji: "🛡️", adminOnly: true },
  { id: "admin-users", label: "Admin · Users", path: "/admin/users", group: "Account", keywords: "accounts ban", emoji: "👥", adminOnly: true },
  { id: "admin-moderation", label: "Admin · Moderation", path: "/admin/moderation", group: "Account", keywords: "reports queue content", emoji: "🚨", adminOnly: true },
  { id: "admin-analytics", label: "Admin · Analytics", path: "/admin/analytics", group: "Account", keywords: "stats traffic visitors", emoji: "📈", adminOnly: true },
  { id: "admin-ads", label: "Admin · Ads", path: "/admin/ads", group: "Account", keywords: "placements revenue", emoji: "💵", adminOnly: true },
  { id: "admin-feedback", label: "Admin · Feedback", path: "/admin/feedback", group: "Account", keywords: "tickets suggestions", emoji: "📥", adminOnly: true },
];

export interface Viewer {
  /** Is there a session at all? */
  isAuth: boolean;
  /**
   * Is this viewer an admin?
   *
   * Note this cannot be read off the session: `role` lives on the Prisma user
   * model, not on the NextAuth session payload. The rest of the app (Navbar)
   * gates admin UI with `isAdminEmail()`, so the palette does the same rather
   * than inventing a second source of truth.
   */
  isAdmin: boolean;
}

/**
 * Commands available to a viewer.
 */
export function commandsFor(viewer: Viewer): Command[] {
  const base = COMMANDS.filter((c) => {
    if (c.adminOnly) return false;
    if (c.auth && !viewer.isAuth) return false;
    return true;
  });
  // Require both flags. `isAdmin` alone must never be enough: a mis-wired
  // caller that reports an admin with no session would otherwise surface
  // moderation and user-management tooling to a signed-out visitor.
  return viewer.isAuth && viewer.isAdmin ? [...base, ...ADMIN_COMMANDS] : base;
}

/** Field map consumed by `fuzzySearch`. Label first, then weighted hints. */
export function commandFields(c: Command): Record<string, string> {
  return {
    label: c.label,
    keywords: c.keywords ?? "",
    path: c.path,
    group: c.group,
  };
}

/**
 * Field weights for `fuzzySearch`.
 *
 * These deliberately stay close to 1. `fuzzyScore` spaces its tiers 200 points
 * apart (1000 exact / 800 prefix / 600 substring / below that subsequence), and
 * a large multiplier inverts that ordering: a weight of 3 on the label let a
 * weak label subsequence outrank a strong keyword prefix, which is how "dm"
 * resolved to "Random Anime" instead of "Messages". Nudge, do not overpower.
 */
export const COMMAND_WEIGHTS: Record<string, number> = {
  label: 1,
  keywords: 1.15,
  path: 0.45,
  group: 0.3,
};