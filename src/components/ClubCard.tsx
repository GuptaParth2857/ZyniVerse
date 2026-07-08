"use client";

import Link from "next/link";

interface ClubCardProps {
  club: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    icon?: string | null;
    coverImage?: string | null;
    category: string;
    memberCount: number;
    isPrivate: boolean;
    owner: { id: string; username: string; avatar?: string | null };
    _count?: { members: number; posts: number };
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  fan_club: "Fan Club",
  discussion: "Discussion",
  watching: "Watching",
  reading: "Reading",
  region: "Region",
  language: "Language",
  other: "Other",
};

export default function ClubCard({ club }: ClubCardProps) {
  return (
    <Link
      href={`/clubs/${club.slug}`}
      className="group rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden hover:border-[var(--color-cyan)]/40 transition-all"
    >
      {club.coverImage && (
        <div className="relative h-32 w-full overflow-hidden">
          <div
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            style={{ background: `url(${club.coverImage}) center/cover` }}
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {club.icon ? (
              <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden" style={{ background: `url(${club.icon}) center/cover` }} />
            ) : (
              <div className="h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] flex items-center justify-center text-lg font-bold text-black">
                {club.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-display font-bold text-sm truncate group-hover:text-[var(--color-cyan)] transition-colors">
                {club.name}
              </h3>
              <p className="text-[10px] text-[var(--color-mute)] mt-0.5">
                {club.owner.username} · {club.memberCount ?? club._count?.members ?? 0} members
              </p>
            </div>
          </div>
        </div>
        {club.description && (
          <p className="mt-2 text-xs text-[var(--color-mute)] line-clamp-2">{club.description}</p>
        )}
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-full bg-[var(--color-cyan)]/10 px-2 py-0.5 text-[9px] font-medium text-[var(--color-cyan)]">
            {CATEGORY_LABELS[club.category] || club.category}
          </span>
          {club.isPrivate && (
            <span className="rounded-full bg-[var(--color-magenta)]/10 px-2 py-0.5 text-[9px] font-medium text-[var(--color-magenta)]">
              Private
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
