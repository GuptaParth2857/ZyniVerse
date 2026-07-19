"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

interface Nominee {
  id: string;
  mediaId: number;
  title: string;
  image: string | null;
  votes: number;
}

interface AwardCategory {
  id: string;
  category: string;
  title: string;
  status: string;
  nominees: Nominee[];
}

const CATEGORY_EMOJIS: Record<string, string> = {
  ANIME_OF_YEAR: "🏆", BEST_ACTION: "⚔️", BEST_ROMANCE: "💕", BEST_COMEDY: "😂",
  BEST_FANTASY: "🧙", BEST_DRAMA: "🎭", BEST_ANIMATION: "🎨", BEST_NEW_SERIES: "✨",
  BEST_SCORE: "🎵", BEST_VILLAIN: "😈", BEST_CHARACTER: "👤", BEST_OPENING: "🎶",
  BEST_FILM: "🎬", BEST_TV_ANIME: "📺", BEST_CONTINUING: "🔄", BEST_SLICE_OF_LIFE: "🌸",
  BEST_DIRECTOR: "🎥", BEST_CHARACTER_DESIGN: "✏️", BEST_ENDING: "🎵", BEST_SOUNDTRACK: "🎶",
  BEST_BOY: "👦", BEST_GIRL: "👧", BEST_COUPLE: "💑", BEST_VA: "🎤",
  BEST_MANGA: "📖", BEST_ORIGINAL: "💎", BEST_ISEKAI: "🌀", BEST_BACKGROUND_ART: "🏔️",
};

function NeonBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-[20px] ${className}`}>
      <div className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{
          background: "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent, #00ffe0)",
          animation: "spin 6s linear infinite", willChange: "transform",
        }} />
        <div className="absolute inset-[1.5px] rounded-[18.5px]" style={{ background: "rgba(10,10,15,0.95)" }} />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function CategoryCard({
  award,
  year,
  onVote,
  votedId,
}: {
  award: AwardCategory;
  year: number;
  onVote: (nomineeId: string) => void;
  votedId: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const emoji = CATEGORY_EMOJIS[award.category] || "🏆";
  const sorted = [...award.nominees].sort((a, b) => b.votes - a.votes);
  const maxVotes = sorted[0]?.votes || 1;
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <NeonBorder>
        <div className="p-5 rounded-[20px] bg-gradient-to-br from-gray-900/80 to-gray-950/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">{emoji}</span>
              <h3 className="text-white font-bold text-sm">{award.title}</h3>
            </div>
            <span className="text-[10px] font-mono text-[rgba(255,255,255,0.2)] uppercase tracking-wider">
              {award.nominees.length} nominees
            </span>
          </div>

          {award.nominees.length === 0 ? (
            <p className="text-center py-6 text-[rgba(255,255,255,0.2)] text-xs">
              No nominees yet. Be the first to nominate!
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {top3.map((n, i) => (
                  <button
                    key={n.id}
                    onClick={() => onVote(n.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-[14px] transition-all duration-300 group ${
                      votedId === n.id
                        ? "bg-gradient-to-r from-[#00ffe0]/15 to-[#7000ff]/15 border border-[#00ffe0]/30 shadow-[0_0_20px_-8px_rgba(0,255,224,0.3)]"
                        : "bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]"
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                      i === 0 ? "bg-gradient-to-br from-yellow-500 to-amber-600 text-black" :
                      i === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400 text-black" :
                      "bg-gradient-to-br from-orange-700 to-orange-800 text-white"
                    }`}>
                      {i + 1}
                    </span>
                    {n.image ? (
                      <img src={n.image} alt="" className="w-8 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-10 rounded-lg bg-gradient-to-br from-purple-600/30 to-indigo-700/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-white/30">{n.title.charAt(0)}</span>
                      </div>
                    )}
                    <span className="text-xs text-white/80 flex-1 text-left truncate">{n.title}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-16 h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#00ffe0] to-[#7000ff]"
                          style={{ width: `${(n.votes / maxVotes) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-[rgba(255,255,255,0.3)] w-8 text-right">
                        {n.votes}
                      </span>
                    </div>
                    {votedId === n.id && (
                      <span className="text-[10px] text-[#00ffe0] font-bold">VOTED</span>
                    )}
                  </button>
                ))}
              </div>

              {rest.length > 0 && (
                <>
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full mt-3 py-2 text-[10px] text-[rgba(255,255,255,0.25)] hover:text-[rgba(255,255,255,0.4)] transition-colors"
                  >
                    {expanded ? "Show less" : `+${rest.length} more nominees`}
                  </button>
                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2 pt-2">
                          {rest.map((n) => (
                            <button
                              key={n.id}
                              onClick={() => onVote(n.id)}
                              className={`w-full flex items-center gap-3 p-3 rounded-[14px] transition-all duration-300 ${
                                votedId === n.id
                                  ? "bg-gradient-to-r from-[#00ffe0]/15 to-[#7000ff]/15 border border-[#00ffe0]/30"
                                  : "bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.06)]"
                              }`}
                            >
                              {n.image ? (
                                <img src={n.image} alt="" className="w-8 h-10 rounded-lg object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-8 h-10 rounded-lg bg-gradient-to-br from-purple-600/30 to-indigo-700/30 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs text-white/30">{n.title.charAt(0)}</span>
                                </div>
                              )}
                              <span className="text-xs text-white/80 flex-1 text-left truncate">{n.title}</span>
                              <span className="text-[10px] font-mono text-[rgba(255,255,255,0.3)]">{n.votes} votes</span>
                              {votedId === n.id && (
                                <span className="text-[10px] text-[#00ffe0] font-bold">VOTED</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </>
          )}
        </div>
      </NeonBorder>
    </motion.div>
  );
}

export default function NomineesPage({ params }: { params: Promise<{ year: string }> }) {
  const [year, setYear] = useState(0);
  const [awards, setAwards] = useState<AwardCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [votedMap, setVotedMap] = useState<Record<string, string>>({});
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ year: y }) => {
      const yr = Number(y);
      setYear(yr);
      fetchAwards(yr);
    });
  }, [params]);

  const fetchAwards = (yr: number) => {
    fetch(`/api/zyni-awards/${yr}/nominees`)
      .then((r) => r.json())
      .then((d) => { setAwards(d.awards || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleImport = async () => {
    setImporting(true);
    setImportResult(null);
    try {
      const res = await fetch(`/api/zyni-awards/${year}/nominees`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setImportResult(`Imported ${data.imported} nominees (${data.skipped} already exist, ${data.totalScraped} scraped)`);
        fetchAwards(year);
      } else {
        setImportResult(`Error: ${data.error}`);
      }
    } catch {
      setImportResult("Import failed");
    }
    setImporting(false);
  };

  const handleVote = useCallback(async (nomineeId: string) => {
    const award = awards.find((a) => a.nominees.some((n) => n.id === nomineeId));
    if (!award) return;

    await fetch(`/api/zyni-awards/${year}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: award.category, nomineeId }),
    });

    setVotedMap((prev) => ({ ...prev, [award.category]: nomineeId }));
    fetchAwards(year);
  }, [awards, year]);

  const filteredAwards = selectedCat
    ? awards.filter((a) => a.category === selectedCat)
    : awards;

  const totalNominees = awards.reduce((sum, a) => sum + a.nominees.length, 0);
  const totalVotes = awards.reduce((sum, a) => sum + a.nominees.reduce((s, n) => s + n.votes, 0), 0);

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d0d1a] to-[#050510]" />
        <div className="absolute inset-0 opacity-[0.35] pointer-events-none" style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 120px 40px rgba(0,0,0,0.6)" }} />

        {/* Floating orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div className="absolute top-[10%] left-[5%] w-[350px] h-[350px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(0,255,224,0.06) 0%, transparent 70%)", filter: "blur(60px)" }}
            animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div className="absolute top-[40%] right-[10%] w-[280px] h-[280px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,0,230,0.05) 0%, transparent 70%)", filter: "blur(60px)" }}
            animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20">
          {/* Breadcrumb */}
          <nav className="text-sm mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2">
              <li><Link href="/" className="hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}>Home</Link></li>
              <li style={{ color: "rgba(255,255,255,0.15)" }}>/</li>
              <li><Link href="/awards" className="hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}>Awards</Link></li>
              <li style={{ color: "rgba(255,255,255,0.15)" }}>/</li>
              <li className="text-white">Nominees {year}</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="text-center mb-10">
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff00e6] mb-2">
              Community Voting
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] bg-clip-text text-transparent">
              ZyniVerse Awards {year}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="mt-3" style={{ color: "rgba(255,255,255,0.35)" }}>
              Vote for your favorites. {totalNominees} nominees across {awards.length} categories.
            </motion.p>
          </div>

          {/* Stats + Import */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <div className="flex gap-4">
              <div className="px-4 py-2 rounded-[14px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
                <span className="text-white font-bold text-lg">{totalNominees}</span>
                <span className="text-[rgba(255,255,255,0.25)] text-xs ml-1.5">nominees</span>
              </div>
              <div className="px-4 py-2 rounded-[14px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
                <span className="text-[#00ffe0] font-bold text-lg">{totalVotes}</span>
                <span className="text-[rgba(255,255,255,0.25)] text-xs ml-1.5">votes</span>
              </div>
            </div>
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-5 py-2.5 rounded-[12px] bg-gradient-to-r from-[#ff00e6] to-[#7000ff] text-white text-xs font-bold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_-8px_rgba(255,0,230,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {importing ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Scraping...
                </span>
              ) : "Fetch Nominees"}
            </button>
          </div>

          {importResult && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 mx-auto max-w-md text-center px-4 py-3 rounded-[14px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-xs text-[rgba(255,255,255,0.5)]">
              {importResult}
            </motion.div>
          )}

          {/* Category Filter */}
          {awards.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              <button
                onClick={() => setSelectedCat(null)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  !selectedCat
                    ? "bg-white text-gray-900 shadow-lg shadow-white/10"
                    : "bg-[rgba(255,255,255,0.03)] text-[rgba(255,255,255,0.4)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.06)]"
                }`}
              >
                All Categories
              </button>
              {awards.filter((a) => a.nominees.length > 0).map((a) => (
                <button
                  key={a.category}
                  onClick={() => setSelectedCat(selectedCat === a.category ? null : a.category)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                    selectedCat === a.category
                      ? "bg-gradient-to-r from-[#00ffe0]/20 to-[#7000ff]/20 text-white border border-[#00ffe0]/30"
                      : "bg-[rgba(255,255,255,0.03)] text-[rgba(255,255,255,0.4)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.06)]"
                  }`}
                >
                  {CATEGORY_EMOJIS[a.category] || "🏆"} {a.title}
                </button>
              ))}
            </div>
          )}

          {/* Cards Grid */}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 rounded-[20px] bg-[rgba(255,255,255,0.03)] animate-pulse" />
              ))}
            </div>
          ) : filteredAwards.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[rgba(255,255,255,0.3)] text-lg mb-4">No nominees found for {year}</p>
              <button
                onClick={handleImport}
                className="px-6 py-3 rounded-[14px] bg-gradient-to-r from-[#00ffe0] to-[#7000ff] text-white text-sm font-bold"
              >
                Import Nominees Now
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAwards.map((award) => (
                <CategoryCard
                  key={award.category}
                  award={award}
                  year={year}
                  onVote={handleVote}
                  votedId={votedMap[award.category] || null}
                />
              ))}
            </div>
          )}

          {/* Footer */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
            className="mt-16 text-center font-mono text-[9px] tracking-[0.3em]"
            style={{ color: "rgba(255,255,255,0.06)" }}>
            ZYNIVERSE • v2.4.1 • ENCRYPTED
          </motion.p>
        </div>
      </div>
    </PageTransition>
  );
}
