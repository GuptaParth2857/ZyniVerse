import Link from "next/link";
import Image from "next/image";
import type { WatchPartyData } from "@/lib/watch-party";

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const statusColors: Record<string, string> = {
  waiting: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  live: "bg-green-500/20 text-green-400 border-green-500/30",
  ended: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export default function WatchPartyCard({
  party,
  userId,
}: {
  party: WatchPartyData;
  userId?: string | null;
}) {
  const isMember = userId ? party.members.some((m) => m.userId === userId) : false;
  const isHost = party.hostId === userId;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex gap-4 p-4">
        <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--color-line)]">
          {party.mediaImage ? (
            <Image src={party.mediaImage} alt={party.mediaTitle} fill className="object-cover" sizes="64px" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[var(--color-mute)]">No img</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold capitalize ${statusColors[party.status]}`}>
              {party.status}
            </span>
            <span className="text-[10px] text-[var(--color-mute)]">{timeAgo(party.createdAt)}</span>
          </div>
          <p className="text-sm font-bold truncate">{party.mediaTitle}</p>
          <p className="text-xs text-[var(--color-mute)]">Episode {party.episode}</p>
          <div className="mt-2 flex items-center gap-3 text-[10px] text-[var(--color-mute)]">
            <span>by {party.host.username}</span>
            <span>{party.members.length} member{party.members.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--color-line)] px-4 py-2 flex gap-2">
        <Link
          href={`/watch-party/${party.id}`}
          className={`flex-1 rounded-lg py-1.5 text-center text-xs font-semibold transition-all ${
            isMember
              ? "bg-[var(--color-cyan)]/20 text-[var(--color-cyan)] border border-[var(--color-cyan)]/30 hover:bg-[var(--color-cyan)]/30"
              : "bg-[var(--color-magenta)]/20 text-[var(--color-magenta)] border border-[var(--color-magenta)]/30 hover:bg-[var(--color-magenta)]/30"
          }`}
        >
          {isMember ? "Enter" : "Join"}
        </Link>
        {isHost && (
          <span className="text-[9px] text-[var(--color-mute)] flex items-center">Host</span>
        )}
      </div>
    </div>
  );
}
