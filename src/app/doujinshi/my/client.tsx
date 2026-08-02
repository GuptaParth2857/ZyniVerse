"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Loader from "@/components/Loader";
import type { DoujinshiEntry } from "@/lib/mangadex-api";

interface TrackedItem {
  entry: {
    id: string;
    doujinshiId: string;
    status: string;
    pagesRead: number;
    updatedAt: string;
  };
  doujinshi: DoujinshiEntry;
}

const STATUS_LABELS: Record<string, string> = {
  read: "Read",
  reading: "Reading",
  want: "Want to Read",
  favorite: "Favorite",
};

const STATUS_COLORS: Record<string, string> = {
  read: "var(--color-magenta)",
  reading: "var(--color-violet)",
  want: "var(--color-cyan)",
  favorite: "var(--color-amber)",
};

export default function DoujinshiMyClient() {
  const { data: session } = useSession();
  const [items, setItems] = useState<TrackedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!session?.user?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    const url = filter ? `/api/doujinshi/my?status=${filter}` : "/api/doujinshi/my";    fetch(url)
      .then((r) => r.json())
      .then((data) => setItems(data.entries || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, filter]);

  if (!session) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">My Doujinshi</h1>
          <p className="text-[var(--color-mute)] mb-6">Sign in to track doujinshi.</p>
          <Link href="/login" className="rounded-full bg-[var(--color-magenta)] px-6 py-2 text-sm font-semibold text-black">
            Sign In
          </Link>
        </div>
      </PageTransition>
    );
  }

  if (loading) return <Loader label="Loading your collection..." />;

  return (
    <PageTransition>
      <ErrorBoundary label="DoujinshiMy">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 animate-page-in">
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-violet)]">{/* Collection */}</p>
            <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block mt-1">
              <h1 className="font-display text-3xl font-bold">My Doujinshi</h1>
            </div>
            <p className="mt-2 text-sm text-[var(--color-mute)]">
              Track your doujinshi reading journey.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="mb-6 flex flex-wrap gap-2">
            {["", "reading", "want", "read", "favorite"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`neon-rgb-border rounded-full px-5 py-2.5 text-xs font-semibold transition-all ${
                  filter === s
                    ? "bg-[var(--color-magenta)] text-black"
                    : "text-[var(--color-mute)] hover:text-[var(--color-magenta)]"
                }`}
              >
                {s ? STATUS_LABELS[s] || s : "All"}
              </button>
            ))}
          </div>

          {items.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-4xl mb-4">📖</div>
              <p className="text-[var(--color-mute)] text-sm mb-4">
                {filter ? "No doujinshi with this status." : "You haven't tracked any doujinshi yet."}
              </p>
              <Link
                href="/doujinshi"
                className="rounded-full bg-[var(--color-magenta)] px-5 py-2 text-sm font-semibold text-black"
              >
                Browse Doujinshi
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, i) => (
                <motion.div
                  key={item.entry.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={`/doujinshi/${item.doujinshi.id}`}
                    className="flex items-center gap-4 rounded-xl neon-rgb-border bg-[var(--color-panel)]/60 backdrop-blur-sm p-4 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    {/* Cover */}
                    <div className="relative h-14 w-10 shrink-0 rounded overflow-hidden neon-rgb-border">
                      {item.doujinshi.image ? (
                        <Image src={item.doujinshi.image} alt={item.doujinshi.title} fill className="object-cover" sizes="40px" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-magenta)]/10 to-[var(--color-violet)]/10">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-mute)" strokeWidth="1.5">
                            <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5V4.5A2.5 2.5 0 016.5 2H20v15H6.5A2.5 2.5 0 004 19.5z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold truncate">{item.doujinshi.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.doujinshi.circle && (
                          <span className="text-[10px] text-[var(--color-mute)]">{item.doujinshi.circle}</span>
                        )}
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: `${STATUS_COLORS[item.entry.status]}20`,
                            color: STATUS_COLORS[item.entry.status],
                          }}
                        >
                          {STATUS_LABELS[item.entry.status] || item.entry.status}
                        </span>
                      </div>
                    </div>

                    {item.entry.pagesRead > 0 && (
                      <span className="text-[10px] font-mono text-[var(--color-mute)]">
                        {item.entry.pagesRead}p
                      </span>
                    )}

                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)]">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
}
