"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { searchMedia, bestTitle } from "@/lib/anilist";
import type { Media } from "@/lib/anilist";
import { logError } from "@/lib/logger";

interface Member {
  id: string;
  userId: string;
  role: string;
  user: { id: string; username: string; avatar: string | null };
}

interface Item {
  id: string;
  mediaId: number;
  mediaTitle: string;
  mediaImage: string | null;
  addedBy: string;
  note: string | null;
  order: number;
  createdAt: string;
}

interface WatchlistData {
  id: string;
  title: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  owner: { id: string; username: string; avatar: string | null };
  members: Member[];
  items: Item[];
}

export default function SharedWatchlistDetail({
  watchlist: initial,
  isOwner: initialOwner,
  isEditor,
  currentUserId,
}: {
  watchlist: WatchlistData;
  isOwner: boolean;
  isEditor: boolean;
  currentUserId: string;
}) {
  const [watchlist] = useState(initial);
  const [items, setItems] = useState<Item[]>(initial.items);
  const [members, setMembers] = useState<Member[]>(initial.members);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Media[]>([]);
  const [searching, setSearching] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [editTitle, setEditTitle] = useState(initial.title);
  const [editDesc, setEditDesc] = useState(initial.description || "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  const canEdit = initialOwner || isEditor;

  function handleSearchChange(q: string) {
    setSearchQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim()) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchMedia({ search: q.trim(), perPage: 20 });
        setSearchResults(res.media || []);
      } catch { setSearchResults([]); }
      setSearching(false);
    }, 300);
  }

  async function addItem(media: Media) {
    if (!canEdit) return;
    try {
      const res = await fetch(`/api/shared-watchlists/${watchlist.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId: media.id,
          mediaTitle: bestTitle(media.title),
          mediaImage: media.coverImage?.large || null,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!items.find((i) => i.mediaId === media.id)) {
        setItems((prev) => [...prev, data.item]);
      }
    } catch (e) { logError(e); }
  }

  async function removeItem(mediaId: number) {
    if (!canEdit) return;
    try {
      await fetch(`/api/shared-watchlists/${watchlist.id}/items`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId }),
      });
      setItems((prev) => prev.filter((i) => i.mediaId !== mediaId));
    } catch (e) { logError(e); }
  }

  async function addMember() {
    if (!newUsername.trim() || addingMember) return;
    setAddingMember(true);
    try {
      const userRes = await fetch(`/api/compare/${newUsername.trim()}`);
      const userData = await userRes.json();
      if (!userData.user) {
        setAddingMember(false);
        return;
      }
      const res = await fetch(`/api/shared-watchlists/${watchlist.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userData.user.id, role: "viewer" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (!members.find((m) => m.userId === data.member.userId)) {
          setMembers((prev) => [...prev, data.member]);
        }
      }
      setNewUsername("");
    } catch (e) { logError(e); }
    setAddingMember(false);
  }

  async function removeMember(userId: string) {
    try {
      await fetch(`/api/shared-watchlists/${watchlist.id}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    } catch (e) { logError(e); }
  }

  async function updateRole(userId: string, role: string) {
    try {
      const res = await fetch(`/api/shared-watchlists/${watchlist.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      if (res.ok) {
        const data = await res.json();
        setMembers((prev) => prev.map((m) => m.userId === userId ? { ...m, role: data.member.role } : m));
      }
    } catch (e) { logError(e); }
  }

  async function saveEdits() {
    if (saving) return;
    setSaving(true);
    try {
      await fetch(`/api/shared-watchlists/${watchlist.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, description: editDesc || null }),
      });
      setEditing(false);
    } catch (e) { logError(e); }
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2.5 text-lg font-bold text-[var(--color-ink)] focus:border-[var(--color-cyan)] focus:outline-none"
                  placeholder="Watchlist title"
                />
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2.5 text-sm text-[var(--color-ink)] focus:border-[var(--color-cyan)] focus:outline-none resize-none"
                  rows={2}
                  placeholder="Description (optional)"
                />
                <div className="flex gap-2">
                  <button onClick={saveEdits} disabled={saving} className="rounded-full bg-[var(--color-cyan)] px-5 py-2 text-xs font-bold text-black hover:opacity-90 disabled:opacity-50">
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => setEditing(false)} className="rounded-full border border-[var(--color-line)] px-5 py-2 text-xs font-bold text-[var(--color-mute)] hover:text-[var(--color-ink)]">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="font-display text-2xl font-bold sm:text-3xl">{watchlist.title}</h1>
                {watchlist.description && (
                  <p className="mt-2 text-sm text-[var(--color-mute)]">{watchlist.description}</p>
                )}
                <p className="mt-1 text-xs text-[var(--color-mute)]">
                  by <span className="text-[var(--color-cyan)]">{watchlist.owner.username}</span>
                  {" · "}{items.length} items · {members.length} members
                </p>
              </>
            )}
          </div>

          <div className="flex shrink-0 gap-2">
            {initialOwner && !editing && (
              <button onClick={() => setEditing(true)} className="rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-bold text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors">
                Edit
              </button>
            )}
            {canEdit && (
              <button onClick={() => setShowSearch(true)} className="rounded-full bg-[var(--color-cyan)] px-4 py-2 text-xs font-bold text-black hover:opacity-90">
                + Add
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setShowMembers(!showMembers)} className="flex items-center gap-2 rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-bold text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {members.length} Members
        </button>
      </div>

      <AnimatePresence>
        {showMembers && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 space-y-3">
              {members.map((m) => (
                <div key={m.userId} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-8 w-8 overflow-hidden rounded-full shrink-0">
                      {m.user.avatar ? (
                        <Image src={m.user.avatar} alt="" fill className="object-cover" sizes="32px" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-cyan)] text-xs font-bold text-black">
                          {m.user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{m.user.username}</p>
                      <p className="text-[10px] text-[var(--color-mute)] capitalize">{m.role}</p>
                    </div>
                  </div>
                  {initialOwner && m.userId !== currentUserId && (
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={m.role}
                        onChange={(e) => updateRole(m.userId, e.target.value)}
                        className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-2 py-1 text-[10px] text-[var(--color-mute)] focus:border-[var(--color-cyan)] focus:outline-none"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                      </select>
                      <button onClick={() => removeMember(m.userId)} className="text-[10px] text-red-400 hover:text-red-300">
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {initialOwner && (
                <div className="flex gap-2 pt-2 border-t border-[var(--color-line)]/60">
                  <input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addMember()}
                    placeholder="Username to add..."
                    className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-xs text-[var(--color-ink)] focus:border-[var(--color-cyan)] focus:outline-none"
                  />
                  <button onClick={addMember} disabled={addingMember} className="rounded-lg bg-[var(--color-cyan)] px-4 py-2 text-xs font-bold text-black hover:opacity-90 disabled:opacity-50">
                    {addingMember ? "..." : "Add"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item) => (
          <div key={item.id} className="group relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]">
            <div className="relative aspect-[3/4]">
              {item.mediaImage ? (
                <Image src={item.mediaImage} alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-700" sizes="(max-width: 768px) 50vw, 25vw" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-magenta)]/20 to-[var(--color-cyan)]/20 text-2xl font-bold text-[var(--color-mute)]">
                  {item.mediaTitle.charAt(0)}
                </div>
              )}
              {canEdit && (
                <button
                  onClick={() => removeItem(item.mediaId)}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="p-2.5">
              <p className="text-xs font-bold leading-snug line-clamp-2">{item.mediaTitle}</p>
              {item.note && <p className="mt-1 text-[10px] text-[var(--color-mute)] line-clamp-1">{item.note}</p>}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-3">🎬</div>
            <p className="text-sm font-bold text-[var(--color-mute)]">No items yet</p>
            <p className="text-xs text-[var(--color-mute)]">Add anime, manga, or shows to this watchlist</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
            onClick={() => setShowSearch(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-t-3xl bg-[var(--color-panel)] border border-[var(--color-line)] p-6 sm:rounded-3xl max-h-[80vh] overflow-y-auto"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">Add Media</h3>
                <button onClick={() => setShowSearch(false)} className="text-[var(--color-mute)] hover:text-[var(--color-ink)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search anime or manga..."
                autoFocus
                className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-ink)]/5 px-4 py-3 text-sm text-[var(--color-ink)] focus:border-[var(--color-cyan)] focus:outline-none"
              />

              {searching && <p className="mt-3 text-xs text-[var(--color-mute)]">Searching...</p>}

              <div className="mt-4 space-y-2">
                {searchResults.map((media) => {
                  const added = items.some((i) => i.mediaId === media.id);
                  return (
                    <div key={media.id} className="flex items-center gap-3 rounded-xl border border-[var(--color-line)]/60 bg-[var(--color-panel)] p-3">
                      <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-lg">
                        {media.coverImage?.large ? (
                          <Image src={media.coverImage.large} alt="" fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-[var(--color-magenta)]/20 to-[var(--color-cyan)]/20" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold line-clamp-1">{bestTitle(media.title)}</p>
                        <p className="text-[10px] text-[var(--color-mute)]">{media.type}</p>
                      </div>
                      <button
                        onClick={() => addItem(media)}
                        disabled={added}
                        className="shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold transition-colors disabled:opacity-50 bg-[var(--color-cyan)] text-black hover:opacity-90"
                      >
                        {added ? "Added" : "Add"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
