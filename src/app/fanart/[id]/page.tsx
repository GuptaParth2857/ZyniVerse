"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

interface FanArt {
  id: string;
  title: string;
  description: string | null;
  animeTitle: string | null;
  character: string | null;
  imageUrl: string;
  artType: string;
  tags: string;
  likes: number;
  createdAt: string;
  user: { id: string; username: string; avatar: string | null };
}

const ART_TYPES: Record<string, string> = {
  digital: "🎨 Digital Art",
  traditional: "🖌️ Traditional",
  sketch: "✏️ Sketch",
  manga: "📖 Manga Style",
  pixel: "👾 Pixel Art",
};

export default function FanArtDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [fanArt, setFanArt] = useState<FanArt | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/fanart/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        setFanArt(d.fanArt);
        setLikes(d.fanArt?.likes || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleLike = async () => {
    if (!session?.user?.id || !fanArt) return;
    try {
      const res = await fetch(`/api/fanart/${fanArt.id}/like`, { method: "POST" });
      const data = await res.json();
      setLiked(data.liked);
      setLikes(data.likes);
    } catch {}
  };

  const handleDelete = async () => {
    if (!fanArt || !confirm("Are you sure you want to delete this?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/fanart/${fanArt.id}`, { method: "DELETE" });
      window.location.href = "/fanart";
    } catch {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="h-8 w-48 rounded bg-white/5 animate-pulse" />
          <div className="mt-8 aspect-video rounded-xl bg-white/5 animate-pulse" />
        </div>
      </PageTransition>
    );
  }

  if (!fanArt) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="text-[var(--color-mute)]">Fan art not found</p>
          <Link href="/fanart" className="mt-4 inline-block text-sm text-[var(--color-cyan)] hover:underline">
            Back to Gallery
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Back Link */}
        <Link href="/fanart" className="text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)]">
          ← Back to Gallery
        </Link>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6 relative rounded-2xl overflow-hidden border border-white/[0.06]"
        >
          <div className="relative aspect-video bg-[#0a0a14]">
            <Image
              src={fanArt.imageUrl}
              alt={fanArt.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 75vw"
              priority
            />
          </div>
        </motion.div>

        {/* Info */}
        <div className="mt-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold">{fanArt.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[var(--color-mute)]">
                <span>{ART_TYPES[fanArt.artType] || fanArt.artType}</span>
                {fanArt.animeTitle && <span>• {fanArt.animeTitle}</span>}
                {fanArt.character && <span>• {fanArt.character}</span>}
              </div>
            </div>

            {/* Like + Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  liked
                    ? "bg-[var(--color-magenta)]/20 text-[var(--color-magenta)]"
                    : "bg-white/5 text-[var(--color-mute)] hover:bg-white/10"
                }`}
              >
                <svg className="w-4 h-4" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {likes}
              </button>

              {session?.user?.id === fanArt.user.id && (
                <div className="flex gap-2">
                  <Link
                    href={`/fanart/upload?edit=${fanArt.id}`}
                    className="rounded-lg bg-white/5 px-3 py-2 text-xs text-[var(--color-mute)] hover:bg-white/10 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    {deleting ? "..." : "Delete"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {fanArt.description && (
            <p className="mt-4 text-sm text-[var(--color-mute)] leading-relaxed">
              {fanArt.description}
            </p>
          )}

          {/* Tags */}
          {fanArt.tags && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {fanArt.tags.split(",").filter(Boolean).map((tag) => (
                <span key={tag} className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] text-[var(--color-mute)]">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Artist */}
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-[var(--color-panel)] p-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-cyan)] flex items-center justify-center text-sm font-bold text-black">
              {fanArt.user.username[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{fanArt.user.username}</p>
              <p className="text-[10px] text-[var(--color-mute)]">
                Uploaded {new Date(fanArt.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
