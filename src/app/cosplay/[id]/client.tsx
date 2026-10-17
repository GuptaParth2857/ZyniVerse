"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useTransform,
  useScroll,
} from "framer-motion";
import Loader, { ErrorState } from "@/components/Loader";
import CosplayUpload from "@/components/CosplayUpload";
import CosplayCard from "@/components/CosplayCard";
import { imgThumb } from "@/lib/img";

interface CosplayDetail {
  id: string;
  title: string;
  description: string | null;
  character: string;
  animeTitle: string;
  animeId: number | null;
  imageUrl: string;
  tags: string;
  likes: number;
  createdAt: string;
  user: { id: string; username: string; avatar: string | null };
}

interface RelatedItem {
  id: string;
  title: string;
  character: string;
  animeTitle: string;
  imageUrl: string;
  likes: number;
  createdAt: string;
  tags: string;
  user: { id: string; username: string; avatar: string | null };
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

/** Smoothly rolls the number to a new value instead of snapping. */
function AnimatedCount({ value, className }: { value: number; className?: string }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString());
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.5, ease: "easeOut" });
    return () => controls.stop();
  }, [value, mv]);
  return <motion.span className={className}>{text}</motion.span>;
}

export default function CosplayDetailPage({ id, initialData }: { id: string; initialData?: CosplayDetail }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [cosplay, setCosplay] = useState<CosplayDetail | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialData?.likes || 0);
  const [likeBusy, setLikeBusy] = useState(false);
  const [likeNudge, setLikeNudge] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [related, setRelated] = useState<RelatedItem[]>([]);
  const [moreByUser, setMoreByUser] = useState<RelatedItem[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [burstKey, setBurstKey] = useState(0);

  const likedFetchedRef = useRef<Set<string>>(new Set());
  const heroRef = useRef<HTMLDivElement>(null);

  // Subtle parallax drift on the hero image as the page scrolls.
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroProgress, [0, 1], ["-3%", "3%"]);

  const fetchCosplay = useCallback(() => {
    fetch(`/api/cosplay/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setCosplay(d.cosplay);
        setLikeCount(d.cosplay.likes);
      })
      .catch(() => setError("Failed to load cosplay"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!initialData) {
      fetchCosplay();
    }
  }, [fetchCosplay, initialData]);

  // Seed this viewer's like state. The detail read is cached and shared between
  // visitors, so the per-user flag comes from its own no-store endpoint.
  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid) {
      // Reset when signed out; the guard above makes this a no-op for guests.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLiked(false);
      return;
    }
    let alive = true;
    fetch(`/api/cosplay/${id}/like`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d) setLiked(!!d.liked);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [id, session?.user?.id]);

  // Escape closes the lightbox / delete dialog.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setLightbox(false);
        setShowDelete(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll while the lightbox is open.
  useEffect(() => {
    if (!lightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  // Mouse-follow ambient glow is provided globally by <CursorGlow /> in the
  // root layout, so this page only adds static depth behind the content.

  // Related cosplays: same anime and more by the same author.
  useEffect(() => {
    if (!cosplay) return;
    let alive = true;
    const animeKey = encodeURIComponent(cosplay.animeTitle);
    fetch(`/api/cosplay?anime=${animeKey}&perPage=8`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d) return;
        setRelated((d.cosplays || []).filter((c: RelatedItem) => c.id !== cosplay.id).slice(0, 4));
      })
      .catch(() => {});
    fetch(`/api/cosplay?user=${cosplay.user.id}&perPage=8`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d) return;
        setMoreByUser((d.cosplays || []).filter((c: RelatedItem) => c.id !== cosplay.id).slice(0, 4));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [cosplay]);

  // Seed like state for the related cards once they load.
  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid) {
      likedFetchedRef.current = new Set();
      return;
    }
    const ids = [...related, ...moreByUser]
      .map((c) => c.id)
      .filter((cid) => !likedFetchedRef.current.has(cid));
    if (ids.length === 0) return;
    let cancelled = false;
    fetch(`/api/cosplay/likes?ids=${ids.join(",")}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d) return;
        ids.forEach((cid) => likedFetchedRef.current.add(cid));
        const next = new Set<string>(d.likedIds || []);
        if (next.size === 0) return;
        setLikedIds((prev) => {
          const merged = new Set(prev);
          next.forEach((cid) => merged.add(cid));
          return merged;
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, related, moreByUser]);

  function nudgeLike() {
    setLikeNudge(true);
    setTimeout(() => setLikeNudge(false), 3200);
  }

  async function handleLike() {
    if (!session?.user?.id) {
      nudgeLike();
      return;
    }
    if (likeBusy) return;
    setLikeBusy(true);
    try {
      const res = await fetch(`/api/cosplay/${id}/like`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.likes);
      if (data.liked) setBurstKey((k) => k + 1);
    } catch {
      // Transient failure — leave the current values untouched.
    } finally {
      setLikeBusy(false);
    }
  }

  async function handleCardLike(cardId: string) {
    if (!session?.user?.id) {
      nudgeLike();
      return;
    }
    try {
      const res = await fetch(`/api/cosplay/${cardId}/like`, { method: "POST" });
      if (!res.ok) return;
      const data = await res.json();
      const patch = (arr: RelatedItem[]) =>
        arr.map((c) => (c.id === cardId ? { ...c, likes: data.likes } : c));
      setRelated(patch);
      setMoreByUser(patch);
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (data.liked) next.add(cardId);
        else next.delete(cardId);
        return next;
      });
    } catch {
      // Transient like failure — leave the current state untouched.
    }
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: cosplay?.title,
      text: cosplay ? `${cosplay.character} from ${cosplay.animeTitle}` : undefined,
      url,
    };
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2200);
    } catch {
      // User dismissed the share sheet, or the clipboard was blocked.
    }
  }

  async function confirmDelete() {
    setShowDelete(false);
    setDeleting(true);
    try {
      const res = await fetch(`/api/cosplay/${id}`, { method: "DELETE" });
      if (res.ok) router.push("/cosplay");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <Loader label="Loading cosplay..." />;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState message={error} /></div>;
  if (!cosplay) return null;

  const isOwner = session?.user?.id === cosplay.user.id;
  const tags = cosplay.tags ? cosplay.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const statItem = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

  if (editing) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => setEditing(false)}
            className="glass-input flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
          <h2 className="font-display text-xl font-bold">Editing: {cosplay.title}</h2>
        </div>
        <CosplayUpload
          initialData={{ ...cosplay, description: cosplay.description || "", tags: cosplay.tags || "" }}
          onUpdate={() => { setEditing(false); setLoading(true); fetchCosplay(); }}
        />
      </div>
    );
  }

  function likeButton(compact: boolean) {
    return (
      <button
        onClick={handleLike}
        disabled={likeBusy}
        aria-pressed={liked}
        aria-label={liked ? "Unlike this cosplay" : "Like this cosplay"}
        className={`neon-rgb-border flex items-center border font-semibold transition-all duration-300 disabled:opacity-70 ${
          compact ? "gap-2 rounded-lg px-4 py-2.5 text-sm" : "btn-magnetic gap-2 rounded-xl px-5 py-3 text-sm font-bold"
        } ${
          liked
            ? "bg-red-500/20 border-red-500/30 text-red-400 shadow-[0_0_18px_rgba(239,68,68,0.25)]"
            : "bg-[var(--color-panel)] border-[var(--color-line)] text-[var(--color-mute)] hover:text-red-400 hover:border-red-500/30 hover:shadow-[0_0_18px_rgba(239,68,68,0.12)]"
        }`}
      >
        <svg
          width={compact ? 16 : 18}
          height={compact ? 16 : 18}
          viewBox="0 0 24 24"
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform duration-300 ${liked ? "scale-110" : "scale-100"}`}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <AnimatedCount value={likeCount} className="tabular-nums" />
        <span>{likeCount === 1 ? "Like" : "Likes"}</span>
      </button>
    );
  }

  function shareButton(compact: boolean) {
    return (
      <button
        onClick={handleShare}
        aria-label="Share this cosplay"
        className={`neon-rgb-border flex items-center gap-2 border border-[var(--color-violet)]/30 bg-[var(--color-violet)]/10 font-semibold text-[var(--color-violet)] transition-colors hover:bg-[var(--color-violet)]/20 ${
          compact ? "rounded-lg px-4 py-2.5 text-sm" : "btn-magnetic rounded-xl px-5 py-3 text-sm font-bold"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share
      </button>
    );
  }

  const ownerButtons = (compact: boolean) => (
    <>
      <button
        onClick={() => setEditing(true)}
        className={`flex items-center gap-2 border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 font-semibold text-[var(--color-cyan)] transition-colors hover:bg-[var(--color-cyan)]/20 ${
          compact ? "rounded-lg px-4 py-2.5 text-sm" : "btn-magnetic rounded-xl px-5 py-3 text-sm font-bold"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Edit
      </button>
      <button
        onClick={() => setShowDelete(true)}
        disabled={deleting}
        className={`flex items-center gap-2 border border-red-500/30 bg-red-500/10 font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50 ${
          compact ? "rounded-lg px-4 py-2.5 text-sm" : "btn-magnetic rounded-xl px-5 py-3 text-sm font-bold"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        {deleting ? "Deleting..." : "Delete"}
      </button>
    </>
  );

  return (
    <>
      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 animate-page-in">
        {/* Ambient aurora accent (mouse-follow glow is global via CursorGlow) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-20 -top-24 h-[360px] w-[360px] rounded-full bg-[var(--color-cyan)]/[0.08] blur-[110px]" />
          <div className="absolute -right-24 top-1/3 h-[300px] w-[300px] rounded-full bg-[var(--color-violet)]/[0.07] blur-[100px]" />
          <div className="absolute bottom-0 left-1/3 h-[260px] w-[260px] rounded-full bg-[var(--color-magenta)]/[0.06] blur-[90px]" />
        </div>

        <div className="relative z-10">
        {/* Back nav */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Link href="/cosplay" className="inline-flex items-center gap-2 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Gallery
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Section */}
          <motion.div
            ref={heroRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="neon-rgb-border group relative overflow-hidden rounded-xl bg-[var(--color-panel)]/60 backdrop-blur-sm transition-shadow duration-500 hover:shadow-[0_0_45px_rgba(0,255,224,0.14)]">
              <button
                type="button"
                onClick={() => setLightbox(true)}
                aria-label="Open full-size image"
                className="relative block w-full cursor-zoom-in overflow-hidden"
              >
                <motion.div style={{ y: heroY }} className="will-change-transform">
                  <Image
                    src={imgThumb(cosplay.imageUrl, 1100)}
                    alt={cosplay.title}
                    width={600}
                    height={800}
                    priority
                    className="w-full h-auto scale-[1.06] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.1]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </motion.div>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 md:opacity-100" />
                <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1 text-[10px] font-semibold text-white/85 opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
                  Click to expand
                </span>
              </button>

              {/* Heart burst on like */}
              {burstKey > 0 && (
                <div
                  key={burstKey}
                  className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
                >
                  <svg
                    className="animate-heart-burst"
                    width="128"
                    height="128"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ color: "rgba(244,63,94,0.9)", filter: "drop-shadow(0 0 18px rgba(244,63,94,0.65))" }}
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Mobile: action buttons below image */}
            <div className="flex flex-wrap items-center gap-3 mt-4 md:hidden">
              {likeButton(true)}
              {shareButton(true)}
              {isOwner && ownerButtons(true)}
            </div>
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {/* Title & User */}
            <div>
              <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
                <h1 className="font-display text-3xl sm:text-4xl font-bold gradient-text gradient-text-cycle">{cosplay.title}</h1>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Link href={`/profile?id=${cosplay.user.id}`} className="flex items-center gap-2.5 group">
                  <div className="relative h-9 w-9 overflow-hidden rounded-full bg-[var(--color-void)] ring-2 ring-[var(--color-line)] group-hover:ring-[var(--color-cyan)]/50 transition-all">
                    {cosplay.user.avatar ? (
                      <Image src={cosplay.user.avatar} alt="" fill className="object-cover" sizes="36px" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-bold text-[var(--color-cyan)]">
                        {cosplay.user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold group-hover:text-[var(--color-cyan)] transition-colors">{cosplay.user.username}</p>
                    <p className="text-[10px] text-[var(--color-mute)]">{timeAgo(cosplay.createdAt)}</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Quick stats */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.18 } } }}
              className="grid grid-cols-3 gap-2.5"
            >
              <motion.div variants={statItem} className="glass-panel flex flex-col items-center gap-1 rounded-xl p-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-red-400">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <AnimatedCount value={likeCount} className="font-mono text-base font-bold tabular-nums text-[var(--color-ink)]" />
                <span className="text-[9px] uppercase tracking-wider text-[var(--color-mute)]">Likes</span>
              </motion.div>
              <motion.div variants={statItem} className="glass-panel flex flex-col items-center gap-1 rounded-xl p-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-cyan)]">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                <AnimatedCount value={tags.length} className="font-mono text-base font-bold tabular-nums text-[var(--color-ink)]" />
                <span className="text-[9px] uppercase tracking-wider text-[var(--color-mute)]">Tags</span>
              </motion.div>
              <motion.div variants={statItem} className="glass-panel flex flex-col items-center gap-1 rounded-xl p-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-violet)]">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="font-mono text-[11px] font-bold text-[var(--color-ink)]">{timeAgo(cosplay.createdAt)}</span>
                <span className="text-[9px] uppercase tracking-wider text-[var(--color-mute)]">Posted</span>
              </motion.div>
            </motion.div>

            {/* Character & Anime */}
            <div className="glass-panel neon-rgb-border p-4 space-y-3">
              <div className="group/row -m-1 flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-white/[0.04]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-magenta)]/15 text-[var(--color-magenta)] transition-transform duration-300 group-hover/row:scale-110">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--color-mute)] font-medium">Character</p>
                  <p className="text-sm font-semibold">{cosplay.character}</p>
                </div>
              </div>
              <div className="glass-divider" />
              <div className="group/row -m-1 flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-white/[0.04]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-violet)]/15 text-[var(--color-violet)] transition-transform duration-300 group-hover/row:scale-110">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--color-mute)] font-medium">Anime</p>
                  {cosplay.animeId ? (
                    <Link href={`/anime/${cosplay.animeId}`} className="text-sm font-semibold text-[var(--color-cyan)] hover:underline">
                      {cosplay.animeTitle}
                    </Link>
                  ) : (
                    <p className="text-sm font-semibold">{cosplay.animeTitle}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {cosplay.description && (
              <div className="glass-panel neon-rgb-border p-4">
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-mute)] font-medium mb-2">About</p>
                <p className="text-sm text-[var(--color-mute)] leading-relaxed whitespace-pre-line">{cosplay.description}</p>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="neon-rgb-border rounded-xl flex flex-wrap gap-2 p-2">
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/cosplay?anime=${encodeURIComponent(cosplay.animeTitle)}`}
                    className="glass-tag transition-all duration-200 hover:text-[var(--color-cyan)] hover:ring-[var(--color-cyan)]/40"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-50">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Action Buttons - Desktop */}
            <div className="hidden md:flex flex-wrap items-center gap-3">
              {likeButton(false)}
              {shareButton(false)}
              {isOwner && ownerButtons(false)}
            </div>
          </motion.div>
        </div>

        {/* Related: same anime */}
        {related.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-14"
          >
            <div className="mb-5 flex items-center gap-3">
              <h2 className="font-display text-xl font-bold">More like this</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-line)] to-transparent" />
              <Link
                href={`/cosplay?anime=${encodeURIComponent(cosplay.animeTitle)}`}
                className="text-xs font-semibold text-[var(--color-cyan)] hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((c, i) => (
                <CosplayCard
                  key={c.id}
                  cosplay={c}
                  onLike={() => handleCardLike(c.id)}
                  liked={likedIds.has(c.id)}
                  index={i}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Related: same author */}
        {moreByUser.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12"
          >
            <div className="mb-5 flex items-center gap-3">
              <h2 className="font-display text-xl font-bold">
                More by @{cosplay.user.username}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-line)] to-transparent" />
              <Link
                href={`/profile?id=${cosplay.user.id}`}
                className="text-xs font-semibold text-[var(--color-cyan)] hover:underline"
              >
                View profile
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {moreByUser.map((c, i) => (
                <CosplayCard
                  key={c.id}
                  cosplay={c}
                  onLike={() => handleCardLike(c.id)}
                  liked={likedIds.has(c.id)}
                  index={i}
                />
              ))}
            </div>
          </motion.section>
        )}
      </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Full-size cosplay image"
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          >
            <button
              onClick={() => setLightbox(false)}
              aria-label="Close image"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.5}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.y) > 120) setLightbox(false);
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative cursor-grab active:cursor-grabbing"
            >
              <Image
                src={imgThumb(cosplay.imageUrl, 1600)}
                alt={cosplay.title}
                width={1200}
                height={1600}
                className="h-auto max-h-[85vh] w-auto rounded-xl object-contain"
                sizes="100vw"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {showDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDelete(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Confirm delete"
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.97, opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel neon-rgb-border w-full max-w-md rounded-2xl p-6"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-500/15 text-red-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold">Delete this cosplay?</h3>
              <p className="mt-1 text-sm text-[var(--color-mute)]">
                This will permanently remove &ldquo;{cosplay.title}&rdquo; from the gallery. This action can&apos;t be undone.
              </p>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => setShowDelete(false)}
                  className="glass-input px-4 py-2 text-sm font-semibold text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="rounded-lg border border-red-500/40 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/30 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 rounded-full border border-emerald-500/30 bg-[var(--color-panel)]/95 px-5 py-2.5 text-sm font-semibold text-emerald-400 shadow-lg backdrop-blur-md"
          >
            Link copied!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guest like nudge */}
      <AnimatePresence>
        {likeNudge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 left-1/2 z-[110] -translate-x-1/2"
          >
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full border border-[var(--color-cyan)]/30 bg-[var(--color-panel)]/95 px-5 py-2.5 text-sm font-semibold text-[var(--color-cyan)] shadow-lg backdrop-blur-md transition-colors hover:bg-[var(--color-cyan)]/10"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Sign in to like cosplays
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
