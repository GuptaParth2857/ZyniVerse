"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TIERS } from "@/lib/tierlist";
import { TIER_LIST_TEMPLATES } from "@/lib/tierlist-templates";
import { searchMedia, bestTitle } from "@/lib/anilist";
import type { Media } from "@/lib/anilist";

interface Item {
  id: string;
  tier: string;
  mediaId: number;
  mediaTitle: string;
  mediaImage: string;
  order: number;
}

function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

export interface TierListBuilderData {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  items: {
    id: string;
    tier: string;
    mediaId: number;
    mediaTitle: string;
    mediaImage: string | null;
    order: number;
  }[];
}

export default function TierListBuilder({ initialData }: { initialData?: TierListBuilderData }) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);
  const [items, setItems] = useState<Item[]>(
    () =>
      initialData?.items.map((i) => ({
        id: i.id,
        tier: i.tier,
        mediaId: i.mediaId,
        mediaTitle: i.mediaTitle,
        mediaImage: i.mediaImage || "",
        order: i.order,
      })) || []
  );
  const [saving, setSaving] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Media[]>([]);
  const [searching, setSearching] = useState(false);
  const [draggedItem, setDraggedItem] = useState<Item | null>(null);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);
  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const uploadTargetTier = useRef<string>("_pool");

  const poolItems = items.filter((i) => i.tier === "_pool");

  function getTierItems(tier: string) {
    return items.filter((i) => i.tier === tier).sort((a, b) => a.order - b.order);
  }

  function nextCustomId(): number {
    const existing = new Set(items.map((i) => i.mediaId));
    let n = 1;
    while (existing.has(-n)) n++;
    return -n;
  }

  function addToPool(media: Media) {
    const id = generateId();
    setItems((prev) => [
      ...prev,
      {
        id,
        tier: "_pool",
        mediaId: media.id,
        mediaTitle: bestTitle(media.title),
        mediaImage: media.coverImage?.large || "",
        order: prev.length,
      },
    ]);
  }

  async function loadTemplate(templateId: string) {
    const template = TIER_LIST_TEMPLATES.find((t) => t.id === templateId);
    if (!template || loadingTemplate) return;
    setLoadingTemplate(templateId);
    try {
      const results = await Promise.all(
        template.queries.map(async (q) => {
          try {
            const res = await searchMedia({ search: q, type: "ANIME", perPage: 1 });
            return res.media?.[0] || null;
          } catch {
            return null;
          }
        })
      );
      setItems((prev) => {
        const addedIds = new Set(prev.map((i) => i.mediaId));
        const fresh = results
          .filter((m): m is Media => m !== null && !addedIds.has(m.id))
          .map((m) => ({
            id: generateId(),
            tier: "_pool" as const,
            mediaId: m.id,
            mediaTitle: bestTitle(m.title),
            mediaImage: m.coverImage?.large || "",
            order: prev.length,
          }));
        return [...prev, ...fresh];
      });
    } finally {
      setLoadingTemplate(null);
    }
  }

  function handleUploadClick(tier: string) {
    uploadTargetTier.current = tier;
    uploadRef.current?.click();
  }

  async function handleUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      const target = uploadTargetTier.current;
      const mediaId = nextCustomId();
      const name = (file.name.replace(/\.[^.]+$/, "") || "Custom Image").slice(0, 40);
      setItems((prev) => {
        const targetItems = prev.filter((i) => i.tier === target);
        return [
          ...prev.filter((i) => i.tier !== target),
          ...targetItems,
          {
            id: generateId(),
            tier: target,
            mediaId,
            mediaTitle: name,
            mediaImage: data.url,
            order: targetItems.length,
          },
        ];
      });
    } catch (e) {
      console.error(e);
    }
    setUploading(false);
    e.target.value = "";
  }

  function removeFromPool(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  function handleSearchChange(q: string) {
    setSearchQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim()) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchMedia({ search: q.trim(), type: "ANIME", perPage: 20 });
        setSearchResults(res.media || []);
      } catch { setSearchResults([]); }
      setSearching(false);
    }, 300);
  }

  const handleDragStart = useCallback((item: Item) => {
    setDraggedItem(item);
  }, []);

  const handleDrop = useCallback((tier: string) => {
    if (!draggedItem) return;
    setItems((prev) => {
      const newItems = prev.filter((i) => i.id !== draggedItem.id);
      const tierItems = newItems.filter((i) => i.tier === tier);
      return [
        ...newItems.filter((i) => i.tier !== tier),
        ...tierItems,
        { ...draggedItem, tier, order: tierItems.length },
      ];
    });
    setDraggedItem(null);
  }, [draggedItem]);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const tierItems = items
        .filter((i) => i.tier !== "_pool")
        .map((i) => ({
          tier: i.tier,
          mediaId: i.mediaId,
          mediaTitle: i.mediaTitle,
          mediaImage: i.mediaImage,
        }));

      const res = await fetch(initialData ? `/api/tierlist/${initialData.id}` : "/api/tierlist", {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          isPublic,
          items: tierItems,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      router.push(`/tierlist/${data.tierList.id}`);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Top Bar */}
      <div className="mb-6 rounded-xl neon-rgb-border bg-[var(--color-panel)] p-4 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tier List Title..."
          className="w-full bg-transparent text-xl font-bold outline-none placeholder:text-[var(--color-mute)]"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)..."
          rows={2}
          className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-[var(--color-mute)]"
        />
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-[var(--color-mute)]">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded border-[var(--color-line)]"
            />
            Public
          </label>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="ml-auto rounded-lg bg-[var(--color-cyan)] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Save Tier List"}
          </button>
        </div>
      </div>

      {/* Search Pool */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-semibold text-[var(--color-mute)] uppercase tracking-wider">Anime Pool</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleUploadClick("_pool")}
              disabled={uploading}
              className="rounded-lg neon-rgb-border px-5 py-2.5 text-sm text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "\uD83D\uDCF7 Upload Image"}
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-lg neon-rgb-border px-5 py-2.5 text-sm text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
            >
              + Add from Search
            </button>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--color-mute)]">Start from a template:</span>
          {TIER_LIST_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => loadTemplate(t.id)}
              disabled={loadingTemplate !== null}
              className="flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1.5 text-xs text-[var(--color-mute)] transition-all hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] disabled:opacity-50"
              title={t.description}
            >
              <span>{t.emoji}</span>
              {t.name}
              {loadingTemplate === t.id && (
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
            </button>
          ))}
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop("_pool")}
          className="flex flex-wrap gap-3 min-h-[100px] rounded-xl border-2 border-dashed border-[var(--color-line)] bg-[var(--color-panel)] p-3"
        >
          {poolItems.length === 0 && (
            <p className="w-full text-center text-sm text-[var(--color-mute)] py-6">
              Search for anime to add to your tier list
            </p>
          )}
          {poolItems.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item)}
              className="group relative flex items-center gap-2 rounded-lg neon-rgb-border bg-[var(--color-void)] p-1.5 pr-8 cursor-grab active:cursor-grabbing hover:border-[var(--color-cyan)] transition-colors"
            >
              {item.mediaImage && (
                <div className="relative h-10 w-7 shrink-0 overflow-hidden rounded">
                  <Image src={item.mediaImage} alt="" fill className="object-cover" sizes="28px" />
                </div>
              )}
              <span className="max-w-[120px] truncate text-xs font-medium">{item.mediaTitle}</span>
              <button
                onClick={() => removeFromPool(item.id)}
                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-400 transition-opacity"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tier Rows */}
      <div className="space-y-2">
        {TIERS.map((tierData) => {
          const tierItems = getTierItems(tierData.tier);
          return (
            <div
              key={tierData.tier}
              className="flex rounded-xl neon-rgb-border overflow-hidden"
            >
              <div
                className="flex w-20 shrink-0 flex-col items-center justify-center p-2 text-center"
                style={{ backgroundColor: tierData.color + "30" }}
              >
                <span className="text-2xl font-black" style={{ color: tierData.color }}>
                  {tierData.label}
                </span>
                <span className="mt-0.5 text-[9px] leading-tight text-[var(--color-mute)]">
                  {tierData.description}
                </span>
                <button
                  onClick={() => handleUploadClick(tierData.tier)}
                  disabled={uploading}
                  className="mt-1.5 rounded-full border border-white/15 bg-black/20 px-2 py-0.5 text-[9px] font-semibold text-[var(--color-ink)] opacity-70 transition-all hover:opacity-100 hover:border-[var(--color-cyan)] disabled:opacity-40"
                  title="Upload image to this tier"
                >
                  {uploading ? "\u2026" : "+ Upload"}
                </button>
              </div>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(tierData.tier)}
                className="flex flex-1 flex-wrap gap-2 p-2 min-h-[72px] bg-[var(--color-panel)]"
              >
                {tierItems.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item)}
                    className="group relative flex items-center gap-2 rounded-lg neon-rgb-border bg-[var(--color-void)] p-1 pr-7 cursor-grab active:cursor-grabbing hover:border-[var(--color-cyan)] transition-colors"
                  >
                    {item.mediaImage && (
                      <div className="relative h-9 w-6 shrink-0 overflow-hidden rounded">
                        <Image src={item.mediaImage} alt="" fill className="object-cover" sizes="24px" />
                      </div>
                    )}
                    <span className="max-w-[100px] truncate text-xs font-medium">{item.mediaTitle}</span>
                    <button
                      onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                      className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-400 transition-opacity"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {tierItems.length === 0 && (
                  <span className="text-xs text-[var(--color-mute)] py-4 px-2">Drop anime here</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hidden image upload input */}
      <input
        ref={uploadRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleUploadFile}
      />

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-xl neon-rgb-border bg-[var(--color-panel)] p-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Search Anime</h3>
              <button onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }} className="text-[var(--color-mute)] hover:text-[var(--color-ink)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search for anime..."
              autoFocus
              className="w-full rounded-lg neon-rgb-border bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)] mb-3"
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
                    onClick={() => {
                      if (!alreadyAdded) addToPool(media);
                    }}
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
