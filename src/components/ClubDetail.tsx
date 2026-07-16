"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ClubEventCard from "./ClubEventCard";
import ClubEventForm from "./ClubEventForm";
import ClubModeration from "./ClubModeration";
import ClubPostComments from "./ClubPostComments";

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
  onEditPost: (postId: string, title: string, content: string) => void;
  onDeletePost: (postId: string) => void;
  onPinPost: (postId: string, isPinned: boolean) => void;
  onUpdateClub: (data: { coverImage?: string; icon?: string; rules?: string; description?: string }) => void;
  onCreateEvent: (eventData: { title: string; description?: string; startTime: string; endTime?: string; isVirtual?: boolean; streamUrl?: string }) => void;
  onRsvp: (eventId: string, status: string) => void;
}

export default function ClubDetail({ club, isMember, memberRole, onJoin, onLeave, onCreatePost, onEditPost, onDeletePost, onPinPost, onUpdateClub, onCreateEvent, onRsvp }: Props) {
  const { data: session } = useSession();
  const coverRef = useRef<HTMLInputElement>(null);
  const iconRef = useRef<HTMLInputElement>(null);

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [activeTab, setActiveTab] = useState<"posts" | "members" | "events" | "moderation">("posts");
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
    onCreatePost(postTitle.trim(), postContent.trim());
    setPostTitle("");
    setPostContent("");
    setShowCreatePost(false);
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
      {club.coverImage && (
        <div className="relative h-48 sm:h-64 w-full rounded-2xl overflow-hidden mb-6">
          <div className="h-full w-full" style={{ background: `url(${club.coverImage}) center/cover` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-void)] via-transparent to-transparent" />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="relative group">
          {club.icon && club.icon.startsWith("http") ? (
            <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl overflow-hidden ring-2 ring-[var(--color-cyan)]/30" style={{ background: `url(${club.icon}) center/cover` }} />
          ) : club.icon ? (
            <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] flex items-center justify-center text-3xl sm:text-4xl">
              {club.icon}
            </div>
          ) : (
            <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] flex items-center justify-center text-2xl sm:text-3xl font-bold text-black">
              {club.name.charAt(0).toUpperCase()}
            </div>
          )}
          {canManage && (
            <>
              <button onClick={() => iconRef.current?.click()} className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
              </button>
              <input ref={iconRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "icon")} />
            </>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">{club.name}</h1>
              <p className="text-xs sm:text-sm text-[var(--color-mute)] mt-1">
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
              {canManage && (
                <button onClick={() => coverRef.current?.click()} className="rounded-xl border border-[var(--color-line)] px-4 py-2 text-xs font-medium text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-colors">
                  {uploading === "cover" ? "Uploading..." : "Cover"}
                </button>
              )}
              {isMember ? (
                memberRole !== "owner" ? (
                  <button onClick={handleLeave} disabled={actionLoading} className="rounded-xl border border-red-500/30 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50">
                    {actionLoading ? "..." : "Leave"}
                  </button>
                ) : null
              ) : session ? (
                <button onClick={handleJoin} disabled={actionLoading} className="rounded-xl bg-[var(--color-magenta)] px-4 py-2 text-xs font-bold text-black hover:opacity-90 transition-opacity disabled:opacity-50">
                  {actionLoading ? "..." : club.isPrivate ? "Request to Join" : "Join"}
                </button>
              ) : (
                <Link href="/login" className="rounded-xl bg-[var(--color-magenta)] px-4 py-2 text-xs font-bold text-black hover:opacity-90 transition-opacity">
                  Login to Join
                </Link>
              )}
            </div>
          </div>
          <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "cover")} />
          {feedback && <p className="mt-2 text-xs text-[var(--color-cyan)]">{feedback}</p>}
          {club.description && <p className="mt-3 text-xs sm:text-sm text-[var(--color-mute)]">{club.description}</p>}
        </div>
      </div>

      {/* Club Rules */}
      {club.rules && !editingRules && (
        <div className="neon-premium rounded-xl mb-6">
          <div className="neon-premium-track rounded-xl" />
          <div className="neon-premium-overlay rounded-[10.5px]" />
          <div className="neon-premium-content p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-[var(--color-cyan)] flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                Club Rules
              </h3>
              {canManage && (
                <button onClick={() => { setEditingRules(true); setRulesText(club.rules || ""); }} className="text-[10px] text-[var(--color-mute)] hover:text-[var(--color-cyan)]">Edit</button>
              )}
            </div>
            <p className="text-xs text-[var(--color-mute)] whitespace-pre-wrap">{club.rules}</p>
          </div>
        </div>
      )}

      {editingRules && (
        <div className="neon-premium rounded-xl mb-6">
          <div className="neon-premium-track rounded-xl" />
          <div className="neon-premium-overlay rounded-[10.5px]" />
          <div className="neon-premium-content p-4 space-y-3">
            <h3 className="text-sm font-bold text-[var(--color-cyan)]">Edit Rules</h3>
            <textarea value={rulesText} onChange={(e) => setRulesText(e.target.value)} rows={4} placeholder="Set club rules and guidelines..." className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)] resize-none" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditingRules(false)} className="rounded-lg border border-[var(--color-line)] px-4 py-1.5 text-xs text-[var(--color-mute)]">Cancel</button>
              <button onClick={saveRules} className="rounded-lg bg-[var(--color-cyan)]/20 px-4 py-1.5 text-xs text-[var(--color-cyan)]">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[var(--color-line)] mb-6 overflow-x-auto">
        <button onClick={() => setActiveTab("posts")} className={`pb-3 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === "posts" ? "text-[var(--color-cyan)] border-b-2 border-[var(--color-cyan)]" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"}`}>
          Posts ({club._count.posts})
        </button>
        <button onClick={() => setActiveTab("members")} className={`pb-3 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === "members" ? "text-[var(--color-cyan)] border-b-2 border-[var(--color-cyan)]" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"}`}>
          Members ({club.memberCount})
        </button>
        <button onClick={() => setActiveTab("events")} className={`pb-3 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === "events" ? "text-[var(--color-cyan)] border-b-2 border-[var(--color-cyan)]" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"}`}>
          Events
        </button>
        {canManage && (
          <button onClick={() => setActiveTab("moderation")} className={`pb-3 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === "moderation" ? "text-[var(--color-cyan)] border-b-2 border-[var(--color-cyan)]" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"}`}>
            Moderation
          </button>
        )}
      </div>

      {/* Posts Tab */}
      {activeTab === "posts" && (
        <div>
          {isMember && (
            <div className="mb-6">
              {showCreatePost ? (
                <form onSubmit={handleCreatePost} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 space-y-3">
                  <input value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder="Post title..." className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]" />
                  <textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} rows={4} placeholder="Write something..." className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)] resize-none" />
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setShowCreatePost(false)} className="rounded-lg border border-[var(--color-line)] px-5 py-2.5 text-xs font-medium text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors">Cancel</button>
                    <button type="submit" className="rounded-lg bg-[var(--color-magenta)] px-5 py-2.5 text-xs font-bold text-black hover:opacity-90 transition-opacity">Post</button>
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
              {club.posts.map((post) => {
                const isAuthor = session?.user?.id === post.user.id;
                return (
                  <div key={post.id} className="neon-premium rounded-xl">
                    <div className="neon-premium-track rounded-xl" />
                    <div className="neon-premium-overlay rounded-[10.5px]" />
                    <div className={`neon-premium-content p-4 ${post.isPinned ? "ring-1 ring-[var(--color-cyan)]/30" : ""}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] flex items-center justify-center text-[8px] font-bold text-black">
                          {post.user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-[var(--color-mute)]">{post.user.username}</span>
                        {post.isPinned && <span className="text-[10px] text-[var(--color-cyan)]">Pinned</span>}
                        <span className="text-[10px] text-[var(--color-mute)] ml-auto">{new Date(post.createdAt).toLocaleDateString()}</span>
                        {(isAuthor || canManage) && (
                          <div className="flex gap-1 ml-2">
                            {canManage && (
                              <button onClick={() => onPinPost(post.id, !post.isPinned)} className="p-1 rounded hover:bg-white/5" title={post.isPinned ? "Unpin" : "Pin"}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill={post.isPinned ? "var(--color-cyan)" : "none"} stroke="var(--color-cyan)" strokeWidth="2"><path d="M12 2L12 22M17 7L12 2 7 7" /></svg>
                              </button>
                            )}
                            {isAuthor && (
                              <button onClick={() => startEditPost(post)} className="p-1 rounded hover:bg-white/5" title="Edit">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-mute)" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                              </button>
                            )}
                            {(isAuthor || canManage) && (
                              <button onClick={() => onDeletePost(post.id)} className="p-1 rounded hover:bg-white/5" title="Delete">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      {editingPostId === post.id ? (
                        <div className="space-y-2">
                          <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]" />
                          <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3} className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)] resize-none" />
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setEditingPostId(null)} className="rounded-lg border border-[var(--color-line)] px-3 py-1 text-xs text-[var(--color-mute)]">Cancel</button>
                            <button onClick={saveEditPost} className="rounded-lg bg-[var(--color-cyan)]/20 px-3 py-1 text-xs text-[var(--color-cyan)]">Save</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-display font-bold text-sm mb-1">{post.title}</h3>
                          <p className="text-sm text-[var(--color-mute)] whitespace-pre-wrap">{post.content}</p>
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === "members" && (
        <div className="space-y-2">
          {club.members.map((member) => (
            <div key={member.id} className="neon-premium rounded-xl">
              <div className="neon-premium-track rounded-xl" />
              <div className="neon-premium-overlay rounded-[10.5px]" />
              <div className="neon-premium-content flex items-center justify-between p-3">
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
            </div>
          ))}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === "events" && (
        <div>
          {canManage && (
            <div className="mb-4">
              <button onClick={() => setShowEventForm(true)} className="rounded-xl border border-dashed border-[var(--color-line)] w-full py-4 text-sm text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-colors">
                + Create Event
              </button>
            </div>
          )}
          {!club.events || club.events.length === 0 ? (
            <p className="text-center py-10 text-sm text-[var(--color-mute)]">No events yet.</p>
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
            <h3 className="text-sm font-bold mb-3">Banned Users</h3>
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

  if (loading) return <div className="animate-pulse h-10 bg-white/5 rounded" />;
  if (bans.length === 0) return <p className="text-xs text-[var(--color-mute)]">No banned users.</p>;

  return (
    <div className="space-y-2">
      {bans.map((ban) => (
        <div key={ban.id} className="flex items-center justify-between p-3 rounded-xl border border-red-500/20 bg-red-500/5">
          <div>
            <p className="text-sm text-white/80">{ban.user.username}</p>
            {ban.reason && <p className="text-[10px] text-white/40">{ban.reason}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
