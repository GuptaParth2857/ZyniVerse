"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { PageTransition } from "@/components/PageTransition";
import { logError } from "@/lib/logger";

interface ReelUser {
  id: string;
  username: string;
  avatar: string | null;
}

interface Reel {
  id: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  duration: number;
  views: number;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  user: ReelUser;
}

interface ReelComment {
  id: string;
  content: string;
  createdAt: string;
  user: ReelUser;
}

const REPORT_REASONS: { key: string; label: string; desc: string }[] = [
  { key: "copyright", label: "Copyright", desc: "Infringes on a copyright or trademark" },
  { key: "inappropriate", label: "Inappropriate", desc: "Sexual, violent or offensive content" },
  { key: "spam", label: "Spam", desc: "Misleading, fraudulent or repetitive" },
  { key: "harassment", label: "Harassment", desc: "Bullying, hate speech or harassment" },
  { key: "other", label: "Other", desc: "Something else entirely" },
];
const RATE_LIMIT_MS = 800;

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function VolumeMuteIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function ActionButton({
  label,
  onClick,
  children,
  ariaLabel,
  dim,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  ariaLabel: string;
  dim?: boolean;
}) {
  return (
    <button onClick={onClick} aria-label={ariaLabel} className="group flex flex-col items-center gap-1 text-white">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/45 backdrop-blur transition-all duration-200 group-hover:bg-pink-600/80 group-hover:scale-110 active:scale-90">
        {children}
      </span>
      <span className={`text-[11px] font-semibold ${dim ? "text-white/70" : "text-white"}`}>{label}</span>
    </button>
  );
}

export default function ReelsPage() {
  return (
    <Suspense fallback={null}>
      <ReelsFeed />
    </Suspense>
  );
}

