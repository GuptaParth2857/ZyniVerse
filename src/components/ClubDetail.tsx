"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

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

const CATEGORY_LABELS: Record<string, string> = {
  fan_club: "Fan Club", discussion: "Discussion", watching: "Watching",
  reading: "Reading", region: "Region", language: "Language", other: "Other",
};

interface Props {
  club: ClubData;
  isMember: boolean;
  memberRole?: string | null;
  onJoin: () => void;
  onLeave: () => void;
  onCreatePost: (title: string, content: string) => void;
}

export default function ClubDetail({ club, isMember, memberRole, onJoin, onLeave, onCreatePost }: Props) {
  const { data: session } = useSession();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [activeTab, setActiveTab] = useState<"posts" | "members">("posts");

  const isOwner = session?.user?.id === club.ownerId;
  const canManage = isOwner || memberRole === "admin";

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;
    onCreatePost(postTitle.trim(), postContent.trim());
    setPostTitle("");
    setPostContent("");
    setShowCreatePost(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex items-start gap-6 mb-8">
        {club.icon ? (
          <div className="h-20 w-20 shrink-0 rounded-xl overflow-hidden" style={{ background: `url(${club.icon}) center/cover` }} />
        ) : (
          <div className="h-20 w-20 shrink-0 rounded-xl bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] flex items-center justify-center text-3xl font-bold text-black">
            {club.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold">{club.name}</h1>
              <p className="text-sm text-[var(--color-mute)] mt-1">
                by {club.owner.username} · {club.memberCount} members ·{" "}
                <span className="rounded-full bg-[var(--color-cyan)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--color-cyan)]">
                  {CATEGORY_LABELS[club.category] || club.category}
                </span>
                {club.isPrivate && (
                  <span className="ml-2 rounded-full bg-[var(--color-magenta)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--color-magenta)]">
                    Private
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              {isMember ? (
                memberRole !== "owner" ? (
                  <button onClick={onLeave} className="rounded-xl border border-red-500/30 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors">
                    Leave
                  </button>
                ) : null
              ) : session ? (
                <button onClick={onJoin} className="rounded-xl bg-[var(--color-magenta)] px-4 py-2 text-xs font-bold text-black hover:opacity-90 transition-opacity">
                  {club.isPrivate ? "Request to Join" : "Join"}
                </button>
              ) : (
                <Link href="/login" className="rounded-xl bg-[var(--color-magenta)] px-4 py-2 text-xs font-bold text-black hover:opacity-90 transition-opacity">
                  Login to Join
                </Link>
              )}
            </div>
          </div>
          {club.description && <p className="mt-3 text-sm text-[var(--color-mute)]">{club.description}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[var(--color-line)] mb-6">
        <button onClick={() => setActiveTab("posts")} className={`pb-3 text-sm font-semibold transition-colors ${activeTab === "posts" ? "text-[var(--color-cyan)] border-b-2 border-[var(--color-cyan)]" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"}`}>
          Posts ({club._count.posts})
        </button>
        <button onClick={() => setActiveTab("members")} className={`pb-3 text-sm font-semibold transition-colors ${activeTab === "members" ? "text-[var(--color-cyan)] border-b-2 border-[var(--color-cyan)]" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"}`}>
          Members ({club.memberCount})
        </button>
      </div>

      {/* Posts */}
      {activeTab === "posts" && (
        <div>
          {isMember && (
            <div className="mb-6">
              {showCreatePost ? (
                <form onSubmit={handleCreatePost} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 space-y-3">
                  <input value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder="Post title..." className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]" />
                  <textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} rows={4} placeholder="Write something..." className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)] resize-none" />
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setShowCreatePost(false)} className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 text-xs font-medium text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors">Cancel</button>
                    <button type="submit" className="rounded-lg bg-[var(--color-magenta)] px-4 py-1.5 text-xs font-bold text-black hover:opacity-90 transition-opacity">Post</button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setShowCreatePost(true)} className="rounded-xl border border-dashed border-[var(--color-line)] w-full py-4 text-sm text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-colors">
                  + Create Post
                </button>
              )}
            </div>
          )}
          {club.posts.length === 0 ? (
            <p className="text-center py-10 text-sm text-[var(--color-mute)]">No posts yet.</p>
          ) : (
            <div className="space-y-3">
              {club.posts.map((post) => (
                <div key={post.id} className={`rounded-xl border ${post.isPinned ? "border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/5" : "border-[var(--color-line)] bg-[var(--color-panel)]"} p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] flex items-center justify-center text-[8px] font-bold text-black">
                      {post.user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-[var(--color-mute)]">{post.user.username}</span>
                    {post.isPinned && <span className="text-[10px] text-[var(--color-cyan)]">📌 Pinned</span>}
                    <span className="text-[10px] text-[var(--color-mute)] ml-auto">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-display font-bold text-sm mb-1">{post.title}</h3>
                  <p className="text-sm text-[var(--color-mute)] whitespace-pre-wrap">{post.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Members */}
      {activeTab === "members" && (
        <div className="space-y-2">
          {club.members.map((member) => (
            <div key={member.id} className="flex items-center justify-between rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] flex items-center justify-center text-[10px] font-bold text-black">
                  {member.user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{member.user.username}</p>
                  <p className="text-[10px] text-[var(--color-mute)] capitalize">{member.role}</p>
                </div>
              </div>
              {canManage && member.role !== "owner" && (
                <span className="text-[10px] text-[var(--color-mute)]">{member.role}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
