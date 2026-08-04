"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ClubEventCard from "./ClubEventCard";
import ClubEventForm from "./ClubEventForm";
import ClubModeration from "./ClubModeration";
import ClubPostComments from "./ClubPostComments";
import ClubPostMedia from "./ClubPostMedia";
import ClubReels from "./ClubReels";
import ClubPolls from "./ClubPolls";
import ClubWatchParties from "./ClubWatchParties";

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
  members: { id: string; role: string; points: number; joinedAt: string; user: { id: string; username: string; avatar?: string | null } }[];
  posts: { id: string; title: string; content: string; image?: string | null; videoUrl?: string | null; thumbnailUrl?: string | null; isPinned: boolean; createdAt: string; user: { id: string; username: string; avatar?: string | null } }[];
  events: { id: string; title: string; description: string | null; startTime: string; endTime: string | null; isVirtual: boolean; streamUrl: string | null; members: { id: string; status: string; user: { id: string; username: string; avatar: string | null } }[] }[];
  reels: { id: string; videoUrl: string; thumbnailUrl: string | null; caption: string | null; createdAt: string; _count: { likes: number }; user: { id: string; username: string; avatar?: string | null } }[];
  polls: { id: string; title: string; description: string | null; isActive: boolean; endsAt: string | null; createdAt: string; createdBy: { id: string; username: string; avatar?: string | null }; options: { id: string; label: string; _count: { votes: number } }[] }[];
  watchParties: { id: string; mediaId: number; mediaTitle: string; mediaImage: string | null; episode: number; status: string; isPlaying: boolean; playbackPos: number; host: { id: string; username: string; avatar?: string | null }; members: { id: string; userId: string; user: { id: string; username: string; avatar?: string | null } }[] }[];
  _count: { members: number; posts: number; joinRequests: number; reels: number; polls: number };
}

const CATEGORY_LABELS: Record<string, string> = {
  fan_club: "Fan Club", discussion: "Discussion", watching: "Watching",
  reading: "Reading", region: "Region", language: "Language", other: "Other",
};

const ROLE_BADGES: Record<string, string> = {
  owner: "bg-[var(--color-magenta)]/15 text-[var(--color-magenta)] ring-[var(--color-magenta)]/25",
  admin: "bg-[var(--color-violet)]/15 text-[var(--color-violet)] ring-[var(--color-violet)]/25",
  member: "bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] ring-[var(--color-cyan)]/20",
};

function getMemberBadge(role: string, points: number): { label: string; className: string } {
  if (role === "owner") return { label: "Founder", className: ROLE_BADGES.owner };
  if (role === "admin") return { label: "Admin", className: ROLE_BADGES.admin };
  if (points >= 50) return { label: "Veteran", className: "bg-[var(--color-magenta)]/10 text-[var(--color-magenta)] ring-[var(--color-magenta)]/20" };
  if (points >= 20) return { label: "Active", className: "bg-[var(--color-violet)]/10 text-[var(--color-violet)] ring-[var(--color-violet)]/20" };
  if (points > 0) return { label: "Member", className: ROLE_BADGES.member };
  return { label: "Newbie", className: "bg-white/5 text-[var(--color-mute)] ring-white/10" };
}

