"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import WatchPartyCard from "@/components/WatchPartyCard";
import { PageTransition } from "@/components/PageTransition";
import type { WatchPartyData } from "@/lib/watch-party";

interface AnimeResult {
  id: number;
  title: string;
  image: string | null;
  episodes: number | null;
  status: string | null;
  year: number | null;
}

function NeonOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-[10%] left-[5%] w-[300px] h-[300px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,255,224,0.06) 0%, transparent 70%)", filter: "blur(60px)" }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[50%] right-[8%] w-[250px] h-[250px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,0,230,0.05) 0%, transparent 70%)", filter: "blur(60px)" }}
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[20%] left-[40%] w-[200px] h-[200px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(112,0,255,0.04) 0%, transparent 70%)", filter: "blur(60px)" }}
        animate={{ x: [0, 25, 0], y: [0, -25, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function Particles() {
  const pts = useRef<{ x: number; y: number; s: number; d: number; o: number; c: string; ty: number; delay: number }[]>([]);
  if (pts.current.length === 0) {
    const colors = ["#00ffe0", "#ff00e6", "#7000ff"];
    for (let i = 0; i < 15; i++) {
      pts.current.push({
        x: Math.random() * 100, y: Math.random() * 100,
        s: Math.random() * 2 + 0.5, d: Math.random() * 6 + 4, o: Math.random() * 0.3 + 0.1,
        c: colors[i % 3], ty: -(Math.random() * 30 + 8), delay: Math.random() * 5,
      });
    }
  }
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pts.current.map((p, i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{
            left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s,
            background: p.c, opacity: p.o,
            boxShadow: i % 2 === 0 ? "0 0 6px rgba(0,255,224,0.3)" : "0 0 6px rgba(255,0,230,0.3)",
            willChange: "transform, opacity",
          }}
          animate={{ y: [0, p.ty, 0], opacity: [p.o * 0.2, p.o, p.o * 0.2] }}
          transition={{ duration: p.d, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
        />
      ))}
    </div>
  );
}

export default function WatchPartyClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeParties, setActiveParties] = useState<WatchPartyData[]>([]);
  const [userParties, setUserParties] = useState<WatchPartyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Create form state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AnimeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<AnimeResult | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchParties = useCallback(async () => {
    try {
      const [active, user] = await Promise.all([
        fetch("/api/watch-party").then((r) => r.json()),
        session?.user?.id ? fetch("/api/watch-party?mine=true").then((r) => r.json()) : Promise.resolve({ parties: [] }),
      ]);
      setActiveParties(active.parties || []);
      setUserParties(user.parties || []);
    } catch {} finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchParties();
  }, [fetchParties]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSearchResults([]);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/watch-party/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, []);

  function selectAnime(anime: AnimeResult) {
    setSelectedAnime(anime);
    setSearchQuery(anime.title);
    setSearchResults([]);
  }

  function clearSelection() {
    setSelectedAnime(null);
    setSearchResults([]);
  }

  async function handleCreate() {
    if (!selectedAnime) return;
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/watch-party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId: selectedAnime.id,
          mediaTitle: selectedAnime.title,
          mediaImage: selectedAnime.image,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Failed to create party");
        setCreating(false);
        return;
      }
      if (data.party) {
        router.push(`/watch-party/${data.party.id}`);
      }
    } catch (err) {
      setCreateError("Network error. Please try again.");
      setCreating(false);
    }
  }

  function resetCreate() {
    setShowCreate(false);
    setSearchQuery("");
    setSearchResults([]);
    setSelectedAnime(null);
    setCreateError("");
  }

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d0d1a] to-[#050510]" />
        <div className="absolute inset-0 opacity-[0.35] pointer-events-none" style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 120px 40px rgba(0,0,0,0.6)" }} />
        <NeonOrbs />
        <Particles />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6">
          {/* Hero */}
          <div className="text-center mb-12">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-mono text-xs uppercase tracking-[0.2em] text-[#00ffe0]"
            >
              Watch Together
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-4xl font-bold sm:text-5xl mt-2 bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] bg-clip-text text-transparent"
            >
              Watch Party
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-3 max-w-md mx-auto"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Host or join watch parties. Watch anime episodes together with friends in real-time sync.
            </motion.p>
          </div>

          {/* Create button */}
          {session?.user?.id && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center mb-10"
            >
              <button
                onClick={() => showCreate ? resetCreate() : setShowCreate(true)}
                className="group relative inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-r from-[rgba(0,255,224,0.1)] to-[rgba(255,0,230,0.08)] border border-[rgba(0,255,224,0.2)] px-6 py-3 text-sm font-bold text-[#00ffe0] transition-all duration-300 hover:border-[rgba(0,255,224,0.4)] hover:shadow-[0_0_30px_-8px_rgba(0,255,224,0.25)]"
              >
                {showCreate ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Cancel
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Create Watch Party
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* Not logged in hint */}
          {!session?.user?.id && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center mb-10"
            >
              <a href="/login" className="inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-r from-[rgba(0,255,224,0.1)] to-[rgba(255,0,230,0.08)] border border-[rgba(0,255,224,0.2)] px-6 py-3 text-sm font-bold text-[#00ffe0] transition-all duration-300 hover:border-[rgba(0,255,224,0.4)]">
                Login to Create a Party
              </a>
            </motion.div>
          )}

          {/* Create form */}
          <AnimatePresence>
            {showCreate && (
              <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-10 overflow-hidden"
              >
                <div className="mx-auto max-w-lg rounded-[20px] border border-[rgba(0,255,224,0.1)] bg-[rgba(18,17,30,0.7)] backdrop-blur-md p-6 space-y-4">
                  <h3 className="font-display text-lg font-bold text-white">Create a Party</h3>

                  {/* Anime search */}
                  <div className="relative" ref={dropdownRef}>
                    <div className="flex items-center gap-2 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,15,0.6)] px-3 py-2.5 focus-within:border-[rgba(0,255,224,0.3)] transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <input
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search anime to watch..."
                        className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                        disabled={!!selectedAnime}
                      />
                      {searching && (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#00ffe0] border-t-transparent" />
                      )}
                      {selectedAnime && (
                        <button onClick={clearSelection} className="text-white/30 hover:text-white/60 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Search results dropdown */}
                    <AnimatePresence>
                      {searchResults.length > 0 && !selectedAnime && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute z-50 mt-2 w-full rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[rgba(18,17,30,0.98)] backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] overflow-hidden max-h-80 overflow-y-auto"
                        >
                          {searchResults.map((anime) => (
                            <button
                              key={anime.id}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                selectAnime(anime);
                              }}
                              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[rgba(0,255,224,0.05)] transition-colors text-left border-b border-[rgba(255,255,255,0.04)] last:border-b-0"
                            >
                              <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-lg bg-[rgba(255,255,255,0.03)]">
                                {anime.image ? (
                                  <Image src={anime.image} alt="" fill className="object-cover" sizes="36px" />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-[8px] text-white/20">No img</div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-white truncate">{anime.title}</p>
                                <p className="text-[11px] text-white/30">
                                  {anime.episodes ? `${anime.episodes} episodes` : "Ongoing"}
                                  {anime.year ? ` • ${anime.year}` : ""}
                                </p>
                              </div>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* No results message */}
                    {!searching && searchQuery.length >= 2 && searchResults.length === 0 && !selectedAnime && (
                      <div className="absolute z-50 mt-2 w-full rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[rgba(18,17,30,0.98)] backdrop-blur-xl p-4 text-center">
                        <p className="text-xs text-white/30">No anime found. Try a different search.</p>
                      </div>
                    )}
                  </div>

                  {/* Selected anime preview */}
                  <AnimatePresence>
                    {selectedAnime && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-3 rounded-[12px] border border-[rgba(0,255,224,0.15)] bg-[rgba(0,255,224,0.03)] p-3"
                      >
                        <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg">
                          {selectedAnime.image ? (
                            <Image src={selectedAnime.image} alt="" fill className="object-cover" sizes="40px" />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate">{selectedAnime.title}</p>
                          <p className="text-[11px] text-white/40">
                            {selectedAnime.episodes ? `${selectedAnime.episodes} episodes` : "Ongoing"}
                            {selectedAnime.year ? ` • ${selectedAnime.year}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(0,255,224,0.5)" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error */}
                  {createError && (
                    <div className="rounded-[10px] bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-xs font-medium text-red-400">
                      {createError}
                    </div>
                  )}

                  {/* Create button */}
                  <button
                    onClick={handleCreate}
                    disabled={!selectedAnime || creating}
                    className={`w-full rounded-[12px] py-3 text-sm font-bold transition-all duration-300 ${
                      selectedAnime && !creating
                        ? "bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] text-white shadow-[0_0_30px_-8px_rgba(0,255,224,0.3)] hover:shadow-[0_0_50px_-6px_rgba(0,255,224,0.5)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                        : "bg-[rgba(255,255,255,0.04)] text-white/20 cursor-not-allowed border border-[rgba(255,255,255,0.06)]"
                    }`}
                  >
                    {creating ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Creating...
                      </span>
                    ) : (
                      "Create Party"
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User's parties */}
          {userParties.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-5 w-1 rounded-full bg-gradient-to-b from-[#00ffe0] to-[#7000ff]" />
                <h2 className="font-display text-xl font-bold text-white">Your Parties</h2>
                <span className="rounded-full bg-[rgba(0,255,224,0.1)] border border-[rgba(0,255,224,0.2)] px-2 py-0.5 text-[10px] font-bold text-[#00ffe0]">
                  {userParties.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {userParties.map((p, i) => (
                  <WatchPartyCard key={p.id} party={p} userId={session?.user?.id} index={i} />
                ))}
              </div>
            </motion.section>
          )}

          {/* Active parties */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-5 w-1 rounded-full bg-gradient-to-b from-[#ff00e6] to-[#7000ff]" />
              <h2 className="font-display text-xl font-bold text-white">Active Parties</h2>
              {activeParties.length > 0 && (
                <span className="rounded-full bg-[rgba(255,0,230,0.1)] border border-[rgba(255,0,230,0.2)] px-2 py-0.5 text-[10px] font-bold text-[#ff00e6]">
                  {activeParties.length}
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00ffe0] border-t-transparent" />
              </div>
            ) : activeParties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-[20px] border border-[rgba(255,255,255,0.04)] bg-[rgba(18,17,30,0.3)]">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(0,255,224,0.05)] border border-[rgba(0,255,224,0.1)]">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(0,255,224,0.4)" strokeWidth="1.5">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-white/50 mb-1">No active parties right now</p>
                <p className="text-xs text-white/25">Create one and invite your friends to watch together!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {activeParties.map((p, i) => (
                  <WatchPartyCard key={p.id} party={p} userId={session?.user?.id} index={i} />
                ))}
              </div>
            )}
          </motion.section>

          {/* Footer text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-16 text-center font-mono text-[9px] tracking-[0.3em]"
            style={{ color: "rgba(255,255,255,0.06)" }}
          >
            ZYNIVERSE • WATCH PARTY
          </motion.p>
        </div>
      </div>
    </PageTransition>
  );
}
