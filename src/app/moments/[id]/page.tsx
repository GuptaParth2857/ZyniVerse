"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PageTransition } from "@/components/PageTransition";
import MomentCard from "@/components/MomentCard";
import { logError } from "@/lib/logger";

interface MomentDetail {
  id: string;
  quote: string;
  character: string;
  animeTitle: string;
  animeCover: string | null;
  animeId: number;
  episode: string | null;
  timestamp: string | null;
  style: string;
  likesCount: number;
  viewsCount: number;
  createdAt: string;
  user: { id: string; username: string; avatar: string | null } | null;
}

export default function MomentDetailPage() {
  const params = useParams();
  const [moment, setMoment] = useState<MomentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/moments/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        setMoment(d);
        setLikesCount(d.likesCount || 0);
        setLoading(false);
      })
      .catch((e) => { logError(e); setLoading(false); });
  }, [params.id]);

  const handleLike = async () => {
    if (!moment) return;
    try {
      const res = await fetch(`/api/moments/${moment.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "current-user" }),
      });
      const data = await res.json();
      setLiked(data.liked);
      setLikesCount((c) => data.liked ? c + 1 : c - 1);
    } catch (e) { logError(e); }
  };

  const handleShare = (platform: string) => {
    if (!moment) return;
    const text = `"${moment.quote}" — ${moment.character} (${moment.animeTitle})`;
    const url = `https://zyverse.in/moments/${moment.id}`;
    if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank", "width=600,height=400");
    } else if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
    } else if (platform === "copy") {
      navigator.clipboard.writeText(`${text}\n${url}`);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div className="aspect-[3/4] max-w-md mx-auto rounded-2xl bg-white/5 animate-pulse" />
        </div>
      </PageTransition>
    );
  }

  if (!moment) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <p className="text-[var(--color-mute)] text-lg">Moment not found.</p>
          <Link href="/moments" className="text-[var(--color-cyan)] hover:underline text-sm mt-4 inline-block">← Back to Moments</Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link href="/moments" className="text-sm text-[var(--color-mute)] hover:text-white transition-colors mb-6 inline-block">← Back to Moments</Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Card */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-[500px]">
              <MomentCard
                quote={moment.quote}
                character={moment.character}
                animeTitle={moment.animeTitle}
                animeCover={moment.animeCover}
                episode={moment.episode}
                timestamp={moment.timestamp}
                animeId={moment.animeId}
                style={moment.style}
              />
            </div>
          </div>

          {/* Info sidebar */}
          <div className="lg:w-80 space-y-6">
            <div className="neon-rgb-border rounded-xl p-5 bg-[var(--color-panel)]">
              <h2 className="font-display text-lg font-bold text-white mb-3">Moment Details</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-[var(--color-mute)]">Anime</span>
                  <Link href={`/anime/${moment.animeId}`} className="block text-[var(--color-cyan)] hover:underline font-medium">{moment.animeTitle}</Link>
                </div>
                <div>
                  <span className="text-[var(--color-mute)]">Character</span>
                  <p className="text-white font-medium">{moment.character}</p>
                </div>
                {moment.episode && (
                  <div>
                    <span className="text-[var(--color-mute)]">Episode</span>
                    <p className="text-white font-medium">{moment.episode}</p>
                  </div>
                )}
                <div>
                  <span className="text-[var(--color-mute)]">Created by</span>
                  <div className="flex items-center gap-2 mt-1">
                    {moment.user?.avatar ? (
                      <div className="relative h-6 w-6 rounded-full overflow-hidden">
                        <Image src={moment.user.avatar} alt="" fill className="object-cover" sizes="24px" />
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/60">
                        {moment.user?.username?.[0]?.toUpperCase() || "A"}
                      </div>
                    )}
                    <span className="text-white font-medium">{moment.user?.username || "Anonymous"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="neon-rgb-border rounded-xl p-5 bg-[var(--color-panel)]">
              <h3 className="font-display text-sm font-bold text-white mb-3">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleLike}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    liked
                      ? "bg-[var(--color-magenta)]/20 text-[var(--color-magenta)] border border-[var(--color-magenta)]/30"
                      : "bg-white/5 text-white hover:bg-white/10 border border-[var(--color-line)]"
                  }`}
                >
                  {liked ? "♥ Liked" : "♡ Like"} <span className="text-[var(--color-mute)]">({likesCount})</span>
                </button>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => handleShare("twitter")} className="rounded-xl bg-white/5 px-3 py-2.5 text-xs font-semibold text-white hover:bg-white/10 border border-[var(--color-line)] transition-all">
                    Twitter/X
                  </button>
                  <button onClick={() => handleShare("whatsapp")} className="rounded-xl bg-white/5 px-3 py-2.5 text-xs font-semibold text-white hover:bg-white/10 border border-[var(--color-line)] transition-all">
                    WhatsApp
                  </button>
                  <button onClick={() => handleShare("copy")} className="rounded-xl bg-white/5 px-3 py-2.5 text-xs font-semibold text-white hover:bg-white/10 border border-[var(--color-line)] transition-all">
                    Copy Link
                  </button>
                </div>
              </div>
            </div>

            <div className="text-xs text-[var(--color-mute)] text-center">
              {likesCount} likes · {moment.viewsCount} views
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
