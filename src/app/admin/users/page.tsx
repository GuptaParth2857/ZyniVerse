"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { NeonFilterShell } from "@/components/NeonSelect";

interface UserItem {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  lastSeen: string | null;
  createdAt: string;
  userPoints: { points: number; level: number } | null;
  _count: { userAchievements: number; entries: number; mangaEntries: number };
}

interface UserDetail {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  banner: string | null;
  signature: string | null;
  provider: string | null;
  lastSeen: string | null;
  createdAt: string;
  userPoints: { points: number; level: number } | null;
  rank: { name: string; color: string; tier: number };
  userAchievements: Array<{
    id: string;
    earnedAt: string;
    achievement: { code: string; name: string; icon: string; category: string; points: number };
  }>;
  _count: { entries: number; mangaEntries: number; reviews: number; followers: number; following: number };
  entries: Array<{ mediaId: number; title: string; status: string; score: number | null; progress: number; total: number | null }>;
}

function getRank(points: number) {
  if (points >= 10000) return { name: "Grandmaster", color: "#FF6B00", tier: 7 };
  if (points >= 5000) return { name: "Heroic", color: "#FF4444", tier: 6 };
  if (points >= 2500) return { name: "Diamond", color: "#B9F2FF", tier: 5 };
  if (points >= 1000) return { name: "Platinum", color: "#00D4FF", tier: 4 };
  if (points >= 500) return { name: "Gold", color: "#FFD700", tier: 3 };
  if (points >= 100) return { name: "Silver", color: "#C0C0C0", tier: 2 };
  return { name: "Bronze", color: "#CD7F32", tier: 1 };
}

function formatSeen(iso: string | null): string {
  if (!iso) return "Never seen";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function CardStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/60 px-2 py-2 text-center">
      <div className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-mute)]">{label}</div>
      <div className="mt-0.5 font-mono text-sm font-bold" style={{ color }}>{value}</div>
    </div>
  );
}

