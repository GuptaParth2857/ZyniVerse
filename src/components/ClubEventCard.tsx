"use client";

import { useEffect, useState } from "react";

interface ClubEvent {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string | null;
  isVirtual: boolean;
  streamUrl: string | null;
  members: {
    id: string;
    status: string;
    user: { id: string; username: string; avatar: string | null };
  }[];
}

export default function ClubEventCard({
  event,
  isMember,
  onRsvp,
}: {
  event: ClubEvent;
  isMember: boolean;
  onRsvp: (eventId: string, status: string) => void;
}) {
  const startDate = new Date(event.startTime);
  const going = event.members.filter((m) => m.status === "going").length;

  return (
    <div className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold text-white/90">{event.title}</h4>
        {event.isVirtual && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
            Virtual
          </span>
        )}
      </div>
      {event.description && (
        <p className="text-xs text-white/50 mb-2 line-clamp-2">{event.description}</p>
      )}
      <div className="text-xs text-white/40 mb-3">
        📅 {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString()}
        {going > 0 && <span className="ml-2">· {going} going</span>}
      </div>
      {isMember && (
        <div className="flex gap-2">
          <button
            onClick={() => onRsvp(event.id, "going")}
            className="px-3 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30"
          >
            Going
          </button>
          <button
            onClick={() => onRsvp(event.id, "maybe")}
            className="px-3 py-1 text-xs bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30"
          >
            Maybe
          </button>
        </div>
      )}
      {event.streamUrl && (
        <a
          href={event.streamUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-xs text-cyan-400 hover:underline"
        >
          Join Stream →
        </a>
      )}
    </div>
  );
}
