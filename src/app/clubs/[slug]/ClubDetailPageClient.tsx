"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ClubDetail from "@/components/ClubDetail";

interface ClubData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  icon?: string | null;
  category: string;
  isPrivate: boolean;
  memberCount: number;
  ownerId: string;
  owner: { id: string; username: string; avatar?: string | null };
  members: { id: string; role: string; user: { id: string; username: string; avatar?: string | null } }[];
  posts: { id: string; title: string; content: string; isPinned: boolean; createdAt: string; user: { id: string; username: string; avatar?: string | null } }[];
  _count: { members: number; posts: number; joinRequests: number };
}

export default function ClubDetailPageClient({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = useParams();
  const slug = resolvedParams?.slug as string;

  const [club, setClub] = useState<ClubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchClub = () => {
    setLoading(true);
    fetch(`/api/clubs/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setClub(data.club);
      })
      .catch(() => setError("Failed to load club"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (typeof slug === "string") fetchClub(); }, [slug]);

  const isMember = club?.members?.some((m: any) => m.user.id === "current") ?? false;
  const memberRole = null;

  const handleJoin = async () => {
    const res = await fetch(`/api/clubs/${club?.id}/join`, { method: "POST" });
    if (res.ok) fetchClub();
  };

  const handleLeave = async () => {
    const res = await fetch(`/api/clubs/${club?.id}/join`, { method: "DELETE" });
    if (res.ok) fetchClub();
  };

  const handleCreatePost = async (title: string, content: string) => {
    const res = await fetch(`/api/clubs/${club?.id}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    if (res.ok) fetchClub();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-[var(--color-line)] rounded" />
          <div className="h-4 w-2/3 bg-[var(--color-line)] rounded" />
          <div className="h-32 bg-[var(--color-line)] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-[var(--color-mute)]">{error || "Club not found"}</p>
      </div>
    );
  }

  return <ClubDetail club={club} isMember={false} memberRole={null} onJoin={handleJoin} onLeave={handleLeave} onCreatePost={handleCreatePost} />;
}
