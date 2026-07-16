"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Loader, { ErrorState } from "@/components/Loader";
import CosplayUpload from "@/components/CosplayUpload";

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

export default function CosplayDetailPage({ id, initialData }: { id: string; initialData?: CosplayDetail }) {
  const { data: session } = useSession();
  const [cosplay, setCosplay] = useState<CosplayDetail | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialData?.likes || 0);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  async function handleLike() {
    if (!session?.user?.id) return;
    const res = await fetch(`/api/cosplay/${id}/like`, { method: "POST" });
    const data = await res.json();
    setLiked(data.liked);
    setLikeCount(data.likes);
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this cosplay?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/cosplay/${id}`, { method: "DELETE" });
      if (res.ok) {
        window.location.href = "/cosplay";
      }
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <Loader label="Loading cosplay..." />;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState message={error} /></div>;
  if (!cosplay) return null;

  const isOwner = session?.user?.id === cosplay.user.id;
  const tags = cosplay.tags ? cosplay.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 animate-page-in">
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="neon-premium rounded-xl overflow-hidden">
            <div className="neon-premium-track rounded-xl" />
            <div className="neon-premium-overlay rounded-[10.5px]" />
            <div className="neon-premium-content">
              <div className="relative overflow-hidden">
                <Image
                  src={cosplay.imageUrl}
                  alt={cosplay.title}
                  width={600}
                  height={800}
                  className="w-full h-auto object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 md:opacity-100" />
              </div>
            </div>
          </div>

          {/* Mobile: action buttons below image */}
          <div className="flex flex-wrap items-center gap-3 mt-4 md:hidden">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold border transition-all duration-300 ${
                liked
                  ? "bg-red-500/20 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                  : "bg-[var(--color-panel)] border-[var(--color-line)] text-[var(--color-mute)] hover:text-red-400 hover:border-red-500/30"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {likeCount} {likeCount === 1 ? "Like" : "Likes"}
            </button>

            {isOwner && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 rounded-lg border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 px-4 py-2.5 text-sm font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </>
            )}
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
            <h1 className="font-display text-3xl sm:text-4xl font-bold gradient-text">{cosplay.title}</h1>
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

          {/* Character & Anime */}
          <div className="glass-panel p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-magenta)]/15 text-[var(--color-magenta)]">
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
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-violet)]/15 text-[var(--color-violet)]">
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
            <div className="glass-panel p-4">
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-mute)] font-medium mb-2">About</p>
              <p className="text-sm text-[var(--color-mute)] leading-relaxed whitespace-pre-line">{cosplay.description}</p>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="glass-tag">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-50">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons - Desktop */}
          <div className="hidden md:flex flex-wrap items-center gap-3">
            <button
              onClick={handleLike}
              className={`btn-magnetic flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold border transition-all duration-300 ${
                liked
                  ? "bg-red-500/20 border-red-500/30 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                  : "bg-[var(--color-panel)] border-[var(--color-line)] text-[var(--color-mute)] hover:text-red-400 hover:border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {likeCount} {likeCount === 1 ? "Like" : "Likes"}
            </button>

            {isOwner && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="btn-magnetic flex items-center gap-2 rounded-xl border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 px-5 py-3 text-sm font-bold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn-magnetic flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
