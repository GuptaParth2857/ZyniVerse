"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import ClubDetail from "@/components/ClubDetail";

interface ClubData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  rules?: string | null;
  coverImage?: string | null;
  icon?: string | null;
  category: string;
  isPrivate: boolean;
  memberCount: number;
  ownerId: string;
  owner: { id: string; username: string; avatar?: string | null };
  members: { id: string; role: string; user: { id: string; username: string; avatar?: string | null } }[];
  posts: { id: string; title: string; content: string; isPinned: boolean; createdAt: string; user: { id: string; username: string; avatar?: string | null } }[];
  events: { id: string; title: string; description: string | null; startTime: string; endTime: string | null; isVirtual: boolean; streamUrl: string | null; members: { id: string; status: string; user: { id: string; username: string; avatar: string | null } }[] }[];
  _count: { members: number; posts: number; joinRequests: number };
}

export default function ClubDetailPageClient({ params: _params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = useParams();
  const slug = resolvedParams?.slug as string;
  const { data: session } = useSession();

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

  useEffect(() => { if (typeof slug === "string") { // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchClub(); } }, [slug]);

  const isMember = club?.members?.some((m: { user: { id: string } }) => m.user.id === (session as { user?: { id: string } })?.user?.id) ?? false;
  const memberRole = club?.members?.find((m: { user: { id: string } }) => m.user.id === (session as { user?: { id: string } })?.user?.id)?.role ?? null;

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

  const handleEditPost = async (postId: string, title: string, content: string) => {
    const res = await fetch(`/api/clubs/${club?.id}/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    if (res.ok) fetchClub();
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    const res = await fetch(`/api/clubs/${club?.id}/posts/${postId}`, { method: "DELETE" });
    if (res.ok) fetchClub();
  };

  const handlePinPost = async (postId: string, isPinned: boolean) => {
    const res = await fetch(`/api/clubs/${club?.id}/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned }),
    });
    if (res.ok) fetchClub();
  };

  const handleUpdateClub = async (data: { coverImage?: string; icon?: string; rules?: string; description?: string }) => {
    const res = await fetch(`/api/clubs/${club?.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) fetchClub();
  };

  const handleCreateEvent = async (eventData: { title: string; description?: string; startTime: string; endTime?: string; isVirtual?: boolean; streamUrl?: string }) => {
    const res = await fetch(`/api/clubs/${club?.id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });
    if (res.ok) fetchClub();
  };

  const handleRsvp = async (eventId: string, status: string) => {
    await fetch(`/api/clubs/${club?.id}/events/${eventId}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchClub();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="neon-premium rounded-xl" style={{ minHeight: 200 }}>
          <div className="neon-premium-track rounded-xl" />
          <div className="neon-premium-overlay rounded-[10.5px]" />
          <div className="neon-premium-content p-6 animate-pulse space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-xl bg-[var(--color-line)]" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-1/3 bg-[var(--color-line)] rounded" />
                <div className="h-4 w-2/3 bg-[var(--color-line)] rounded" />
              </div>
            </div>
            <div className="h-32 bg-[var(--color-line)] rounded-xl" />
          </div>
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

  return (
    <ClubDetail
      club={club}
      isMember={isMember}
      memberRole={memberRole}
      onJoin={handleJoin}
      onLeave={handleLeave}
      onCreatePost={handleCreatePost}
      onEditPost={handleEditPost}
      onDeletePost={handleDeletePost}
      onPinPost={handlePinPost}
      onUpdateClub={handleUpdateClub}
      onCreateEvent={handleCreateEvent}
      onRsvp={handleRsvp}
    />
  );
}
