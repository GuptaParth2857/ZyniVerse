"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { searchMedia, bestTitle } from "@/lib/anilist";
import type { Media } from "@/lib/anilist";

interface ListItem {
  id: string;
  listId: string;
  mediaId: number;
  mediaTitle: string;
  mediaImage: string | null;
  mediaType: string;
  note: string | null;
  order: number;
}

interface ListData {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  type: string;
  isPublic: boolean;
  isFeatured: boolean;
  likes: number;
  createdAt: string;
  itemCount: number;
  user: { id: string; username: string; avatar: string | null };
}

export default function UserListDetail({
  list: initialList,
  items: initialItems,
  isOwner: initialOwner,
  isLiked: initialLiked,
}: {
  list: ListData;
  items: ListItem[];
  isOwner: boolean;
  isLiked: boolean;
}) {
  const router = useRouter();
  const [list, setList] = useState(initialList);
  const [items, setItems] = useState<ListItem[]>(initialItems);
  const [isOwner, setIsOwner] = useState(initialOwner);
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialList.likes);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Media[]>([]);
  const [searching, setSearching] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);
  const [editTitle, setEditTitle] = useState(list.title);
  const [editDescription, setEditDescription] = useState(list.description || "");
  const [editPublic, setEditPublic] = useState(list.isPublic);
  const [editNote, setEditNote] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editMode) {
      const notes: Record<string, string> = {};
      items.forEach((item) => { notes[item.id] = item.note || ""; });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditNote(notes);
    }
  }, [editMode]);

  function handleSearchChange(q: string) {
    setSearchQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim()) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const mediaType = list.type === "mixed" ? "ANIME" : list.type.toUpperCase();
        const res = await searchMedia({ search: q.trim(), type: mediaType, perPage: 20 });
        setSearchResults(res.media || []);
      } catch { setSearchResults([]); }
      setSearching(false);
    }, 300);
  }

  async function addItem(media: Media) {
    const type = media.type?.toLowerCase() === "manga" ? "manga" : "anime";
    try {
      const res = await fetch(`/api/lists/${list.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId: media.id,
          mediaTitle: bestTitle(media.title),
          mediaImage: media.coverImage?.large || null,
          mediaType: type,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setItems((prev) => [...prev, data.item]);
    } catch {}
  }

  async function removeItem(mediaId: number) {
    try {
      await fetch(`/api/lists/${list.id}/items?mediaId=${mediaId}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.mediaId !== mediaId));
    } catch {}
  }

  async function saveReorder(newItems: ListItem[]) {
    setSaving(true);
    try {
      await fetch(`/api/lists/${list.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription || null,
          isPublic: editPublic,
          items: newItems.map((item) => ({
            mediaId: item.mediaId,
            mediaTitle: item.mediaTitle,
            mediaImage: item.mediaImage,
            mediaType: item.mediaType,
            note: editNote[item.id] || null,
          })),
        }),
      });
      setItems(newItems);
      setEditMode(false);
      router.refresh();
    } catch {}
    setSaving(false);
  }

  const handleDragStart = useCallback((idx: number) => {
    setDraggedIdx(idx);
  }, []);

  const handleDrop = useCallback((targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    const newItems = [...items];
    const [moved] = newItems.splice(draggedIdx, 1);
    newItems.splice(targetIdx, 0, moved);
    setItems(newItems.map((item, i) => ({ ...item, order: i })));
    setDraggedIdx(null);
  }, [draggedIdx, items]);

  async function toggleLike() {
    try {
      const res = await fetch(`/api/lists/${list.id}/like`, { method: "POST" });
      const data = await res.json();
      setIsLiked(data.liked);
      setLikes(data.likes);
    } catch {}
  }

  async function togglePublic() {
    try {
      const res = await fetch(`/api/lists/${list.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !editPublic }),
      });
      if (res.ok) setEditPublic(!editPublic);
    } catch {}
  }

  async function deleteList() {
    if (!confirm("Are you sure you want to delete this list?")) return;
    try {
      await fetch(`/api/lists/${list.id}`, { method: "DELETE" });
      router.push("/lists");
    } catch {}
  }

  function shareUrl() {
    const url = window.location.href;
    const text = `Check out "${list.title}" on ZyniVerse!`;
    return { url, text };
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        {editMode ? (
          <div className="space-y-3">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-transparent text-3xl font-bold outline-none border-b border-[var(--color-line)] pb-1"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={2}
              className="w-full resize-none bg-transparent text-sm text-[var(--color-mute)] outline-none border-b border-[var(--color-line)] pb-1"
            />
            <label className="flex items-center gap-2 text-sm text-[var(--color-mute)]">
              <input type="checkbox" checked={editPublic} onChange={(e) => setEditPublic(e.target.checked)} className="rounded" />
              Public
            </label>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold">{list.title}</h1>
                  {list.isFeatured && (
                    <span className="rounded-full bg-yellow-500/20 px-2.5 py-0.5 text-xs font-semibold text-yellow-400">
                      Featured
                    </span>
                  )}
                </div>
                {list.description && (
                  <p className="text-[var(--color-mute)] max-w-2xl">{list.description}</p>
                )}
                <div className="mt-2 flex items-center gap-3 text-sm text-[var(--color-mute)]">
                  <Link href={`/profile`} className="flex items-center gap-1.5 hover:text-[var(--color-cyan)]">
                    {list.user.avatar ? (
                      <div className="relative h-5 w-5 overflow-hidden rounded-full">
                        <Image src={list.user.avatar} alt="" fill className="object-cover" sizes="20px" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-[var(--color-line)]" />
                    )}
                    <span>@{list.user.username}</span>
                  </Link>
                  <span>{list.itemCount} items</span>
                  <span className="capitalize">{list.type}</span>
                  {!editPublic && <span className="text-red-400">Private</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={toggleLike}
                  className={`flex items-center gap-1.5 rounded-lg border px-5 py-2.5 text-sm transition-colors ${
                    isLiked
                      ? "border-red-500/50 text-red-400 bg-red-500/10"
                      : "border-[var(--color-line)] text-[var(--color-mute)] hover:text-red-400"
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {likes}
                </button>
                {isOwner && (
                  <button
                    onClick={() => setEditMode(true)}
className="rounded-lg border border-[var(--color-line)] px-5 py-2.5 text-sm text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
                    >
                      Edit
                  </button>
                )}
                <div className="relative group">
                  <button className="rounded-lg border border-[var(--color-line)] px-5 py-2.5 text-sm text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors">
                    Share ▾
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all overflow-hidden z-10">
                    <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareUrl().text)}&url=${encodeURIComponent(shareUrl().url)}`)} className="block w-full px-4 py-2 text-left text-sm hover:bg-white/5">Share on Twitter</button>
                    <button onClick={() => window.open(`https://www.reddit.com/submit?title=${encodeURIComponent(shareUrl().text)}&url=${encodeURIComponent(shareUrl().url)}`)} className="block w-full px-4 py-2 text-left text-sm hover:bg-white/5">Share on Reddit</button>
                    <button onClick={copyLink} className="block w-full px-4 py-2 text-left text-sm hover:bg-white/5">Copy Link</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit mode top bar */}
      {editMode && (
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowSearch(true)}
            className="rounded-lg bg-[var(--color-cyan)] px-4 py-2 text-sm font-semibold text-black"
          >
            + Add Items
          </button>
          <button
            onClick={togglePublic}
            className="rounded-lg border border-[var(--color-line)] px-3 py-2 text-sm text-[var(--color-mute)]"
          >
            {editPublic ? "Set Private" : "Set Public"}
          </button>
          <button
            onClick={() => saveReorder(items)}
            disabled={saving}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={deleteList}
            className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-400 hover:bg-red-500/30 transition-colors"
          >
            Delete List
          </button>
          <button
            onClick={() => { setEditMode(false); setEditTitle(list.title); setEditDescription(list.description || ""); setEditPublic(list.isPublic); }}
            className="rounded-lg border border-[var(--color-line)] px-3 py-2 text-sm text-[var(--color-mute)]"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Items grid */}
      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[var(--color-mute)] mb-4">No items in this list yet.</p>
          {isOwner && (
            <button onClick={() => setShowSearch(true)} className="rounded-lg bg-[var(--color-cyan)] px-4 py-2 text-sm font-semibold text-black">
              + Add Your First Item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item, idx) => (
            <div
              key={item.id}
              draggable={editMode}
              onDragStart={() => editMode && handleDragStart(idx)}
              onDragOver={(e) => { if (editMode) e.preventDefault(); }}
              onDrop={() => editMode && handleDrop(idx)}
              className={`relative rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden ${
                editMode ? "cursor-grab active:cursor-grabbing hover:border-[var(--color-cyan)]" : ""
              } transition-colors`}
            >
              <Link href={`/${item.mediaType}/${item.mediaId}`} className={editMode ? "pointer-events-none" : ""}>
                <div className="relative aspect-[2/3]">
                  {item.mediaImage ? (
                    <Image src={item.mediaImage} alt={item.mediaTitle} fill className="object-cover" sizes="(max-width: 768px) 50vw, 20vw" />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-[var(--color-void)]">
                      <span className="text-xs text-[var(--color-mute)]">{item.mediaTitle}</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-mono text-white">
                      #{idx + 1}
                    </span>
                  </div>
                  {editMode && (
                    <button
                      onClick={(e) => { e.preventDefault(); removeItem(item.mediaId); }}
                      className="absolute top-2 right-2 rounded-full bg-red-500/80 p-1 text-white hover:bg-red-500 transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </Link>
              <div className="p-2">
                <p className="text-xs font-medium truncate">{item.mediaTitle}</p>
                {item.note && <p className="text-[10px] text-[var(--color-mute)] italic mt-0.5">&ldquo;{item.note}&rdquo;</p>}
                {editMode && (
                  <input
                    value={editNote[item.id] || ""}
                    onChange={(e) => setEditNote((prev) => ({ ...prev, [item.id]: e.target.value }))}
                    placeholder="Add a note..."
                    className="mt-1 w-full rounded border border-[var(--color-line)] bg-[var(--color-void)] px-1.5 py-0.5 text-[10px] outline-none"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Add Items</h3>
              <button onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); }} className="text-[var(--color-mute)] hover:text-[var(--color-ink)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search for anime or manga..."
              autoFocus
              className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)] mb-3"
            />
            <div className="flex-1 overflow-y-auto space-y-1">
              {searching && <p className="text-sm text-[var(--color-mute)] text-center py-4">Searching...</p>}
              {!searching && searchResults.length === 0 && searchQuery && (
                <p className="text-sm text-[var(--color-mute)] text-center py-4">No results found</p>
              )}
              {searchResults.map((media) => {
                const alreadyAdded = items.some((i) => i.mediaId === media.id);
                return (
                  <button
                    key={media.id}
                    onClick={() => { if (!alreadyAdded) addItem(media); }}
                    disabled={alreadyAdded}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-white/5 transition-colors disabled:opacity-40"
                  >
                    {media.coverImage?.large && (
                      <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded">
                        <Image src={media.coverImage.large} alt="" fill className="object-cover" sizes="32px" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{bestTitle(media.title)}</p>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--color-mute)]">
                        {media.format && <span>{media.format}</span>}
                        {media.averageScore && <span>★ {(media.averageScore / 10).toFixed(1)}</span>}
                        {media.episodes && <span>{media.episodes} ep</span>}
                      </div>
                    </div>
                    {alreadyAdded && <span className="text-xs text-[var(--color-mute)]">Added</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
