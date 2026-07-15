"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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

const statusConfig: Record<string, { label: string; dot: string; border: string; glow: string }> = {
  waiting: {
    label: "Waiting",
    dot: "bg-yellow-400",
    border: "border-yellow-500/20",
    glow: "shadow-[0_0_15px_-3px_rgba(234,179,8,0.2)]",
  },
  live: {
    label: "Live",
    dot: "bg-green-400",
    border: "border-green-500/20",
    glow: "shadow-[0_0_20px_-3px_rgba(34,197,94,0.3)]",
  },
  ended: {
    label: "Ended",
    dot: "bg-gray-500",
    border: "border-gray-500/20",
    glow: "",
  },
};

export default function WatchPartyCard({
  party,
  userId,
  index = 0,
}: {
  party: WatchPartyData;
  userId?: string | null;
  index?: number;
}) {
  const isMember = userId ? party.members.some((m) => m.userId === userId) : false;
  const isHost = party.hostId === userId;
  const status = statusConfig[party.status] || statusConfig.ended;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative rounded-[20px] border ${status.border} bg-[rgba(18,17,30,0.6)] backdrop-blur-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_40px_-12px_rgba(0,255,224,0.12)] ${status.glow}`}
    >
      {/* Cover Image */}
      <div className="relative h-40 w-full overflow-hidden">
        {party.mediaImage ? (
          <Image
            src={party.mediaImage}
            alt={party.mediaTitle}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[rgba(0,255,224,0.05)] to-[rgba(255,0,230,0.05)]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,15,0.95)] via-[rgba(10,10,15,0.3)] to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-[rgba(10,10,15,0.8)] backdrop-blur-sm border border-[rgba(255,255,255,0.08)] px-2.5 py-1">
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot} ${party.status === "live" ? "animate-pulse" : ""}`} />
          <span className="text-[10px] font-semibold text-white/80">{status.label}</span>
        </div>

        {/* Episode badge */}
        <div className="absolute top-3 right-3 rounded-full bg-[rgba(0,255,224,0.15)] backdrop-blur-sm border border-[rgba(0,255,224,0.2)] px-2.5 py-1">
          <span className="text-[10px] font-bold text-[#00ffe0]">EP {party.episode}</span>
        </div>

        {/* Title overlay at bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display text-base font-bold text-white truncate drop-shadow-lg">
            {party.mediaTitle}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-3 space-y-3">
        {/* Host & Members */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {party.members.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  className="relative h-6 w-6 overflow-hidden rounded-full border-2 border-[rgba(18,17,30,0.8)] bg-[var(--color-void)]"
                >
                  {m.user.avatar ? (
                    <Image src={m.user.avatar} alt="" fill className="object-cover" sizes="24px" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[8px] font-bold text-white/50">
                      {m.user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              ))}
              {party.members.length > 4 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[rgba(18,17,30,0.8)] bg-[rgba(0,255,224,0.1)] text-[8px] font-bold text-[#00ffe0]">
                  +{party.members.length - 4}
                </div>
              )}
            </div>
            <span className="text-[11px] text-white/40">
              {party.members.length} member{party.members.length !== 1 ? "s" : ""}
            </span>
          </div>
          <span className="text-[10px] text-white/25">{timeAgo(party.createdAt)}</span>
        </div>

        {/* Host name */}
        <div className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,0,230,0.5)" strokeWidth="2">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          <span className="text-[11px] text-white/40">Hosted by <span className="text-white/60 font-medium">{party.host.username}</span></span>
        </div>

        {/* Action button */}
        <Link
          href={`/watch-party/${party.id}`}
          className={`group/btn relative flex items-center justify-center gap-2 w-full rounded-[12px] py-2.5 text-xs font-bold transition-all duration-300 overflow-hidden ${
            isMember
              ? "bg-gradient-to-r from-[rgba(0,255,224,0.12)] to-[rgba(0,255,224,0.06)] border border-[rgba(0,255,224,0.2)] text-[#00ffe0] hover:border-[rgba(0,255,224,0.4)] hover:shadow-[0_0_20px_-5px_rgba(0,255,224,0.25)]"
              : party.status === "ended"
              ? "bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-white/30 cursor-not-allowed"
              : "bg-gradient-to-r from-[rgba(255,0,230,0.12)] to-[rgba(112,0,255,0.08)] border border-[rgba(255,0,230,0.2)] text-[#ff00e6] hover:border-[rgba(255,0,230,0.4)] hover:shadow-[0_0_20px_-5px_rgba(255,0,230,0.25)]"
          }`}
        >
          {isMember ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Enter Party
            </>
          ) : party.status === "ended" ? (
            "Party Ended"
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Join Party
            </>
          )}
        </Link>
      </div>
    </motion.div>
  );
}
