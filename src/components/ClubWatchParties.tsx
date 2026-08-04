"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface PartyUser {
  id: string;
  username: string;
  avatar?: string | null;
}

interface PartyMember {
  id: string;
  userId: string;
  user: PartyUser;
}

interface Party {
  id: string;
  mediaId: number;
  mediaTitle: string;
  mediaImage: string | null;
  episode: number;
  status: string;
  isPlaying: boolean;
  playbackPos: number;
  host: PartyUser;
  members: PartyMember[];
}

export default function ClubWatchParties({
  parties,
  isMember,
  onCreate,
}: {
  parties: Party[];
  isMember: boolean;
  onCreate: (data: { mediaId: number; mediaTitle: string; mediaImage?: string; coverImage?: string }) => void;
}) {
  const { data: session } = useSession();
  const [showCreate, setShowCreate] = useState(false);
  const [mediaId, setMediaId] = useState("");
  const [mediaTitle, setMediaTitle] = useState("");
  const [mediaImage, setMediaImage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaId.trim() || !mediaTitle.trim()) return;
    onCreate({
      mediaId: parseInt(mediaId, 10),
      mediaTitle: mediaTitle.trim(),
      mediaImage: mediaImage.trim() || undefined,
    });
    setMediaId("");
    setMediaTitle("");
    setMediaImage("");
    setShowCreate(false);
  };

  const isInParty = (party: Party) => session?.user?.id && party.members.some((m) => m.userId === session.user?.id);

  return (
    <div>
      {isMember && !showCreate && (
        <button
          onClick={() => setShowCreate(true)}
          className="mb-6 w-full rounded-2xl border border-dashed border-[var(--color-line)] py-4 text-sm text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
        >
          + Host Watch Party
        </button>
      )}

      {showCreate && (
        <form onSubmit={submit} className="neon-rgb-border mb-6 space-y-3 rounded-2xl bg-[var(--color-panel)] p-4">
          <input value={mediaId} onChange={(e) => setMediaId(e.target.value.replace(/\D/g, ""))} placeholder="Anime ID (AniList ID)..." className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none transition-colors focus:border-white/25 focus:ring-2 focus:ring-white/10" />
          <input value={mediaTitle} onChange={(e) => setMediaTitle(e.target.value)} placeholder="Anime title..." className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none transition-colors focus:border-white/25 focus:ring-2 focus:ring-white/10" />
          <input value={mediaImage} onChange={(e) => setMediaImage(e.target.value)} placeholder="Cover image URL (optional)..." className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none transition-colors focus:border-white/25 focus:ring-2 focus:ring-white/10" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowCreate(false)} className="rounded-xl border border-[var(--color-line)] px-4 py-1.5 text-xs text-[var(--color-mute)]">Cancel</button>
            <button type="submit" className="rounded-xl bg-[var(--color-magenta)] px-5 py-1.5 text-xs font-bold text-black">Host</button>
          </div>
        </form>
      )}

      {!isMember && (
        <p className="mb-6 rounded-xl border border-dashed border-[var(--color-line)] px-4 py-3 text-xs text-[var(--color-mute)]">
          Join the club to host or join watch parties.
        </p>
      )}

      {parties.length === 0 ? (
        <p className="py-10 text-center text-sm text-[var(--color-mute)]">No watch parties yet.</p>
      ) : (
        <div className="space-y-3">
          {parties.map((party) => {
            const statusLabel = party.status === "live" ? "Live" : party.status === "ended" ? "Ended" : "Waiting";
            return (
              <div key={party.id} className="neon-rgb-border flex items-center gap-3 rounded-2xl bg-[var(--color-panel)] p-4">
                {party.mediaImage ? (
                  <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg" style={{ background: `url(${party.mediaImage}) center/cover` }} />
                ) : (
                  <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] text-xs font-bold text-black">
                    {party.mediaTitle.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-bold text-[var(--color-ink)]">{party.mediaTitle}</h3>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${party.status === "live" ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-[var(--color-mute)]"}`}>
                      {statusLabel}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-[var(--color-mute)]">
                    Ep {party.episode} · by <Link href={`/profile/${party.host.id}`} className="hover:text-[var(--color-cyan)]">{party.host.username}</Link> · {party.members.length} watching
                  </p>
                  <p className="text-[10px] text-[var(--color-mute)]">
                    {new Date(party.playbackPos * 1000).toISOString().substr(11, 8)} · {party.isPlaying ? "playing" : "paused"}
                  </p>
                </div>
                {session?.user && (
                  <Link
                    href={`/watch-party/${party.id}`}
                    className="shrink-0 rounded-xl bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-violet)] px-4 py-2 text-xs font-bold text-black transition-transform hover:scale-105"
                  >
                    {isInParty(party) ? "Open" : "Join"}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
