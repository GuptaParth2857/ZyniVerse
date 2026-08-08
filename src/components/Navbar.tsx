"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { isAdminEmail } from "@/lib/admin-identity";
import { useWatchlist } from "./WatchlistProvider";
import { getSuggestions } from "@/lib/anilist";
import type { Suggestion } from "@/lib/anilist";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";
import LanguageSwitcher from "./LanguageSwitcher";
import SubscriptionBadge from "./SubscriptionBadge";

const PRIMARY_LINKS = [
  { to: "/", label: "Home" },
  { to: "/search", label: "Explore" },
  { to: "/top-anime", label: "Top Anime" },
  { to: "/schedule", label: "Schedule" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/watchlist", label: "My List" },
  { to: "/reels", label: "Reels", accent: true },
];

const MORE_CATEGORIES = [
  {
    title: "Discover",
    icon: "🔍",
    items: [
      { to: "/news", label: "News" },
      { to: "/guides", label: "Guides & Articles" },
      { to: "/live-action", label: "Live Action" },
      { to: "/random", label: "Random" },
      { to: "/seasonal", label: "Seasonal" },
      { to: "/recommendations", label: "Recommend" },
      { to: "/streaming-calendar", label: "Streaming Calendar" },
      { to: "/season/upcoming", label: "Upcoming" },
      { to: "/podcast", label: "Podcast" },
      { to: "/calendar", label: "Calendar" },
      { to: "/a-z", label: "A–Z Index" },
      { to: "/moments", label: "Moments" },
    ],
  },
  {
    title: "India",
    icon: "🇮🇳",
    items: [
      { to: "/indian-dubs", label: "Indian Dubs" },
      { to: "/dub-schedule", label: "Dub Schedule" },
      { to: "/theatrical-releases", label: "Theatrical Releases" },
      { to: "/toons", label: "Toons & Cartoons" },
      { to: "/tv-schedule", label: "TV Channels" },
      { to: "/conventions", label: "India Cons" },
      { to: "/events", label: "Anime Events" },
    ],
  },
  {
    title: "Anime",
    icon: "🎬",
    items: [
      { to: "/dubbed", label: "Dubs" },
      { to: "/filler", label: "Filler Guides" },
      { to: "/watch-order", label: "Watch Orders" },
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
      { to: "/activity", label: "Activity" },
      { to: "/friends", label: "Friends" },
      { to: "/clubs", label: "Clubs" },
      { to: "/earn", label: "Refer & Earn" },
      { to: "/blog", label: "Blog" },
      { to: "/polls", label: "Polls" },
      { to: "/critiques", label: "Critiques" },
      { to: "/tierlist", label: "Tier Lists" },
      { to: "/lists", label: "Lists" },
      { to: "/feedback", label: "Feedback" },
    ],
  },
  {
    title: "More",
    icon: "✨",
    items: [
      { to: "/tools", label: "Tools" },
      { to: "/merch", label: "Merch Store" },
      { to: "/premium", label: "Premium" },
      { to: "/figures", label: "My Collection" },
      { to: "/stats", label: "My Stats" },
      { to: "/achievements", label: "Achievements" },
      { to: "/awards", label: "Awards" },
      { to: "/compare", label: "Compare" },
      { to: "/tags", label: "Tags" },
      { to: "/docs", label: "API Docs" },
      { to: "/developer", label: "Developer" },
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
  const [mobileOpenCats, setMobileOpenCats] = useState<string[]>([]);
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

  const primaryLinks = PRIMARY_LINKS;

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-void)]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-2 sm:gap-3 xl:gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0 group -ml-2">
          <div className="relative h-7 w-7 overflow-hidden rounded-md neon-rgb-border group-hover:scale-110 transition-transform">
            <Image src="/logo.png" alt="ZyniVerse" width={28} height={28} className="object-cover" />
          </div>
          <span className="font-display text-lg font-bold tracking-wide logo-text">
            ZyniVerse
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 ml-2 shrink-0">
          {primaryLinks.map((l, i) => (
            <Link
              key={l.to}
              href={l.to}
              className={`relative rounded-lg px-2.5 py-1.5 text-[13px] font-semibold transition-all ${
                pathname === l.to
                  ? "text-[var(--color-cyan)]"
                  : "text-[var(--color-mute)] hover:text-[var(--color-cyan)]"
              }`}
              style={{ animationDelay: `${i * -0.5}s` }}
            >
              {l.label}
              {l.accent && (
                <span className="absolute -right-0.5 top-1 flex h-1.5 w-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
              )}
              {l.to === "/watchlist" && items.length > 0 && (
                <span className="ml-1 rounded-full bg-[var(--color-magenta)] px-1.5 py-0.5 text-[10px] font-mono text-black">
                  {items.length}
                </span>
              )}
            </Link>
          ))}

          {/* More dropdown */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((o) => !o)}
              className={`relative rounded-lg px-2.5 py-1.5 text-[13px] font-semibold transition-all ${
                moreOpen ? "text-[var(--color-cyan)]" : "text-[var(--color-mute)] hover:text-[var(--color-cyan)]"
              }`}
            >
              More
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`inline ml-1 -mt-0.5 transition-transform ${moreOpen ? "rotate-180" : ""}`}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {moreOpen && (
              <div className="absolute top-full right-0 mt-2 w-[92vw] sm:w-[44rem] max-w-[44rem] rounded-2xl neon-rgb-border bg-[var(--color-panel)] shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl overflow-hidden">
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
                <div className="max-h-[55vh] overflow-y-auto p-3">
                  {MORE_CATEGORIES.filter((cat) => cat.title === moreTab).map((cat) => (
                    <div key={cat.title}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                        {cat.items.map((l) => (
                          <Link key={l.to} href={l.to}
                            onClick={() => setMoreOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
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
                      {cat.title === "More" && session && (
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
                            {isAdminEmail((session.user as Record<string, unknown>)?.email as string | null) && (
                              <Link href="/admin" onClick={() => setMoreOpen(false)}
                                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                  pathname.startsWith("/admin") ? "text-[var(--color-magenta)] bg-[var(--color-magenta)]/10 font-semibold" : "text-[var(--color-mute)] hover:bg-white/5 hover:text-[var(--color-text)]"
                                }`}
                              >Admin Panel</Link>
                            )}
                            <button onClick={() => signOut({ callbackUrl: "/" })}
                              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-[var(--color-mute)] hover:bg-white/5 hover:text-red-400 transition-colors text-left"
                            >Logout</button>
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
            <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-[var(--color-line)] shrink-0">
              <SubscriptionBadge />
              <NotificationBell />
              <Link href="/profile" title={session.user?.name || "Profile"}
                className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] hover:border-[var(--color-cyan)] transition-colors"
              >
                {session.user?.image ? (
                  <Image src={session.user.image} alt="" fill className="object-cover" />
                ) : (
                  <span className="text-[11px] font-bold text-[var(--color-cyan)]">
                    {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </Link>
            </div>
          ) : (
            <Link href="/login"
              className="relative rounded-lg px-3 py-1.5 text-[13px] font-bold neon-rgb-border text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/10 transition-colors"
            >Sign In</Link>
          )}
        </nav>

        <div className="ml-auto hidden sm:flex items-center shrink-0" ref={suggestRef}>
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <div className="flex items-center gap-2 rounded-lg bg-[var(--color-panel)] px-3 py-1.5 focus-within:shadow-[0_0_16px_var(--color-cyan)] transition-shadow neon-rgb-border">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)]">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search..."
                  className="w-28 xl:w-36 bg-transparent text-sm outline-none placeholder:text-[var(--color-mute)]"
                />
              </div>
              {showSuggestions && (
                <div className="absolute top-full right-0 mt-1 w-72 rounded-xl bg-[var(--color-panel)] shadow-2xl backdrop-blur-xl overflow-hidden z-50">
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

        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <button
          className="lg:hidden ml-auto p-2 -m-2 text-[var(--color-ink)]"
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
        <div className="lg:hidden border-t border-[var(--color-line)] bg-[var(--color-void)] px-4 py-3 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3 px-3">
            <span className="text-xs font-mono text-[var(--color-mute)] uppercase tracking-wider">Theme</span>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
          <form onSubmit={handleSearchSubmit} className="mb-3 flex items-center gap-2 rounded-lg bg-[var(--color-panel)] px-3 py-2.5 neon-rgb-border">
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
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] text-sm hover:border-[var(--color-cyan)] transition-colors"
                aria-label="Notifications"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)]">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
              </Link>
              <span className="flex-1 text-sm text-[var(--color-magenta)] font-semibold truncate">{session.user?.name}</span>
              <Link href="/profile" onClick={() => setOpen(false)} className="text-xs text-[var(--color-cyan)] font-medium">Profile</Link>
            </div>
          )}

          {/* Primary links */}
          <div className="mb-3">
            <p className="px-3 text-[10px] font-mono text-[var(--color-mute)] uppercase tracking-wider mb-1">Main</p>
            <div className="grid grid-cols-2 gap-1">
              {PRIMARY_LINKS.map((l, i) => (
                <Link key={l.to} href={l.to} onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-3 text-sm font-medium text-center transition-all ${
                    pathname === l.to ? "text-[var(--color-cyan)]" : "text-[var(--color-mute)] hover:text-[var(--color-cyan)]"
                  }`}
                  style={{ animationDelay: `${i * -0.5}s` }}
                >{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Categories (tap to expand) */}
          <div className="space-y-1 mb-3">
            {MORE_CATEGORIES.map((cat) => {
              const isOpen = mobileOpenCats.includes(cat.title);
              return (
                <div key={cat.title} className={`rounded-lg overflow-hidden ${isOpen ? "neon-rgb-border bg-[var(--color-panel)]" : "border border-[var(--color-line)] bg-[var(--color-panel)]"}`}>
                  <button
                    onClick={() => setMobileOpenCats((prev) =>
                      isOpen ? prev.filter((t) => t !== cat.title) : [...prev, cat.title]
                    )}
                    className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-[var(--color-ink)] hover:bg-white/5 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base leading-none">{cat.icon}</span>
                      {cat.title}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className={`text-[var(--color-mute)] transition-transform ${isOpen ? "rotate-180" : ""}`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="grid grid-cols-2 gap-1 px-2 pb-2">
                      {cat.items.map((l) => (
                        <Link key={l.to} href={l.to} onClick={() => setOpen(false)}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                            pathname === l.to ? "text-[var(--color-cyan)] bg-[var(--color-cyan)]/10" : "text-[var(--color-mute)] hover:text-[var(--color-cyan)]"
                          }`}
                        >
                          {pathname === l.to && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cyan)] shrink-0" />}
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {session && (
              <div>
                <p className="px-3 text-[10px] font-mono text-[var(--color-mute)] uppercase tracking-wider mb-1">👤 Account</p>
                <div className="grid grid-cols-2 gap-1">
                  <Link href="/messages" onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-all"
                  >Messages</Link>
                  {isAdminEmail((session.user as Record<string, unknown>)?.email as string | null) && (
                    <Link href="/admin" onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-magenta)] hover:text-[var(--color-magenta)] transition-all"
                    >Admin Panel</Link>
                  )}
                  <button onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-all text-left"
                  >Logout</button>
                </div>
              </div>
            )}
          </div>

          {!session && (
            <Link href="/login" onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm font-semibold text-center text-[var(--color-cyan)] neon-rgb-border mt-1"
            >Sign In</Link>
          )}
        </div>
      )}
    </header>
  );
}