function ReelsFeed() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const deepLinkId = searchParams.get("reel");
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [commentsFor, setCommentsFor] = useState<Reel | null>(null);
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [reporting, setReporting] = useState<Reel | null>(null);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const viewedRef = useRef<Set<string>>(new Set());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/reels?page=${page}&limit=10`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setReels((prev) => (page === 1 ? d.reels || [] : [...prev, ...(d.reels || [])]));
        setTotalPages(d.pagination?.totalPages || 1);
        setLoading(false);
        setLoadingMore(false);
      })
      .catch((e) => {
        logError(e);
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }, []);

  const registerView = useCallback((id: string) => {
    if (viewedRef.current.has(id)) return;
    viewedRef.current.add(id);
    fetch(`/api/reels/${id}/view`, { method: "POST" }).catch((e) => logError(e));
  }, []);

  const playActive = useCallback(() => {
    Object.entries(videoRefs.current).forEach(([id, vid]) => {
      if (!vid) return;
      const shouldPlay = id === reels[activeIndex]?.id;
      if (shouldPlay) {
        vid.muted = muted;
        vid.play().catch(() => {});
        if (!viewedRef.current.has(id)) registerView(id);
      } else {
        vid.pause();
      }
    });
  }, [activeIndex, reels, muted, registerView]);

  useEffect(() => {
    if (loading || reels.length === 0) return;
    playActive();
  }, [activeIndex, loading, reels, playActive]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      { threshold: 0.6 }
    );

    const slides = container.querySelectorAll<HTMLElement>("[data-index]");
    slides.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [reels, loading]);

  const goTo = useCallback((dir: number) => {
    const next = Math.min(Math.max(activeIndex + dir, 0), reels.length - 1);
    setActiveIndex(next);
    const el = containerRef.current?.querySelector<HTMLElement>(`[data-index="${next}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeIndex, reels.length]);

  const scrolledToDeepLink = useRef(false);
  useEffect(() => {
    if (!deepLinkId || scrolledToDeepLink.current || reels.length === 0) return;
    const idx = reels.findIndex((r) => r.id === deepLinkId);
    if (idx === -1) return;
    scrolledToDeepLink.current = true;
    const el = containerRef.current?.querySelector<HTMLElement>(`[data-index="${idx}"]`);
    el?.scrollIntoView({ block: "start" });
  }, [deepLinkId, reels]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (commentsFor) return;
      if (e.key === "ArrowDown") goTo(1);
      if (e.key === "ArrowUp") goTo(-1);
      if (e.key === "m" || e.key === "M") setMuted((m) => !m);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, commentsFor]);

  const loadMore = useCallback(() => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    setPage((p) => p + 1);
  }, [loadingMore, page, totalPages]);

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = containerRef.current;
    if (!sentinel || !container) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMore();
      },
      { root: container, threshold: 0.1 }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [loadMore, reels.length, totalPages]);

  const toggleLike = useCallback(async (reel: Reel) => {
    if (!session) {
      showToast("Log in to like reels");
      return;
    }
    const now = Date.now();
    if (now - (lastTapRef.current[reel.id] || 0) < RATE_LIMIT_MS) return;
    lastTapRef.current[reel.id] = now;

    const prevLiked = reel.likedByMe;
    setReels((rs) =>
      rs.map((r) =>
        r.id === reel.id
          ? {
              ...r,
              likedByMe: !prevLiked,
              likesCount: Math.max(0, r.likesCount + (prevLiked ? -1 : 1)),
            }
          : r
      )
    );

    try {
      const res = await fetch(`/api/reels/${reel.id}/like`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setReels((rs) =>
        rs.map((r) => (r.id === reel.id ? { ...r, likedByMe: d.liked, likesCount: d.likesCount } : r))
      );
    } catch (e) {
      logError(e);
      setReels((rs) =>
        rs.map((r) =>
          r.id === reel.id
            ? { ...r, likedByMe: prevLiked, likesCount: reel.likesCount }
            : r
        )
      );
    }
  }, [session, showToast]);

  const openComments = async (reel: Reel) => {
    setCommentsFor(reel);
    setComments([]);
    try {
      const res = await fetch(`/api/reels/${reel.id}/comments`);
      const d = await res.json();
      setComments(d.comments || []);
    } catch (e) {
      logError(e);
    }
  };

  const postComment = async () => {
    if (!commentsFor) return;
    if (!session) {
      showToast("Log in to comment on reels");
      return;
    }
    const content = commentText.trim();
    if (!content) return;
    try {
      const res = await fetch(`/api/reels/${commentsFor.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setComments((c) => [d.comment, ...c]);
      setCommentText("");
      setReels((rs) =>
        rs.map((r) =>
          r.id === commentsFor.id ? { ...r, commentsCount: r.commentsCount + 1 } : r
        )
      );
    } catch (e) {
      logError(e);
      showToast("Comment post nahi hua");
    }
  };

  const shareReel = async (reel: Reel) => {
    const url = `${window.location.origin}/reels/${reel.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "ZyniVerse Reel", url });
        return;
      } catch {
        /* cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied!");
    } catch {
      showToast(url);
    }
  };

  const submitReport = async (reason: string) => {
    if (!reporting) return;
    if (!session) {
      showToast("Log in to report reels");
      setReporting(null);
      return;
    }
    setReportSubmitting(true);
    try {
      const res = await fetch(`/api/reels/${reporting.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Report failed");
      showToast("Report submitted. Thank you!");
      setReporting(null);
    } catch (e) {
      logError(e);
      showToast(e instanceof Error ? e.message : "Report failed");
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="relative mx-auto max-w-3xl px-2 py-4 sm:px-4">
        <div className="mb-4 flex items-center justify-between px-1">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Reels</p>
            <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block mt-1">
              <h1 className="font-display text-xl font-bold leading-none">Reels</h1>
            </div>
          </div>
          <Link
            href="/reels/upload"
            className="rounded-full neon-rgb-border bg-gradient-to-r from-pink-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-600/20 transition hover:brightness-110"
          >
            + Upload Reel
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {loading && reels.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-[var(--color-muted)]">
              Loading reels...
            </div>
          ) : reels.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
              <p className="text-[var(--color-muted)]">No reels yet. Be the first to post one!</p>
              <Link
                href="/reels/upload"
                className="rounded-full neon-rgb-border bg-gradient-to-r from-pink-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Upload your first reel
              </Link>
            </div>
          ) : (
            <div
              ref={containerRef}
              className="relative h-[calc(100dvh-10.5rem)] overflow-y-auto snap-y snap-mandatory scrollbar-thin"
            >
              {reels.map((reel, idx) => (
                <div
                  key={reel.id}
                  data-index={idx}
                  className="mb-3 h-full snap-start snap-always"
                >
                  <ReelCard
                    reel={reel}
                    active={idx === activeIndex}
                    muted={muted}
                    onMutedToggle={() => setMuted((m) => !m)}
                    videoRef={(el) => {
                      videoRefs.current[reel.id] = el;
                    }}
                    onToggleLike={() => toggleLike(reel)}
                    onOpenComments={() => openComments(reel)}
                    onShare={() => shareReel(reel)}
                    onReport={() => setReporting(reel)}
                  />
                </div>
              ))}
              <div ref={sentinelRef} className="h-2" />
              {loadingMore && (
                <div className="py-4 text-center text-sm text-[var(--color-muted)]">
                  Loading more...
                </div>
              )}
              {!loadingMore && page >= totalPages && reels.length > 0 && (
                <div className="py-4 text-center text-xs text-[var(--color-muted)]">
                  — End of reels —
                </div>
              )}
            </div>
          )}
        </div>

        {reels.length > 0 && (
          <div className="mt-3 flex items-center justify-between px-1 text-xs text-[var(--color-muted)]">
            <span>↑ / ↓ or scroll to navigate</span>
            <span>M = mute/unmute</span>
          </div>
        )}
      </div>

      {commentsFor && (
        <CommentPanel
          comments={comments}
          value={commentText}
          onChange={setCommentText}
          onClose={() => setCommentsFor(null)}
          onPost={postComment}
        />
      )}

      {reporting && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setReporting(null)}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl neon-rgb-border bg-[var(--color-panel)]/95 backdrop-blur-xl p-5 animate-page-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-magenta)]">Safety</p>
                <h3 className="font-display text-lg font-bold mt-1">Report this reel</h3>
                <p className="mt-1 text-xs text-[var(--color-mute)]">
                  Your report stays anonymous. We review every report.
                </p>
              </div>
              <button
                onClick={() => setReporting(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full neon-rgb-border text-[var(--color-mute)] transition hover:text-white"
                aria-label="Close report dialog"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r.key}
                  onClick={() => submitReport(r.key)}
                  disabled={reportSubmitting}
                  className="group rounded-xl neon-rgb-border bg-[var(--color-void)] px-4 py-3 text-left transition hover:border-[var(--color-magenta)] disabled:pointer-events-none disabled:opacity-50"
                >
                  <span className="block text-sm font-semibold capitalize group-hover:text-[var(--color-magenta)]">
                    {r.label}
                  </span>
                  <span className="block text-xs text-[var(--color-mute)]">{r.desc}</span>
                </button>
              ))}
            </div>
            {reportSubmitting && (
              <p className="mt-3 text-center text-xs text-[var(--color-mute)]">Submitting report...</p>
            )}
            <button
              onClick={() => setReporting(null)}
              className="mt-3 w-full rounded-full neon-rgb-border px-3 py-2 text-sm text-[var(--color-mute)] transition hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-full neon-rgb-border bg-black/90 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </PageTransition>
  );
}

function ReelCard({
  reel,
  active,
  muted,
  onMutedToggle,
  videoRef,
  onToggleLike,
  onOpenComments,
  onShare,
  onReport,
}: {
  reel: Reel;
  active: boolean;
  muted: boolean;
  onMutedToggle: () => void;
  videoRef: (el: HTMLVideoElement | null) => void;
  onToggleLike: () => void;
  onOpenComments: () => void;
  onShare: () => void;
  onReport: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative mx-auto h-full max-w-sm overflow-hidden rounded-2xl neon-rgb-border bg-black shadow-xl shadow-pink-500/10">
      <video
        ref={videoRef}
        src={reel.videoUrl}
        poster={reel.thumbnailUrl || undefined}
        playsInline
        loop
        muted={muted}
        preload="metadata"
        className="h-full w-full object-contain"
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (v.duration) setProgress((v.currentTime / v.duration) * 100);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent" />

      <div className="absolute inset-x-3 top-2">
        <div className="h-1 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <button
        onClick={onMutedToggle}
        className="absolute right-3 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70 active:scale-90"
        aria-label={muted ? "Unmute" : "Mute"}
        title={muted ? "Unmute" : "Mute"}
      >
        {muted ? <VolumeMuteIcon /> : <VolumeIcon />}
      </button>

      <div className="absolute bottom-24 right-2 z-10 flex flex-col items-center gap-5 sm:right-3">
        <ActionButton label={formatCount(reel.likesCount)} onClick={onToggleLike} ariaLabel="Like this reel">
          <span className={reel.likedByMe ? "text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" : "text-white"}>
            <HeartIcon filled={reel.likedByMe} />
          </span>
        </ActionButton>
        <ActionButton label={formatCount(reel.commentsCount)} onClick={onOpenComments} ariaLabel="View comments">
          <CommentIcon />
        </ActionButton>
        <ActionButton label="Share" onClick={onShare} ariaLabel="Share reel">
          <ShareIcon />
        </ActionButton>
        <ActionButton label="Report" onClick={onReport} ariaLabel="Report reel" dim>
          <FlagIcon />
        </ActionButton>
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-16">
        <Link href={`/profile/${reel.user.id}`} className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-pink-500/80">
            {reel.user.avatar ? (
              <Image src={reel.user.avatar} alt={reel.user.username} width={36} height={36} className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-pink-600 text-sm font-bold text-white">
                {reel.user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span className="text-sm font-semibold text-white drop-shadow">@{reel.user.username}</span>
        </Link>
        {reel.caption && <p className="mt-2 line-clamp-3 text-sm text-white/90">{reel.caption}</p>}
        <p className="mt-1 text-xs text-white/50">{formatCount(reel.views)} views · {timeAgo(reel.createdAt)}</p>
      </div>

      {!playing && active && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.14v14l11-7z" />
            </svg>
          </span>
        </div>
      )}
    </div>
  );
}

function CommentPanel({
  comments,
  value,
  onChange,
  onClose,
  onPost,
}: {
  comments: ReelComment[];
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
  onPost: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="absolute inset-x-0 bottom-0 flex h-[85dvh] w-full flex-col overflow-hidden rounded-t-3xl sm:inset-auto sm:bottom-4 sm:right-4 sm:h-[calc(100dvh-2rem)] sm:w-[400px] sm:rounded-3xl neon-rgb-border bg-[var(--color-panel)]/95 backdrop-blur-xl animate-page-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-4 py-3">
          <h3 className="font-display text-base font-bold">Comments ({comments.length})</h3>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full neon-rgb-border text-[var(--color-mute)] transition hover:text-white"
            aria-label="Close comments"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {comments.length === 0 ? (
            <p className="text-center text-sm text-[var(--color-mute)]">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="flex flex-col gap-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-magenta)]">
                    {c.user.avatar ? (
                      <Image src={c.user.avatar} alt={c.user.username} width={32} height={32} className="object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-black">{c.user.username.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 rounded-xl neon-rgb-border bg-[var(--color-void)] px-3 py-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-[var(--color-ink)]">@{c.user.username}</span>
                      <span className="text-xs text-[var(--color-mute)]">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-[var(--color-fg)]/90">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 border-t border-[var(--color-line)] p-3">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onPost();
            }}
            placeholder="Write a comment..."
            className="flex-1 rounded-xl neon-rgb-border bg-[var(--color-void)] px-4 py-2 text-sm placeholder:text-[var(--color-mute)]/50"
          />
          <button
            onClick={onPost}
            className="rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
