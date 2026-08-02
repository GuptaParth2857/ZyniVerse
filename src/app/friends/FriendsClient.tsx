"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import ChatButton from "@/components/ChatButton";
import { logError } from "@/lib/logger";

interface FriendUser {
  id: string;
  username: string;
  avatar: string | null;
}

type Tab = "friends" | "requests" | "sent";

export default function FriendsClient() {
  const { status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("friends");
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [requests, setRequests] = useState<{ id: string; sender: FriendUser; createdAt: string }[]>([]);
  const [sent, setSent] = useState<{ id: string; receiver: FriendUser; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<FriendUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [fRes, rRes, sRes] = await Promise.all([
        fetch("/api/friends?type=friends"),
        fetch("/api/friends?type=pending"),
        fetch("/api/friends?type=sent"),
      ]);
      const [fData, rData, sData] = await Promise.all([fRes.json(), rRes.json(), sRes.json()]);
      setFriends(fData.friends ?? []);
      setRequests(rData.requests ?? []);
      setSent(sData.requests ?? []);
    } catch (e) { logError(e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, [status, router, fetchAll]);

  useEffect(() => {
    if (search.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(search.trim())}`);
        const data = await res.json();
        setResults(data.users ?? []);
      } catch (e) { logError(e); }
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  async function accept(id: string) {
    try {
      await fetch(`/api/friends/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      });
      fetchAll();
    } catch (e) { logError(e); }
  }

  async function reject(id: string) {
    try {
      await fetch(`/api/friends/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      });
      fetchAll();
    } catch (e) { logError(e); }
  }

  async function remove(id: string) {
    try {
      await fetch(`/api/friends/${id}`, { method: "DELETE" });
      setFriends((prev) => prev.filter((f) => f.id !== id));
    } catch (e) { logError(e); }
  }

  async function sendRequest(userId: string) {
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: userId }),
      });
      if (res.ok) {
        setRequestedIds((prev) => new Set(prev).add(userId));
      }
    } catch (e) { logError(e); }
  }

  if (status === "loading") return null;

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: "friends", label: "Friends", count: friends.length },
    { key: "requests", label: "Requests", count: requests.length },
    { key: "sent", label: "Sent", count: sent.length },
  ];

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="relative overflow-hidden rounded-2xl neon-rgb-border bg-[var(--color-panel)]/60 backdrop-blur-sm">
            <div className="absolute -top-20 -left-20 h-48 w-48 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(0,255,255,0.15)" }} />
            <div className="absolute -bottom-24 -right-16 h-56 w-56 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(255,0,255,0.1)" }} />
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,0,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.05) 1px, transparent 1px)", backgroundSize: "24px 24px", opacity: 0.4 }} />
            <div className="relative px-6 py-8 sm:px-8 sm:py-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="neon-rgb-border rounded-xl h-12 w-12 flex items-center justify-center bg-[var(--color-panel)]/60 backdrop-blur-sm">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  </svg>
                </div>
                <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: "var(--color-cyan)", textShadow: "0 0 10px rgba(0,255,255,0.5)" }}>
                  Friends
                </span>
              </div>
              <div className="neon-rgb-border rounded-xl px-5 py-2 inline-block">
                <h1 className="font-display text-3xl font-black sm:text-4xl tracking-tight">Friends</h1>
              </div>
              <p className="mt-3 text-sm text-[var(--color-mute)] max-w-lg">
                Send and accept friend requests, and chat with your anime friends on ZyniVerse.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="neon-rgb-border rounded-xl p-0.5 inline-flex bg-[var(--color-panel)]/60 backdrop-blur-sm mb-6">
          <div className="relative flex items-center gap-0.5 p-0.5">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 rounded-lg px-5 sm:px-6 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  tab === t.key ? "bg-white/10" : "text-[var(--color-mute)] hover:text-white hover:bg-white/5"
                }`}
                style={tab === t.key ? { color: "var(--color-cyan)", textShadow: "0 0 10px rgba(0,255,255,0.4)" } : {}}
              >
                {t.label}
                {t.count > 0 && (
                  <span className={`flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold ${tab === t.key ? "bg-[var(--color-cyan)] text-black" : "bg-[var(--color-magenta)] text-black"}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {tab === "friends" && (
          <>
            <div className="mb-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users to add as friends..."
                className="w-full neon-rgb-border bg-[var(--color-void)] rounded-xl px-4 py-3 text-sm outline-none"
              />
              {search.trim().length >= 2 && (
                <div className="mt-2 overflow-hidden rounded-xl neon-rgb-border bg-[var(--color-panel)]/60 backdrop-blur-sm">
                  {searching ? (
                    <div className="p-4 text-sm text-[var(--color-mute)]">Searching...</div>
                  ) : results.length === 0 ? (
                    <div className="p-4 text-sm text-[var(--color-mute)]">No users found.</div>
                  ) : (
                    results.map((u) => {
                      const already = friends.some((f) => f.id === u.id) || requestedIds.has(u.id);
                      return (
                        <div key={u.id} className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-line)]/50 last:border-0">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-magenta)] text-xs font-bold text-black shrink-0 overflow-hidden">
                            {u.avatar ? <Image src={u.avatar} alt="" width={36} height={36} className="object-cover" /> : u.username.charAt(0).toUpperCase()}
                          </div>
                          <Link href={`/profile/${u.id}`} className="min-w-0 flex-1 text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-cyan)] truncate">
                            {u.username}
                          </Link>
                          <button
                            onClick={() => sendRequest(u.id)}
                            disabled={already}
                            className="neon-rgb-border rounded-full px-4 py-1.5 text-xs font-bold text-[var(--color-ink)] hover:text-[var(--color-cyan)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {already ? (friends.some((f) => f.id === u.id) ? "Friends" : "Requested") : "Add Friend"}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl neon-rgb-border bg-[var(--color-panel)]/40" />
                  ))}
                </div>
              ) : friends.length === 0 ? (
                <div className="neon-rgb-border rounded-xl bg-[var(--color-panel)]/60 backdrop-blur-sm p-8 text-center text-sm text-[var(--color-mute)]">
                  No friends yet. Search above to find people and send a friend request!
                </div>
              ) : (
                friends.map((f, i) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    className="group neon-rgb-border rounded-xl bg-[var(--color-panel)]/60 backdrop-blur-sm px-4 py-3 flex items-center gap-3 transition-all duration-300"
                  >
                    <Link href={`/profile/${f.id}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-magenta)] text-sm font-bold text-black shrink-0 overflow-hidden">
                      {f.avatar ? <Image src={f.avatar} alt="" width={40} height={40} className="object-cover" /> : f.username.charAt(0).toUpperCase()}
                    </Link>
                    <Link href={`/profile/${f.id}`} className="min-w-0 flex-1 text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-cyan)] truncate">
                      {f.username}
                    </Link>
                    <ChatButton userId={f.id} username={f.username} />
                    <button
                      onClick={() => remove(f.id)}
                      className="neon-rgb-border rounded-full px-3 py-1.5 text-xs font-bold text-[var(--color-mute)] hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </>
        )}

        {tab === "requests" && (
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl neon-rgb-border bg-[var(--color-panel)]/40" />
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="neon-rgb-border rounded-xl bg-[var(--color-panel)]/60 backdrop-blur-sm p-8 text-center text-sm text-[var(--color-mute)]">
                No pending friend requests.
              </div>
            ) : (
              requests.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="group neon-rgb-border rounded-xl bg-[var(--color-panel)]/60 backdrop-blur-sm px-4 py-3 flex items-center gap-3 transition-all duration-300"
                >
                  <Link href={`/profile/${r.sender.id}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-magenta)] text-sm font-bold text-black shrink-0 overflow-hidden">
                    {r.sender.avatar ? <Image src={r.sender.avatar} alt="" width={40} height={40} className="object-cover" /> : r.sender.username.charAt(0).toUpperCase()}
                  </Link>
                  <Link href={`/profile/${r.sender.id}`} className="min-w-0 flex-1 text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-cyan)] truncate">
                    {r.sender.username}
                  </Link>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => accept(r.id)}
                      className="rounded-full bg-[var(--color-cyan)] neon-rgb-border px-4 py-1.5 text-xs font-bold text-black hover:opacity-90 transition-opacity"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => reject(r.id)}
                      className="neon-rgb-border rounded-full px-4 py-1.5 text-xs font-bold text-[var(--color-mute)] hover:text-red-400 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {tab === "sent" && (
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl neon-rgb-border bg-[var(--color-panel)]/40" />
                ))}
              </div>
            ) : sent.length === 0 ? (
              <div className="neon-rgb-border rounded-xl bg-[var(--color-panel)]/60 backdrop-blur-sm p-8 text-center text-sm text-[var(--color-mute)]">
                You have not sent any friend requests.
              </div>
            ) : (
              sent.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="group neon-rgb-border rounded-xl bg-[var(--color-panel)]/60 backdrop-blur-sm px-4 py-3 flex items-center gap-3 transition-all duration-300"
                >
                  <Link href={`/profile/${r.receiver.id}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-magenta)] text-sm font-bold text-black shrink-0 overflow-hidden">
                    {r.receiver.avatar ? <Image src={r.receiver.avatar} alt="" width={40} height={40} className="object-cover" /> : r.receiver.username.charAt(0).toUpperCase()}
                  </Link>
                  <Link href={`/profile/${r.receiver.id}`} className="min-w-0 flex-1 text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-cyan)] truncate">
                    {r.receiver.username}
                  </Link>
                  <span className="neon-rgb-border rounded-full px-4 py-1.5 text-xs font-bold text-[var(--color-mute)]">
                    Requested
                  </span>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
