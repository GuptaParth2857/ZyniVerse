"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useWatchlist } from "./WatchlistProvider";
import { getSuggestions } from "@/lib/anilist";
import type { Suggestion } from "@/lib/anilist";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";
import LanguageSwitcher from "./LanguageSwitcher";
import SubscriptionBadge from "./SubscriptionBadge";

const PRIMARY_LINKS = [
  { to: "/", label: "Home" },
  { to: "/schedule", label: "Schedule" },
  { to: "/seasonal", label: "Seasonal" },
  { to: "/search", label: "Explore" },
  { to: "/activity", label: "Feed" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/dubbed", label: "Dubs" },
  { to: "/watchlist", label: "My List" },
];

const SECONDARY_LINKS = [
  { to: "/news", label: "News" },
  { to: "/tv-schedule", label: "TV Channels" },
  { to: "/live-action", label: "Live Action" },
  { to: "/filler", label: "Filler Guides" },
  { to: "/watch-order", label: "Watch Orders" },
  { to: "/docs", label: "API Docs" },
  { to: "/awards", label: "Awards" },
  { to: "/tags", label: "Tags" },
  { to: "/figures", label: "Figures" },
  { to: "/manga", label: "Manga" },
  { to: "/light-novels", label: "Light Novels" },
  { to: "/doujinshi", label: "Doujinshi" },
  { to: "/achievements", label: "Achievements" },
  { to: "/characters", label: "Characters" },
  { to: "/staff", label: "Staff" },
  { to: "/recommendations", label: "Recommend" },
  { to: "/quiz", label: "Quiz" },
  { to: "/forum", label: "Forum" },
  { to: "/community", label: "Social Feed" },
  { to: "/random", label: "Random" },
  { to: "/tierlist", label: "Tier Lists" },
  { to: "/lists", label: "Lists" },
  { to: "/ost", label: "OST" },
  { to: "/events", label: "Anime Events" },
  { to: "/conventions", label: "India Cons" },
  { to: "/voice-actors", label: "Voice Actors" },
  { to: "/voice-actors/indian", label: "Indian VAs" },
  { to: "/voice-lines", label: "Quotes" },
  { to: "/watch-party", label: "Watch Party" },
  { to: "/cosplay", label: "Cosplay" },
  { to: "/challenges", label: "Challenges" },
  { to: "/blog", label: "Blog" },
  { to: "/clubs", label: "Clubs" },
  { to: "/wiki", label: "Wiki" },
  { to: "/stats", label: "My Stats" },
  { to: "/themes", label: "Theme Songs" },
  { to: "/season/upcoming", label: "Season Preview" },
  { to: "/compare", label: "Compare" },
  { to: "/premium", label: "Premium" },
  { to: "/status", label: "Status" },
  { to: "/indian-dubs", label: "Indian Dubs" },
  { to: "/developer", label: "Developer" },
  { to: "/feedback", label: "Feedback" },
];

const MORE_CATEGORIES = [
  {
    title: "Discover",
    icon: "🔍",
    items: [
      { to: "/news", label: "News" },
      { to: "/live-action", label: "Live Action" },
      { to: "/random", label: "Random" },
      { to: "/recommendations", label: "Recommend" },
      { to: "/season/upcoming", label: "Upcoming" },
    ],
  },
  {
    title: "Anime",
    icon: "🎬",
    items: [
      { to: "/filler", label: "Filler Guides" },
      { to: "/watch-order", label: "Watch Orders" },
      { to: "/indian-dubs", label: "Indian Dubs" },
      { to: "/themes", label: "Theme Songs" },
      { to: "/ost", label: "OST" },
      { to: "/characters", label: "Characters" },
      { to: "/voice-actors", label: "Voice Actors" },
      { to: "/voice-actors/indian", label: "Indian VAs" },
      { to: "/voice-lines", label: "Quotes" },
      { to: "/staff", label: "Staff" },
    ],
  },
  {
    title: "Reading",
    icon: "📚",
    items: [
      { to: "/manga", label: "Manga" },
      { to: "/light-novels", label: "Light Novels" },
      { to: "/doujinshi", label: "Doujinshi" },
    ],
  },
  {
    title: "Events & Fun",
    icon: "🎪",
    items: [
      { to: "/events", label: "Anime Events" },
      { to: "/conventions", label: "India Cons" },
      { to: "/tv-schedule", label: "TV Channels" },
      { to: "/cosplay", label: "Cosplay" },
      { to: "/quiz", label: "Quiz" },
      { to: "/challenges", label: "Challenges" },
      { to: "/watch-party", label: "Watch Party" },
    ],
  },
  {
    title: "Community",
    icon: "💬",
    items: [
      { to: "/forum", label: "Forum" },
      { to: "/community", label: "Social Feed" },
      { to: "/clubs", label: "Clubs" },
      { to: "/blog", label: "Blog" },
      { to: "/tierlist", label: "Tier Lists" },
      { to: "/lists", label: "Lists" },
      { to: "/feedback", label: "Feedback" },
    ],
  },
  {
    title: "Platform",
    icon: "⚙️",
    items: [
      { to: "/stats", label: "My Stats" },
      { to: "/achievements", label: "Achievements" },
      { to: "/awards", label: "Awards" },
      { to: "/compare", label: "Compare" },
      { to: "/tags", label: "Tags" },
      { to: "/figures", label: "Figures" },
      { to: "/docs", label: "API Docs" },
      { to: "/developer", label: "Developer" },
      { to: "/premium", label: "Premium" },
      { to: "/wiki", label: "Wiki" },
      { to: "/status", label: "Status" },
    ],
  },
];

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [moreTab, setMoreTab] = useState(MORE_CATEGORIES[0].title);
  const [mobileTab, setMobileTab] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { items } = useWatchlist();
  const { data: session } = useSession();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!query.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await getSuggestions(query.trim());
        setSuggestions(res);
        setShowSuggestions(res.length > 0);
      } catch { setSuggestions([]); setShowSuggestions(false); }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const primaryLinks = session
    ? [...PRIMARY_LINKS, { to: "/profile", label: "Profile" }]
    : PRIMARY_LINKS;

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-void)]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="relative h-7 w-7 overflow-hidden rounded-md border border-[var(--color-magenta)]/30 group-hover:scale-110 transition-transform">
            <Image src="/logo.png" alt="ZyniVerse" width={28} height={28} className="object-cover" />
          </div>
          <span className="font-display text-lg font-bold tracking-wide logo-text">
            ZyniVerse
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          {primaryLinks.map((l) => (
            <Link
              key={l.to}
              href={l.to}
              className={`relative rounded-md px-2 py-2 text-sm font-medium neon-btn ${
                pathname === l.to
                  ? "text-[var(--color-cyan)]"
                  : "text-[var(--color-mute)]"
              }`}
            >
              {l.label}
              {l.to === "/watchlist" && items.length > 0 && (
                <span className="ml-1.5 rounded-full bg-[var(--color-magenta)] px-1.5 py-0.5 text-[10px] font-mono text-black">
                  {items.length}
                </span>
              )}
            </Link>
          ))}

          {/* More dropdown */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((o) => !o)}
              className={`relative rounded-md px-2 py-2 text-sm font-medium neon-btn ${
                moreOpen ? "text-[var(--color-cyan)]" : "text-[var(--color-mute)]"
              }`}
            >
              More
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline ml-1 -mt-0.5">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {moreOpen && (
              <div className="absolute top-full right-0 mt-1 w-[95vw] sm:w-[42rem] max-w-[42rem] rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl backdrop-blur-xl z-50 overflow-hidden">
                {/* Horizontal category tabs */}
                <div className="flex overflow-x-auto border-b border-[var(--color-line)] scrollbar-none">
                  {MORE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.title}
                      onClick={() => setMoreTab(cat.title)}
                      className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 shrink-0 ${
                        moreTab === cat.title
                          ? "text-[var(--color-cyan)] border-[var(--color-cyan)] bg-[var(--color-cyan)]/5"
                          : "text-[var(--color-mute)] border-transparent hover:text-[var(--color-text)] hover:bg-white/5"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.title}</span>
                    </button>
                  ))}
                </div>
                {/* Links for active tab */}
                <div className="max-h-[50vh] overflow-y-auto">
                  {MORE_CATEGORIES.filter((cat) => cat.title === moreTab).map((cat) => (
                    <div key={cat.title} className="p-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                        {cat.items.map((l) => (
                          <Link key={l.to} href={l.to}
                            onClick={() => setMoreOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                              pathname === l.to
                                ? "text-[var(--color-cyan)] bg-[var(--color-cyan)]/10 font-semibold"
                                : "text-[var(--color-mute)] hover:bg-white/5 hover:text-[var(--color-text)]"
                            }`}
                          >
                            {pathname === l.to && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cyan)] shrink-0" />}
                            {l.label}
                          </Link>
                        ))}
                      </div>
                      {cat.title === "Platform" && session && (
                        <div className="mt-2 pt-2 border-t border-[var(--color-line)]/50">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                            <Link href="/messages" onClick={() => setMoreOpen(false)}
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                pathname === "/messages" ? "text-[var(--color-cyan)] bg-[var(--color-cyan)]/10 font-semibold" : "text-[var(--color-mute)] hover:bg-white/5 hover:text-[var(--color-text)]"
                              }`}
                            >Messages</Link>
                            <Link href="/profile" onClick={() => setMoreOpen(false)}
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                pathname === "/profile" ? "text-[var(--color-cyan)] bg-[var(--color-cyan)]/10 font-semibold" : "text-[var(--color-mute)] hover:bg-white/5 hover:text-[var(--color-text)]"
                              }`}
                            >Profile</Link>
                            {(session.user as Record<string, unknown>)?.email === "gupta.parth2857@gmail.com" && (
                              <Link href="/admin" onClick={() => setMoreOpen(false)}
                                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                  pathname.startsWith("/admin") ? "text-[var(--color-magenta)] bg-[var(--color-magenta)]/10 font-semibold" : "text-[var(--color-mute)] hover:bg-white/5 hover:text-[var(--color-text)]"
                                }`}
                              >Admin Panel</Link>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {session ? (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-[var(--color-line)]">
              <SubscriptionBadge />
              <NotificationBell />
              <span className="text-xs text-[var(--color-magenta)] font-semibold">{session.user?.name}</span>
              <button onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-[var(--color-mute)] hover:text-red-400 transition-colors"
              >Logout</button>
            </div>
          ) : (
            <Link href="/login"
              className="relative rounded-md px-2 py-2 text-sm font-medium neon-btn text-[var(--color-mute)]"
            >Login</Link>
          )}
        </nav>

        <div className="ml-auto hidden sm:flex items-center" ref={suggestRef}>
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <div className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1.5 focus-within:border-[var(--color-cyan)] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)]">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search anime & manga..."
                  className="w-36 bg-transparent text-sm outline-none placeholder:text-[var(--color-mute)]"
                />
              </div>
              {showSuggestions && (
                <div className="absolute top-full right-0 mt-1 w-72 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl backdrop-blur-xl overflow-hidden z-50">
                  {suggestions.map((s) => (
                    <Link key={s.id} href={`/anime/${s.id}`}
                      onClick={() => { setShowSuggestions(false); setQuery(""); }}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors border-b border-[var(--color-line)] last:border-0"
                    >
                      {s.poster && (
                        <div className="relative h-10 w-7 rounded overflow-hidden border border-[var(--color-line)] shrink-0">
                          <Image src={s.poster} alt="" fill className="object-cover" sizes="28px" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{s.title}</p>
                        <div className="flex items-center gap-2 text-[10px] text-[var(--color-mute)]">
                          {s.format && <span>{s.format}</span>}
                          {s.year && <span>{s.year}</span>}
                          {s.episodes && <span>{s.episodes} ep</span>}
                          {s.status && <span className="capitalize">{s.status.replace(/_/g, " ")}</span>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <button
          className="md:hidden text-[var(--color-ink)]"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={open}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[var(--color-line)] bg-[var(--color-void)] px-4 py-3 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3 px-3">
            <span className="text-xs font-mono text-[var(--color-mute)] uppercase tracking-wider">Theme</span>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
          <form onSubmit={handleSearchSubmit} className="mb-3 flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)]">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-mute)]"
            />
          </form>

          {session && (
            <div className="flex items-center gap-3 mb-3 px-3 py-2 rounded-lg bg-[var(--color-panel)] border border-[var(--color-line)]">
              <NotificationBell />
              <span className="flex-1 text-sm text-[var(--color-magenta)] font-semibold">{session.user?.name}</span>
              <button onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                className="text-xs text-red-400 font-medium"
              >Logout</button>
            </div>
          )}

          {/* Primary links */}
          <div className="mb-3">
            <p className="px-3 text-[10px] font-mono text-[var(--color-mute)] uppercase tracking-wider mb-1">Main</p>
            <div className="grid grid-cols-2 gap-1">
              {[...PRIMARY_LINKS, ...(session ? [{ to: "/profile", label: "Profile" }] : [])].map((l) => (
                <Link key={l.to} href={l.to} onClick={() => setOpen(false)}
                  className={`block rounded-md px-3 py-3 text-sm font-medium text-center ${
                    pathname === l.to ? "text-[var(--color-cyan)] bg-[var(--color-cyan)]/5" : "text-[var(--color-mute)] hover:bg-white/5"
                  }`}
                >{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Secondary links with horizontal tabs */}
          <div className="mb-3">
            <div className="flex overflow-x-auto gap-1 mb-2 scrollbar-none">
              {MORE_CATEGORIES.map((cat) => (
                <button
                  key={cat.title}
                  onClick={() => setMobileTab(mobileTab === cat.title ? null : cat.title)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                    mobileTab === cat.title
                      ? "text-[var(--color-cyan)] border-[var(--color-cyan)]/50 bg-[var(--color-cyan)]/10"
                      : "text-[var(--color-mute)] border-[var(--color-line)] hover:border-[var(--color-mute)]/50"
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.title}
                </button>
              ))}
            </div>
            {mobileTab && MORE_CATEGORIES.filter((cat) => cat.title === mobileTab).map((cat) => (
              <div key={cat.title} className="grid grid-cols-2 gap-1">
                {cat.items.map((l) => (
                  <Link key={l.to} href={l.to} onClick={() => setOpen(false)}
                    className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium ${
                      pathname === l.to ? "text-[var(--color-cyan)] bg-[var(--color-cyan)]/5" : "text-[var(--color-mute)] hover:bg-white/5"
                    }`}
                  >
                    {pathname === l.to && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cyan)] shrink-0" />}
                    {l.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>

          {!session && (
            <Link href="/login" onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-3 text-sm font-semibold text-center text-[var(--color-cyan)] border border-[var(--color-cyan)]/30 mt-1"
            >Sign In</Link>
          )}
        </div>
      )}
    </header>
  );
}