const MEMBER_PERKS: { icon: string; label: string; tab: "posts" | "reels" | "polls" | "members" | "events" | "parties"; create?: boolean }[] = [
  { icon: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7", label: "Create posts", tab: "posts", create: true },
  { icon: "M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z", label: "Post reels", tab: "reels" },
  { icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z", label: "Vote in polls", tab: "polls" },
  { icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", label: "Meet other members", tab: "members" },
  { icon: "M3 11l3-9h12l3 9M2 12h20l-1.5 9h-17L2 12z", label: "RSVP to club events", tab: "events" },
  { icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4zM5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", label: "Watch parties", tab: "parties" },
];

interface Props {
  club: ClubData;
  isMember: boolean;
  memberRole?: string | null;
  onJoin: () => void;
  onLeave: () => void;
  onCreatePost: (title: string, content: string, media?: { image?: string; videoUrl?: string; thumbnailUrl?: string }) => void;
  onEditPost: (postId: string, title: string, content: string) => void;
  onDeletePost: (postId: string) => void;
  onPinPost: (postId: string, isPinned: boolean) => void;
  onUpdateClub: (data: { coverImage?: string; icon?: string; rules?: string; description?: string }) => void;
  onCreateEvent: (eventData: { title: string; description?: string; startTime: string; endTime?: string; isVirtual?: boolean; streamUrl?: string }) => void;
  onRsvp: (eventId: string, status: string) => void;
  onCreateReel: (media: { videoUrl: string; thumbnailUrl?: string; caption?: string }) => void;
  onToggleReelLike: (reelId: string) => void;
  onCreatePoll: (data: { title: string; description?: string; options: string[]; endsAt?: string }) => void;
  onVotePoll: (pollId: string, optionId: string) => void;
  onCreateParty: (data: { mediaId: number; mediaTitle: string; mediaImage?: string; coverImage?: string }) => void;
}

export default function ClubDetail({ club, isMember, memberRole, onJoin, onLeave, onCreatePost, onEditPost, onDeletePost, onPinPost, onUpdateClub, onRsvp, onCreateReel, onToggleReelLike, onCreatePoll, onVotePoll, onCreateParty }: Props) {
  const { data: session } = useSession();
  const coverRef = useRef<HTMLInputElement>(null);
  const iconRef = useRef<HTMLInputElement>(null);

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState("");
  const [postVideo, setPostVideo] = useState("");
  const [postVideoThumb, setPostVideoThumb] = useState("");
  const [uploadingMedia, setUploadingMedia] = useState<"image" | "video" | null>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "reels" | "polls" | "members" | "events" | "parties" | "moderation">("posts");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const [showEventForm, setShowEventForm] = useState(false);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);

  const [editingRules, setEditingRules] = useState(false);
  const [rulesText, setRulesText] = useState(club.rules || "");

  const [uploading, setUploading] = useState<"cover" | "icon" | null>(null);

  const isOwner = session?.user?.id === club.ownerId;
  const canManage = isOwner || memberRole === "admin";

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.url;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "cover" | "icon") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setFeedback("Max 5MB allowed"); return; }
    setUploading(type);
    try {
      const url = await uploadImage(file, `clubs/${club.id}/${type}`);
      onUpdateClub(type === "cover" ? { coverImage: url! } : { icon: url! });
      setFeedback(`${type === "cover" ? "Cover" : "Icon"} updated!`);
    } catch { setFeedback("Upload failed"); }
    setUploading(null);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;
    const media = postImage || postVideo ? { image: postImage || undefined, videoUrl: postVideo || undefined, thumbnailUrl: postVideoThumb || undefined } : undefined;
    onCreatePost(postTitle.trim(), postContent.trim(), media);
    setPostTitle("");
    setPostContent("");
    setPostImage("");
    setPostVideo("");
    setPostVideoThumb("");
    setShowCreatePost(false);
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setFeedback("Max 5MB allowed"); return; }
    setUploadingMedia("image");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setPostImage(data.url);
      setFeedback("Image added!");
    } catch { setFeedback("Image upload failed"); }
    setUploadingMedia(null);
    e.target.value = "";
  };

  const handleVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { setFeedback("Max 50MB allowed"); return; }
    setUploadingMedia("video");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/reel", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setPostVideo(data.url);
      setPostVideoThumb(data.thumbnailUrl || "");
      setFeedback("Reel added!");
    } catch { setFeedback("Reel upload failed"); }
    setUploadingMedia(null);
    e.target.value = "";
  };

  const handleJoin = async () => {
    setActionLoading(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/clubs/${club.id}/join`, { method: "POST" });
      const data = await res.json();
      if (res.ok) { setFeedback(club.isPrivate ? "Join request sent!" : "Joined!"); onJoin(); }
      else setFeedback(data.error || "Failed to join");
    } catch { setFeedback("Something went wrong"); }
    setActionLoading(false);
  };

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this club?")) return;
    setActionLoading(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/clubs/${club.id}/join`, { method: "DELETE" });
      if (res.ok) { setFeedback("Left the club"); onLeave(); }
    } catch { setFeedback("Something went wrong"); }
    setActionLoading(false);
  };

  const startEditPost = (post: { id: string; title: string; content: string }) => {
    setEditingPostId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  const saveEditPost = () => {
    if (!editingPostId || !editTitle.trim() || !editContent.trim()) return;
    onEditPost(editingPostId, editTitle.trim(), editContent.trim());
    setEditingPostId(null);
  };

  const saveRules = () => {
    onUpdateClub({ rules: rulesText.trim() || undefined });
    setEditingRules(false);
    setFeedback("Rules updated!");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Cover Image */}
      <div className="neon-rgb-border relative mb-6 h-48 w-full overflow-hidden rounded-2xl sm:h-64">
        {club.coverImage ? (
          <div className="h-full w-full" style={{ background: `url(${club.coverImage}) center/cover` }} />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[var(--color-violet)]/30 via-[var(--color-panel)] to-[var(--color-magenta)]/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-void)] via-transparent to-transparent" />
        {canManage && (
          <>
            <button onClick={() => coverRef.current?.click()} className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-1.5 text-[10px] font-medium text-white backdrop-blur-sm hover:bg-black/80 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
              {uploading === "cover" ? "Uploading..." : "Change Cover"}
            </button>
            <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "cover")} />
          </>
        )}
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
        <div className="relative -mt-12 shrink-0 sm:-mt-16">
          <div className="group relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-2xl border-4 border-[var(--color-void)] shadow-[0_0_20px_-6px_var(--color-magenta)]">
            {club.icon && club.icon.startsWith("http") ? (
              <div className="h-full w-full" style={{ background: `url(${club.icon}) center/cover` }} />
            ) : club.icon ? (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] text-3xl sm:text-4xl">{club.icon}</div>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] text-3xl font-bold text-black sm:text-4xl">
                {club.name.charAt(0).toUpperCase()}
              </div>
            )}
            {canManage && (
              <>
                <button onClick={() => iconRef.current?.click()} className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                </button>
                <input ref={iconRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "icon")} />
              </>
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl font-bold sm:text-3xl">
                <span className="gradient-text">{club.name}</span>
              </h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--color-mute)] sm:text-sm">
                <Link href={`/profile/${club.owner.id}`} className="font-medium text-[var(--color-ink)] hover:text-[var(--color-cyan)]">by {club.owner.username}</Link>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
                  {club.memberCount} members
                </span>
                <span className="rounded-full bg-[var(--color-cyan)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--color-cyan)]">
                  {CATEGORY_LABELS[club.category] || club.category}
                </span>
                {club.isPrivate && (
                  <span className="rounded-full bg-[var(--color-magenta)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--color-magenta)]">
                    Private
                  </span>
                )}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              {isMember ? (
                memberRole !== "owner" ? (
                  <button onClick={handleLeave} disabled={actionLoading} className="rounded-xl border border-red-500/30 px-4 py-2 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50">
                    {actionLoading ? "..." : "Leave"}
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-xl bg-[var(--color-magenta)]/15 px-4 py-2 text-xs font-bold text-[var(--color-magenta)] ring-1 ring-[var(--color-magenta)]/25">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l7 4v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-4z" /><path d="M9 12l2 2 4-4" /></svg>
                    Owner
                  </span>
                )
              ) : session ? (
                <button onClick={handleJoin} disabled={actionLoading} className="rounded-xl bg-[var(--color-magenta)] px-4 py-2 text-xs font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-50">
                  {actionLoading ? "..." : club.isPrivate ? "Request to Join" : "Join Club"}
                </button>
              ) : (
                <Link href="/login" className="rounded-xl bg-[var(--color-magenta)] px-4 py-2 text-xs font-bold text-black transition-opacity hover:opacity-90">
                  Login to Join
                </Link>
              )}
            </div>
          </div>
          {feedback && <p className="mt-2 text-xs text-[var(--color-cyan)]">{feedback}</p>}
          {club.description && <p className="mt-3 text-xs text-[var(--color-mute)] sm:text-sm">{club.description}</p>}
        </div>
      </div>

      {/* Member benefits / Join CTA */}
      <div className="neon-rgb-border mb-6 rounded-2xl bg-[var(--color-panel)] p-4">
        {isMember ? (
          <>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
              </span>
              <h3 className="text-sm font-bold text-[var(--color-ink)]">You&apos;re a member!</h3>
              {memberRole === "owner" && <span className="text-[10px] text-[var(--color-mute)]">· You own this club</span>}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {MEMBER_PERKS.map((perk) => (
                <button
                  key={perk.label}
                  onClick={() => { setActiveTab(perk.tab); if (perk.create) setShowCreatePost(true); }}
                  className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-3 py-2 text-left transition-colors hover:bg-white/[0.06]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-cyan)" strokeWidth="1.8" className="shrink-0"><path d={perk.icon} /></svg>
                  <span className="text-[11px] text-[var(--color-mute)]">{perk.label}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-magenta)]/15 text-[var(--color-magenta)]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--color-ink)]">Join this club to unlock member features</h3>
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                  {MEMBER_PERKS.map((perk) => (
                    <button
                      key={perk.label}
                      onClick={() => setActiveTab(perk.tab)}
                      className="flex items-center gap-1 text-[11px] text-[var(--color-mute)] transition-colors hover:text-[var(--color-cyan)]"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--color-cyan)" strokeWidth="2"><path d={perk.icon} /></svg>
                      {perk.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {session ? (
              <button onClick={handleJoin} disabled={actionLoading} className="shrink-0 rounded-xl bg-[var(--color-magenta)] px-5 py-2.5 text-xs font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-50">
                {actionLoading ? "..." : club.isPrivate ? "Request to Join" : "Join Club"}
              </button>
            ) : (
              <Link href="/login" className="shrink-0 rounded-xl bg-[var(--color-magenta)] px-5 py-2.5 text-xs font-bold text-black transition-opacity hover:opacity-90">
                Login to Join
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Club Rules */}
      {club.rules && !editingRules && (
        <div className="neon-rgb-border mb-6 rounded-2xl bg-[var(--color-panel)] p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-[var(--color-cyan)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              Club Rules
            </h3>
            {canManage && (
              <button onClick={() => { setEditingRules(true); setRulesText(club.rules || ""); }} className="text-[10px] text-[var(--color-mute)] hover:text-[var(--color-cyan)]">Edit</button>
            )}
          </div>
          <p className="whitespace-pre-wrap text-xs text-[var(--color-mute)]">{club.rules}</p>
        </div>
      )}

      {editingRules && (
        <div className="neon-rgb-border mb-6 rounded-2xl bg-[var(--color-panel)] p-4">
          <h3 className="mb-3 text-sm font-bold text-[var(--color-cyan)]">Edit Rules</h3>
          <textarea value={rulesText} onChange={(e) => setRulesText(e.target.value)} rows={4} placeholder="Set club rules and guidelines..." className="w-full resize-none rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none transition-colors focus:border-white/25 focus:ring-2 focus:ring-white/10" />
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setEditingRules(false)} className="rounded-xl border border-[var(--color-line)] px-4 py-1.5 text-xs text-[var(--color-mute)]">Cancel</button>
            <button onClick={saveRules} className="rounded-xl bg-[var(--color-magenta)] px-4 py-1.5 text-xs font-bold text-black">Save</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto rounded-xl bg-[var(--color-panel)] p-1.5">
        {([
          { key: "posts", label: `Posts (${club._count.posts})` },
          { key: "reels", label: `Reels (${club._count.reels})` },
          { key: "polls", label: `Polls (${club._count.polls})` },
          { key: "members", label: `Members (${club.memberCount})` },
          { key: "events", label: "Events" },
          { key: "parties", label: "Watch Parties" },
          ...(canManage ? [{ key: "moderation", label: "Moderation" }] : []),
        ] as { key: "posts" | "reels" | "polls" | "members" | "events" | "parties" | "moderation"; label: string }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab.key ? "bg-[var(--color-magenta)] text-black" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Posts Tab */}
      {activeTab === "posts" && (
        <div>
          {isMember && (
            <div className="mb-6">
              {showCreatePost ? (
                <form onSubmit={handleCreatePost} className="neon-rgb-border space-y-3 rounded-2xl bg-[var(--color-panel)] p-4">
                  <input value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder="Post title..." className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none transition-colors focus:border-white/25 focus:ring-2 focus:ring-white/10" />
                  <textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} rows={4} placeholder="Write something..." className="w-full resize-none rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none transition-colors focus:border-white/25 focus:ring-2 focus:ring-white/10" />
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer rounded-xl border border-[var(--color-line)] px-4 py-2 text-xs text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]">
                      {uploadingMedia === "image" ? "Uploading..." : postImage ? "Image added ✓" : "+ Add Image"}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
                    </label>
                    <label className="cursor-pointer rounded-xl border border-[var(--color-line)] px-4 py-2 text-xs text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]">
                      {uploadingMedia === "video" ? "Uploading..." : postVideo ? "Reel added ✓" : "+ Add Reel (video)"}
                      <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleVideoFile} />
                    </label>
                    {postImage && (
                      <button type="button" onClick={() => setPostImage("")} className="text-[10px] text-[var(--color-mute)] hover:text-red-400">Remove image</button>
                    )}
                    {postVideo && (
                      <button type="button" onClick={() => { setPostVideo(""); setPostVideoThumb(""); }} className="text-[10px] text-[var(--color-mute)] hover:text-red-400">Remove reel</button>
                    )}
                  </div>
                  {(postImage || postVideo) && (
                    <ClubPostMedia image={postImage || null} videoUrl={postVideo || null} thumbnailUrl={postVideoThumb || null} />
                  )}
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowCreatePost(false)} className="rounded-xl border border-[var(--color-line)] px-5 py-2.5 text-xs font-medium text-[var(--color-mute)] transition-colors hover:text-[var(--color-ink)]">Cancel</button>
                    <button type="submit" className="rounded-xl bg-[var(--color-magenta)] px-5 py-2.5 text-xs font-bold text-black transition-opacity hover:opacity-90">Post</button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setShowCreatePost(true)} className="w-full rounded-2xl border border-dashed border-[var(--color-line)] py-4 text-sm text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]">
                  + Create Post
                </button>
              )}
            </div>
          )}
          {club.posts.length === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--color-mute)]">No posts yet.</p>
          ) : (
            <div className="space-y-3">
              {club.posts.map((post) => {
                const isAuthor = session?.user?.id === post.user.id;
                return (
                  <div key={post.id} className={`neon-rgb-border rounded-2xl bg-[var(--color-panel)] p-4 ${post.isPinned ? "ring-1 ring-[var(--color-cyan)]/40" : ""}`}>
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] text-[9px] font-bold text-black">
                        {post.user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs text-[var(--color-mute)]">{post.user.username}</span>
                      {post.isPinned && (
                        <span className="flex items-center gap-0.5 text-[10px] text-[var(--color-cyan)]">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--color-cyan)" stroke="var(--color-cyan)" strokeWidth="2"><path d="M12 2L12 22M17 7L12 2 7 7" /></svg>
                          Pinned
                        </span>
                      )}
                      <span className="ml-auto text-[10px] text-[var(--color-mute)]">{new Date(post.createdAt).toLocaleDateString()}</span>
                      {(isAuthor || canManage) && (
                        <div className="flex gap-1">
                          {canManage && (
                            <button onClick={() => onPinPost(post.id, !post.isPinned)} className="rounded p-1 transition-colors hover:bg-white/5" title={post.isPinned ? "Unpin" : "Pin"}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill={post.isPinned ? "var(--color-cyan)" : "none"} stroke="var(--color-cyan)" strokeWidth="2"><path d="M12 2L12 22M17 7L12 2 7 7" /></svg>
                            </button>
                          )}
                          {isAuthor && (
                            <button onClick={() => startEditPost(post)} className="rounded p-1 transition-colors hover:bg-white/5" title="Edit">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-mute)" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            </button>
                          )}
                          {(isAuthor || canManage) && (
                            <button onClick={() => onDeletePost(post.id)} className="rounded p-1 transition-colors hover:bg-white/5" title="Delete">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {editingPostId === post.id ? (
                      <div className="space-y-2">
                        <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none transition-colors focus:border-white/25 focus:ring-2 focus:ring-white/10" />
                        <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none transition-colors focus:border-white/25 focus:ring-2 focus:ring-white/10" />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingPostId(null)} className="rounded-xl border border-[var(--color-line)] px-3 py-1 text-xs text-[var(--color-mute)]">Cancel</button>
                          <button onClick={saveEditPost} className="rounded-xl bg-[var(--color-magenta)] px-3 py-1 text-xs font-bold text-black">Save</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="mb-1 font-display text-sm font-bold">{post.title}</h3>
                        <p className="whitespace-pre-wrap text-sm text-[var(--color-mute)]">{post.content}</p>
                        <ClubPostMedia image={post.image} videoUrl={post.videoUrl} thumbnailUrl={post.thumbnailUrl} />
                      </>
                    )}
                    {isMember && editingPostId !== post.id && (
                      <div className="mt-2">
                        {expandedComments === post.id ? (
                          <button onClick={() => setExpandedComments(null)} className="text-[10px] text-[var(--color-mute)] hover:text-[var(--color-cyan)]">
                            Hide comments
                          </button>
                        ) : (
                          <button onClick={() => setExpandedComments(post.id)} className="text-[10px] text-[var(--color-mute)] hover:text-[var(--color-cyan)]">
                            Comments...
                          </button>
                        )}
                      </div>
                    )}
                    {expandedComments === post.id && isMember && (
                      <ClubPostComments clubId={club.id} postId={post.id} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Reels Tab */}
      {activeTab === "reels" && (
        <ClubReels
          reels={club.reels}
          isMember={isMember}
          onUpload={onCreateReel}
          onToggleLike={onToggleReelLike}
        />
      )}

      {/* Polls Tab */}
      {activeTab === "polls" && (
        <ClubPolls
          polls={club.polls}
          isMember={isMember}
          onCreate={onCreatePoll}
          onVote={onVotePoll}
        />
      )}

      {/* Watch Parties Tab */}
      {activeTab === "parties" && (
        <ClubWatchParties
          parties={club.watchParties}
          isMember={isMember}
          onCreate={onCreateParty}
        />
      )}

      {/* Members Tab */}
      {activeTab === "members" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Members ({club.memberCount})</h3>
            <span className="text-[10px] text-[var(--color-mute)]">Top contributors earn badges</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[...club.members]
              .sort((a, b) => (b.points || 0) - (a.points || 0))
              .map((member) => {
                const badge = getMemberBadge(member.role, member.points || 0);
                return (
                  <Link
                    key={member.id}
                    href={`/profile/${member.user.id}`}
                    className="neon-rgb-border flex items-center gap-3 rounded-2xl bg-[var(--color-panel)] p-3 no-underline transition-transform hover:-translate-y-0.5"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] text-sm font-bold text-black">
                      {member.user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--color-ink)]">{member.user.username}</p>
                      <p className="text-[10px] text-[var(--color-mute)]">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ring-1 ${badge.className}`}>
                        {badge.label}
                      </span>
                      <span className="text-[10px] text-[var(--color-mute)]">{member.points || 0} pts</span>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === "events" && (
        <div>
          {canManage && (
            <div className="mb-4">
              <button onClick={() => setShowEventForm(true)} className="w-full rounded-2xl border border-dashed border-[var(--color-line)] py-4 text-sm text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]">
                + Create Event
              </button>
            </div>
          )}
          {!club.events || club.events.length === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--color-mute)]">No events yet.</p>
          ) : (
            <div className="space-y-3">
              {club.events.map((event) => (
                <ClubEventCard key={event.id} event={event} isMember={isMember} onRsvp={onRsvp} />
              ))}
            </div>
          )}
          {showEventForm && (
            <ClubEventForm clubId={club.id} onSubmit={() => { setShowEventForm(false); }} onClose={() => setShowEventForm(false)} />
          )}
        </div>
      )}

      {/* Moderation Tab */}
      {activeTab === "moderation" && canManage && (
        <div>
          <ClubModeration clubId={club.id} isAdmin={canManage} />
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-bold">Banned Users</h3>
            <BannedUsersList clubId={club.id} />
          </div>
        </div>
      )}
    </div>
  );
}

function BannedUsersList({ clubId }: { clubId: string }) {
  const [bans, setBans] = useState<{ id: string; reason: string | null; createdAt: string; user: { username: string } }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clubs/${clubId}/bans`)
      .then((r) => r.json())
      .then((d) => setBans(d.bans || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [clubId]);

  if (loading) return <div className="h-10 animate-pulse rounded bg-white/5" />;
  if (bans.length === 0) return <p className="text-xs text-[var(--color-mute)]">No banned users.</p>;

  return (
    <div className="space-y-2">
      {bans.map((ban) => (
        <div key={ban.id} className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 p-3">
          <div>
            <p className="text-sm text-white/80">{ban.user.username}</p>
            {ban.reason && <p className="text-[10px] text-white/40">{ban.reason}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
