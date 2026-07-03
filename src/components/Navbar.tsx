"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useWatchlist } from "./WatchlistProvider";
import { getSuggestions } from "@/lib/anilist";
import type { Suggestion } from "@/lib/anilist";
import ThemeToggle from "./ThemeToggle";

const PRIMARY_LINKS = [
  { to: "/", label: "Home" },
  { to: "/schedule", label: "Schedule" },
  { to: "/seasonal", label: "Seasonal" },
  { to: "/search", label: "Explore" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/dubbed", label: "Dubs" },
  { to: "/watchlist", label: "My List" },
];

const SECONDARY_LINKS = [
  { to: "/awards", label: "Awards" },
  { to: "/manga", label: "Manga" },
  { to: "/characters", label: "Characters" },
  { to: "/staff", label: "Staff" },
  { to: "/community", label: "Community" },
  { to: "/random", label: "Random" },
];

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { items } = useWatchlist();
  const { data: session } = useSession();

  useEffect(() => {
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
            <img src="/logo.png" alt="ZyniVerse" width={28} height={28} className="object-cover" />
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
              <div className="absolute top-full right-0 mt-1 w-44 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl backdrop-blur-xl overflow-hidden z-50">
                {SECONDARY_LINKS.map((l) => (
                  <Link key={l.to} href={l.to}
                    onClick={() => setMoreOpen(false)}
                    className={`block px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5 ${
                      pathname === l.to ? "text-[var(--color-cyan)]" : "text-[var(--color-mute)]"
                    }`}
                  >{l.label}</Link>
                ))}
                {session && (
                  <>
                    <div className="border-t border-[var(--color-line)] my-1" />
                    <Link href="/profile" onClick={() => setMoreOpen(false)}
                      className={`block px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5 ${
                        pathname === "/profile" ? "text-[var(--color-cyan)]" : "text-[var(--color-mute)]"
                      }`}
                    >Profile</Link>
                  </>
                )}
              </div>
            )}
          </div>

          {session ? (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-[var(--color-line)]">
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
                        <img src={s.poster} alt="" className="h-10 w-7 rounded object-cover border border-[var(--color-line)]" />
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

        <div className="hidden sm:block">
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
        <div className="md:hidden border-t border-[var(--color-line)] bg-[var(--color-void)] px-4 py-3 space-y-1">
          <div className="flex items-center justify-between mb-2 px-3">
            <span className="text-xs font-mono text-[var(--color-mute)] uppercase tracking-wider">Theme</span>
            <ThemeToggle />
          </div>
          <form onSubmit={handleSearchSubmit} className="mb-2 flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2">
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
          {[...PRIMARY_LINKS, ...SECONDARY_LINKS].map((l) => (
            <Link
              key={l.to}
              href={l.to}
              onClick={() => setOpen(false)}
              className={`block rounded-md px-3 py-2 text-sm font-medium ${
                pathname === l.to ? "text-[var(--color-cyan)]" : "text-[var(--color-mute)]"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {session && (
            <Link href="/profile" onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-medium text-[var(--color-mute)]"
            >Profile</Link>
          )}
          {session ? (
            <div className="flex items-center justify-between px-3 py-2 border-t border-[var(--color-line)] mt-2 pt-2">
              <span className="text-sm text-[var(--color-magenta)] font-semibold">{session.user?.name}</span>
              <button onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                className="text-sm text-red-400"
              >Logout</button>
            </div>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-medium text-[var(--color-mute)]"
            >Login</Link>
          )}
        </div>
      )}
    </header>
  );
}
