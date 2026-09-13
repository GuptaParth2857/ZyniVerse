"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface CommissionItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  category: string;
  priceMin: number | null;
  priceMax: number | null;
  turnaround: string | null;
  portfolio: string;
  requestCount: number;
  isActive: boolean;
  createdAt: string;
  user: { id: string; username: string; avatar: string | null };
}

const CATEGORIES: Record<string, { label: string; color: string; icon: string }> = {
  fanart: { label: "Fan Art", color: "#8a5cff", icon: "🎨" },
  cosplay: { label: "Cosplay", color: "#ff2d78", icon: "📸" },
  music: { label: "Music", color: "#29f2e0", icon: "🎵" },
  editing: { label: "Editing", color: "#ffb020", icon: "✂️" },
  other: { label: "Other", color: "#3b82f6", icon: "✨" },
};

const SPRING = { type: "spring", stiffness: 260, damping: 22 } as const;
const EASE = [0.22, 1, 0.36, 1] as const;

function formatPrice(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="h-4 w-40 animate-pulse rounded-full bg-white/[0.06]" />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="aspect-[4/3] animate-pulse rounded-2xl border border-[var(--color-line)] bg-white/[0.04]" />
        <div className="space-y-4">
          <div className="h-3 w-24 animate-pulse rounded-full bg-white/[0.06]" />
          <div className="h-8 w-3/4 animate-pulse rounded-lg bg-white/[0.07]" />
          <div className="h-3 w-full animate-pulse rounded-full bg-white/[0.05]" />
          <div className="h-3 w-5/6 animate-pulse rounded-full bg-white/[0.05]" />
          <div className="space-y-2.5 pt-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-white/[0.04]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { ...SPRING } } }}
      className="group flex items-center justify-between rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 transition-colors hover:border-[var(--color-cyan)]/30"
    >
      <span className="flex items-center gap-2.5 text-xs text-[var(--color-mute)]">
        <span className="text-sm">{icon}</span>
        {label}
      </span>
      <span className="text-sm font-bold text-white">{value}</span>
    </motion.div>
  );
}

