"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
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

export default function CosplayDetailPage({ id }: { id: string }) {
  const { data: session } = useSession();
  const [cosplay, setCosplay] = useState<CosplayDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
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
    fetchCosplay();
  }, [fetchCosplay]);

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
            className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 text-sm text-[var(--color-mute)] hover:text-[var(--color-text)] transition-colors"
          >
            ← Back
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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-xl overflow-hidden border border-[var(--color-line)] bg-[var(--color-panel)]">
          <Image
            src={cosplay.imageUrl}
            alt={cosplay.title}
            width={600}
            height={800}
            className="w-full h-auto object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="font-display text-3xl font-bold">{cosplay.title}</h1>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-[var(--color-void)] border border-[var(--color-line)]">
                  {cosplay.user.avatar ? (
                    <Image src={cosplay.user.avatar} alt="" fill className="object-cover" sizes="32px" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs font-bold text-[var(--color-mute)]">
                      {cosplay.user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <Link href={`/profile?id=${cosplay.user.id}`} className="text-sm font-medium hover:text-[var(--color-cyan)]">
                  {cosplay.user.username}
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm"><span className="font-semibold">Character:</span> {cosplay.character}</p>
            <p className="text-sm">
              <span className="font-semibold">Anime:</span>{" "}
              {cosplay.animeId ? (
                <Link href={`/anime/${cosplay.animeId}`} className="text-[var(--color-cyan)] hover:underline">
                  {cosplay.animeTitle}
                </Link>
              ) : (
                cosplay.animeTitle
              )}
            </p>
            {cosplay.description && (
              <p className="text-sm text-[var(--color-mute)] leading-relaxed whitespace-pre-line">{cosplay.description}</p>
            )}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1 text-[10px] font-medium text-[var(--color-mute)]">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold border transition-colors ${
                liked
                  ? "bg-red-500/20 border-red-500/30 text-red-400"
                  : "bg-[var(--color-panel)] border-[var(--color-line)] text-[var(--color-mute)] hover:text-red-400"
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
                  className="flex items-center gap-2 rounded-lg border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 px-4 py-2 text-sm font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-colors"
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
                  className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
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
        </div>
      </div>
    </div>
  );
}