function UserCard({ user, index, onOpen }: { user: UserItem; index: number; onOpen: () => void }) {
  const points = user.userPoints?.points || 0;
  const level = user.userPoints?.level || 1;
  const rank = getRank(points);
  const accent = rank.color;

  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = (e.clientX - cx) / (rect.width / 2);
    const py = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `perspective(900px) rotateY(${px * 5}deg) rotateX(${-py * 5}deg) scale(1.02)`;
  }, []);

  const handlePointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)";
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 26, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: (index % 9) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={onOpen}
      className="neon-premium cursor-pointer rounded-[20px]"
      style={{ transition: "transform 0.2s ease-out" }}
    >
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
      <div className="neon-premium-content rounded-[20px] p-5">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
                style={{ boxShadow: `0 0 16px ${accent}66` }}
              />
            ) : (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full border text-lg font-bold"
                style={{ color: accent, borderColor: `${accent}55`, background: `${accent}12`, boxShadow: `0 0 16px ${accent}55` }}
              >
                {user.username[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-bold text-[var(--color-ink)]">{user.username}</span>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}88` }} />
            </div>
            <div className="truncate text-[11px] text-[var(--color-mute)]">{user.email}</div>
            <span
              className="mt-1.5 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: accent, borderColor: `${accent}44`, background: `${accent}14` }}
            >
              {rank.name}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <CardStat label="Points" value={points.toLocaleString("en-IN")} color="var(--color-amber)" />
          <CardStat label="Level" value={`Lv.${level}`} color="var(--color-cyan)" />
          <CardStat label="Trophies" value={String(user._count.userAchievements)} color="var(--color-violet)" />
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--color-mute)]">
          <span>{user._count.entries} anime</span>
          <span className="text-[var(--color-line)]">·</span>
          <span>{user._count.mangaEntries} manga</span>
          <span className="text-[var(--color-line)]">·</span>
          <span>{user._count.userAchievements} trophies</span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[var(--color-line)] pt-2.5">
          <span className="font-mono text-[10px] text-[var(--color-mute)]">{formatSeen(user.lastSeen)}</span>
          <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: accent }}>
            View →
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function UserCardSkeleton() {
  return (
    <div className="neon-premium animate-pulse rounded-[20px]">
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
      <div className="neon-premium-content rounded-[20px] p-5">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-full bg-white/5" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/3 rounded bg-white/10" />
            <div className="h-2.5 w-4/5 rounded bg-white/5" />
            <div className="h-4 w-20 rounded-full bg-white/5" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-white/5" />
          ))}
        </div>
        <div className="mt-4 h-2.5 w-1/2 rounded bg-white/5" />
        <div className="mt-4 h-px bg-white/5" />
        <div className="mt-2.5 h-2.5 w-1/3 rounded bg-white/5" />
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const limit = 12;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(limit), offset: String((page - 1) * limit) });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/users?${params}`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
    }
    setLoading(false);
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchUsers, search]);

  const loadDetail = async (id: string) => {
    setLoadingDetail(true);
    const res = await fetch(`/api/admin/users/${id}`);
    if (res.ok) {
      const data = await res.json();
      setSelectedUser(data.user);
    }
    setLoadingDetail(false);
  };

  const detailPoints = selectedUser?.userPoints?.points || 0;
  const detailRank = selectedUser?.rank;

  return (
    <div className="mx-auto max-w-6xl">
      <section className="mb-8">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-magenta)]/40 bg-[var(--color-magenta)]/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)] shadow-[0_0_16px_rgba(255,64,146,0.25)]">
          ✦ User Management
        </p>
        <div className="neon-rgb-border inline-block rounded-2xl px-5 py-3">
          <h1 className="bg-gradient-to-r from-[var(--color-cyan)] via-white to-[var(--color-magenta)] bg-clip-text font-display text-3xl font-bold text-transparent sm:text-4xl">
            Registered Users
          </h1>
        </div>
        <p className="mt-4 max-w-2xl text-sm text-[var(--color-mute)]">
          Manage every account on ZyniVerse — ranks, points, achievements, and anime lists.
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <NeonFilterShell className="flex-1 min-w-[220px]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-3.5 shrink-0 text-[var(--color-mute)] group-focus-within:text-[var(--color-magenta)] transition-colors">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by username or email..."
            className="w-full bg-transparent py-3 pr-4 text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-mute)]"
          />
        </NeonFilterShell>
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-mute)]">
          <span className="font-semibold text-[var(--color-cyan)]">{total}</span> registered users
        </div>
      </div>

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <UserCardSkeleton key={i} />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/50 px-6 py-16">
          <p className="text-lg text-[var(--color-mute)]">No users found</p>
          <p className="text-sm text-[var(--color-mute)]/70">Try a different search.</p>
          <button
            onClick={() => { setSearch(""); setPage(1); }}
            className="rounded-xl border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-5 py-2.5 text-sm font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-colors"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          <div className="mt-8 flex items-center gap-3">
            <p className="text-sm text-[var(--color-mute)]">
              Showing <span className="font-semibold text-[var(--color-cyan)]">{users.length}</span> of{" "}
              <span className="font-semibold text-[var(--color-cyan)]">{total}</span> users
            </p>
            <span className="h-px flex-1 bg-gradient-to-r from-[var(--color-line)] to-transparent" />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((u, i) => (
              <UserCard key={u.id} user={u} index={i} onOpen={() => loadDetail(u.id)} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-2.5 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:border-[var(--color-cyan)]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← Previous
              </button>
              <span className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2.5 text-sm text-[var(--color-cyan)]">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-2.5 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:border-[var(--color-cyan)]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="neon-premium w-full max-w-2xl rounded-[24px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="neon-premium-track" />
              <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.95)" }} />
              <div className="neon-premium-content max-h-[85vh] overflow-y-auto rounded-[24px] p-6 sm:p-8">
                {loadingDetail ? (
                  <div className="space-y-4 py-10">
                    <div className="h-12 w-12 animate-pulse rounded-full bg-white/10" />
                    <div className="h-5 w-1/2 animate-pulse rounded bg-white/10" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-4">
                      {selectedUser.avatar ? (
                        <Image
                          src={selectedUser.avatar}
                          alt=""
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-full object-cover"
                          style={{ boxShadow: `0 0 18px ${detailRank?.color || "#00ffe0"}66` }}
                        />
                      ) : (
                        <div
                          className="flex h-16 w-16 items-center justify-center rounded-full border text-2xl font-bold"
                          style={{
                            color: detailRank?.color || "var(--color-cyan)",
                            borderColor: `${detailRank?.color || "#00ffe0"}55`,
                            background: `${detailRank?.color || "#00ffe0"}12`,
                            boxShadow: `0 0 18px ${detailRank?.color || "#00ffe0"}55`,
                          }}
                        >
                          {selectedUser.username[0].toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-xl font-bold text-[var(--color-ink)]">{selectedUser.username}</h2>
                        <p className="truncate text-xs text-[var(--color-mute)]">{selectedUser.email}</p>
                        {selectedUser.signature && (
                          <p className="mt-0.5 truncate text-xs italic text-[var(--color-mute)]">{selectedUser.signature}</p>
                        )}
                        {detailRank && (
                          <span
                            className="mt-2 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                            style={{ color: detailRank.color, borderColor: `${detailRank.color}44`, background: `${detailRank.color}14` }}
                          >
                            {detailRank.name}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="shrink-0 rounded-full border border-[var(--color-line)] bg-[var(--color-void)]/60 px-2.5 py-1 text-sm text-[var(--color-mute)] hover:text-white hover:border-white/30 transition-colors"
                        aria-label="Close"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
                      <CardStat label="Points" value={(detailPoints).toLocaleString("en-IN")} color="var(--color-amber)" />
                      <CardStat label="Level" value={`Lv.${selectedUser.userPoints?.level || 1}`} color="var(--color-cyan)" />
                      <CardStat label="Anime" value={String(selectedUser._count.entries)} color="var(--color-violet)" />
                      <CardStat label="Manga" value={String(selectedUser._count.mangaEntries)} color="var(--color-magenta)" />
                      <CardStat label="Followers" value={String(selectedUser._count.followers)} color="var(--color-cyan)" />
                      <CardStat label="Reviews" value={String(selectedUser._count.reviews)} color="var(--color-amber)" />
                    </div>

                    {selectedUser.bio && (
                      <p className="mt-5 text-sm text-[var(--color-mute)]">{selectedUser.bio}</p>
                    )}

                    <p className="mt-4 font-mono text-[10px] text-[var(--color-mute)]">
                      Joined {new Date(selectedUser.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      {selectedUser.lastSeen && <> · Last seen {formatSeen(selectedUser.lastSeen)}</>}
                      {selectedUser.provider && <> · Provider: {selectedUser.provider}</>}
                    </p>

                    {selectedUser.userAchievements.length > 0 && (
                      <div className="mt-6">
                        <h3 className="mb-3 text-sm font-semibold text-[var(--color-ink)]">
                          Achievements ({selectedUser.userAchievements.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.userAchievements.map((a) => (
                            <div
                              key={a.id}
                              className="flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-void)]/60 px-2.5 py-1.5 text-xs"
                            >
                              <span>{a.achievement.icon}</span>
                              <span>{a.achievement.name}</span>
                              <span className="font-mono text-[var(--color-mute)]">({a.achievement.points}pt)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedUser.entries.length > 0 && (
                      <div className="mt-6">
                        <h3 className="mb-3 text-sm font-semibold text-[var(--color-ink)]">Recent Anime</h3>
                        <div className="space-y-1.5">
                          {selectedUser.entries.map((e) => (
                            <div
                              key={e.mediaId}
                              className="flex items-center justify-between rounded-lg border border-[var(--color-line)] bg-[var(--color-void)]/40 px-3 py-2 text-xs"
                            >
                              <span className="truncate text-[var(--color-ink)]">{e.title}</span>
                              <div className="flex shrink-0 items-center gap-3 pl-3">
                                <span className="rounded-full border border-[var(--color-line)] px-2 py-0.5 text-[10px] font-mono uppercase text-[var(--color-mute)]">
                                  {e.status}
                                </span>
                                {e.score != null && (
                                  <span className="font-mono text-[var(--color-amber)]">{e.score}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