export default function CommissionDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [commission, setCommission] = useState<CommissionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    fetch(`/api/commissions/${params.id}`)
      .then((r) => r.json())
      .then((data) => setCommission(data.commission))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <PageTransition>
        <DetailSkeleton />
      </PageTransition>
    );
  }

  if (!commission) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-5xl px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Commission Not Found</h1>
          <Link href="/commissions" className="text-[var(--color-cyan)] text-sm">Back to Marketplace</Link>
        </div>
      </PageTransition>
    );
  }

  const cat = CATEGORIES[commission.category] || CATEGORIES.other;

  let portfolioImages: string[] = [];
  try {
    portfolioImages = JSON.parse(commission.portfolio || "[]");
  } catch {}

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRequesting(true);
    try {
      const res = await fetch(`/api/commissions/${commission.id}/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send request");
      setRequested(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send request");
    } finally {
      setRequesting(false);
    }
  };

  const isOwner = session?.user?.id === commission.user.id;

  return (
    <PageTransition>
      <ErrorBoundary label="Commission">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="mb-6"
          >
            <Link href="/commissions" className="text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors">
              ← Back to Marketplace
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--color-line)]">
                {commission.imageUrl ? (
                  <Image
                    src={commission.imageUrl}
                    alt={commission.title}
                    fill
                    onError={() => setImgError(true)}
                    className={`object-cover transition-transform duration-700 ${imgError ? "opacity-0" : ""}`}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-violet)]/20 to-[var(--color-magenta)]/20">
                    <span className="text-6xl opacity-60">{cat.icon}</span>
                  </div>
                )}
                {imgError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-magenta)]">
                    <span className="text-6xl opacity-80">{cat.icon}</span>
                  </div>
                )}
                <div className="award-sheen" />
                <span
                  className="glass-badge absolute left-3 top-3 flex items-center gap-1"
                  style={{ color: cat.color, borderColor: `color-mix(in srgb, ${cat.color} 40%, transparent)` }}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </span>
              </div>

              {portfolioImages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5, ease: EASE }}
                  className="mt-4"
                >
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-mute)]">Portfolio</p>
                  <div className="grid grid-cols-3 gap-2">
                    {portfolioImages.map((img, i) => (
                      <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--color-line)]">
                        <Image src={img} alt={`Portfolio ${i + 1}`} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 1024px) 30vw, 15vw" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.5, ease: EASE }}
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.12, ...SPRING }}
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-cyan)] mb-2"
              >
                Commission
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16, ...SPRING }}
                className="font-display text-3xl font-bold"
              >
                {commission.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-mute)]"
              >
                {commission.description}
              </motion.p>

              <motion.div
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
                initial="hidden"
                animate="show"
                className="mt-6 space-y-3"
              >
                <StatRow
                  icon="💸"
                  label="Price Range"
                  value={
                    commission.priceMin != null
                      ? `${formatPrice(commission.priceMin)}${commission.priceMax != null ? ` - ${formatPrice(commission.priceMax)}` : "+"}`
                      : "Negotiable"
                  }
                />
                <StatRow icon="⏱️" label="Turnaround" value={commission.turnaround || "Flexible"} />
                <StatRow icon="📩" label="Requests" value={String(commission.requestCount)} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, ...SPRING }}
              >
                <Link
                  href={`/profile/${commission.user.username}`}
                  className="group mt-6 flex items-center gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-3 transition-colors hover:border-[var(--color-cyan)]"
                >
                  <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-cyan)]">
                    {commission.user.avatar ? (
                      <Image src={commission.user.avatar} alt={commission.user.username} fill className="object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-black">{commission.user.username[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">@{commission.user.username}</p>
                    <p className="text-[10px] text-[var(--color-mute)] group-hover:text-[var(--color-cyan)] transition-colors">
                      View Profile
                    </p>
                  </div>
                </Link>
              </motion.div>

              {!isOwner && session?.user?.id && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.34, ...SPRING }}
                  className="mt-6 rounded-2xl neon-rgb-border bg-[var(--color-panel)] p-5"
                >
                  {requested ? (
                    <div className="text-center py-4">
                      <motion.span
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 18 }}
                        className="text-4xl mb-3 block"
                      >
                        ✅
                      </motion.span>
                      <h3 className="font-display text-lg font-bold text-green-400">Request Sent!</h3>
                      <p className="mt-1 text-xs text-[var(--color-mute)]">
                        {commission.user.username} will review your request and get back to you.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleRequest}>
                      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-mute)]">Request Commission</p>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`Tell ${commission.user.username} what you want...`}
                        rows={3}
                        className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 px-4 py-3 text-sm text-white placeholder-white/20 outline-none resize-none focus:border-[var(--color-cyan)] transition-colors"
                      />
                      {error && (
                        <div className="mt-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                          {error}
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={requesting}
                        className="mt-3 w-full rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] py-3 text-sm font-bold text-black transition-all hover:opacity-90 disabled:opacity-50"
                      >
                        {requesting ? "Sending..." : "Request Commission"}
                      </button>
                    </form>
                  )}
                </motion.div>
              )}

              {isOwner && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.34, ...SPRING }}
                  className="mt-6 rounded-2xl border border-[var(--color-cyan)]/20 bg-[var(--color-cyan)]/5 p-5"
                >
                  <p className="text-sm text-[var(--color-cyan)]">
                    This is your commission listing. Requests from clients will appear here.
                  </p>
                </motion.div>
              )}

              {!session?.user?.id && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.34, ...SPRING }}
                  className="mt-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5"
                >
                  <p className="text-sm text-[var(--color-mute)]">
                    <Link href="/login" className="text-[var(--color-cyan)]">Sign in</Link> to request this commission.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
}