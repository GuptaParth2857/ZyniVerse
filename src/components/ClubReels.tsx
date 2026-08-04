"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface ReelUser {
  id: string;
  username: string;
  avatar?: string | null;
}

interface Reel {
  id: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  createdAt: string;
  _count: { likes: number };
  user: ReelUser;
}

export default function ClubReels({
  reels,
  isMember,
  onUpload,
  onToggleLike,
}: {
  reels: Reel[];
  isMember: boolean;
  onUpload: (media: { videoUrl: string; thumbnailUrl?: string; caption?: string }) => void;
  onToggleLike: (reelId: string) => void;
}) {
  const { data: session } = useSession();
  const videoRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { setError("Max 50MB allowed"); return; }
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/reel", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onUpload({ videoUrl: data.url, thumbnailUrl: data.thumbnailUrl || undefined, caption: caption || undefined });
      setCaption("");
    } catch (err) { setError(err instanceof Error ? err.message : "Upload failed"); }
    setUploading(false);
    e.target.value = "";
  };

  return (
    <div>
      {isMember && (
        <div className="neon-rgb-border mb-6 space-y-3 rounded-2xl bg-[var(--color-panel)] p-4">
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Reel caption..."
            className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none transition-colors focus:border-white/25 focus:ring-2 focus:ring-white/10"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => videoRef.current?.click()}
              disabled={uploading}
              className="rounded-xl bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-violet)] px-5 py-2.5 text-xs font-bold text-black transition-transform hover:scale-105 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "+ Upload Reel"}
            </button>
            <span className="text-[10px] text-[var(--color-mute)]">MP4/WebM/MOV · max 50MB</span>
            <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleFile} />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}

      {!isMember && (
        <p className="mb-6 rounded-xl border border-dashed border-[var(--color-line)] px-4 py-3 text-xs text-[var(--color-mute)]">
          Join the club to upload your own reels.
        </p>
      )}

      {reels.length === 0 ? (
        <p className="py-10 text-center text-sm text-[var(--color-mute)]">No reels yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {reels.map((reel) => (
            <div key={reel.id} className="neon-rgb-border overflow-hidden rounded-2xl bg-[var(--color-panel)]">
              <video
                src={reel.videoUrl}
                poster={reel.thumbnailUrl || undefined}
                controls
                playsInline
                preload="metadata"
                className="aspect-[3/4] w-full bg-black object-cover"
              />
              <div className="p-3">
                <Link href={`/profile/${reel.user.id}`} className="block truncate text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-cyan)]">
                  {reel.user.username}
                </Link>
                {reel.caption && <p className="mt-0.5 line-clamp-2 text-[11px] text-[var(--color-mute)]">{reel.caption}</p>}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-[var(--color-mute)]">{new Date(reel.createdAt).toLocaleDateString()}</span>
                  {session?.user && isMember && (
                    <button
                      onClick={() => onToggleLike(reel.id)}
                      className="flex items-center gap-1 text-[11px] text-[var(--color-mute)] transition-colors hover:text-[var(--color-magenta)]"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                      {reel._count.likes}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
