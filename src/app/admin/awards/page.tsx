"use client";

import { useEffect, useState, useCallback } from "react";

interface AdminAward {
  id: number;
  year: number;
  category: string;
  winner: string;
  platform: string;
  type: string;
  image?: string;
  malId?: number;
  anilistId?: number;
  source?: string;
  createdAt: string;
}

interface AwardsResponse {
  awards: AdminAward[];
  total: number;
  page: number;
  totalPages: number;
  years: number[];
  platforms: string[];
  types: string[];
}

export default function AdminAwardsPage() {
  const [data, setData] = useState<AwardsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [fetchResult, setFetchResult] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<string>("");
  const [platformFilter, setPlatformFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editAward, setEditAward] = useState<AdminAward | null>(null);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear().toString(),
    category: "",
    winner: "",
    platform: "Crunchyroll",
    type: "anime",
    image: "",
    malId: "",
    anilistId: "",
    source: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchAwards = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (yearFilter) params.set("year", yearFilter);
    if (platformFilter) params.set("platform", platformFilter);
    if (typeFilter) params.set("type", typeFilter);
    params.set("page", page.toString());
    params.set("limit", "50");

    const res = await fetch(`/api/admin/awards?${params}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [yearFilter, platformFilter, typeFilter, page]);

  useEffect(() => { // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAwards(); }, [fetchAwards]);

  const handleFetchNow = async () => {
    setFetching(true);
    setFetchResult(null);
    try {
      const res = await fetch("/api/admin/awards/fetch", { method: "POST" });
      const json = await res.json();
      setFetchResult(
        json.success
          ? `Fetched! Created: ${json.created}, Updated: ${json.updated}, Skipped: ${json.skipped}, Total scraped: ${json.totalScraped}`
          : `Error: ${json.error}`
      );
      fetchAwards();
    } catch (e) {
      setFetchResult(`Fetch failed: ${String(e)}`);
    }
    setFetching(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...formData,
      year: parseInt(formData.year, 10),
      malId: formData.malId ? parseInt(formData.malId, 10) : null,
      anilistId: formData.anilistId ? parseInt(formData.anilistId, 10) : null,
      image: formData.image || null,
      source: formData.source || null,
    };

    if (editAward) {
      await fetch("/api/admin/awards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editAward.id, ...payload }),
      });
    } else {
      await fetch("/api/admin/awards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setShowAddModal(false);
    setEditAward(null);
    resetForm();
    fetchAwards();
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this award?")) return;
    await fetch(`/api/admin/awards?id=${id}`, { method: "DELETE" });
    fetchAwards();
  };

  const handleEdit = (award: AdminAward) => {
    setEditAward(award);
    setFormData({
      year: award.year.toString(),
      category: award.category,
      winner: award.winner,
      platform: award.platform,
      type: award.type,
      image: award.image || "",
      malId: award.malId?.toString() || "",
      anilistId: award.anilistId?.toString() || "",
      source: award.source || "",
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      year: new Date().getFullYear().toString(),
      category: "",
      winner: "",
      platform: "Crunchyroll",
      type: "anime",
      image: "",
      malId: "",
      anilistId: "",
      source: "",
    });
  };

  const platforms = ["Crunchyroll", "Anime Trending", "MyAnimeList", "Anime News Network", "Newtype", "HIDIVE", "Saturn Awards", "Japan Academy Prize"];
  const types = ["anime", "manga", "live-action", "character", "music"];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Awards Management</h1>
            <p className="text-[var(--color-mute)] mt-1">
              {data ? `${data.total} total awards` : "Loading..."}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleFetchNow}
              disabled={fetching}
              className="px-4 py-2 bg-[var(--color-cyan)] text-black rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {fetching ? "Fetching..." : "Fetch Now"}
            </button>
            <button
              onClick={() => { resetForm(); setEditAward(null); setShowAddModal(true); }}
              className="px-4 py-2 bg-[var(--color-lime)] text-black rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              + Add Award
            </button>
          </div>
        </div>

        {fetchResult && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${fetchResult.includes("Error") || fetchResult.includes("failed")
            ? "bg-red-500/10 text-red-400 border border-red-500/20"
            : "bg-green-500/10 text-green-400 border border-green-500/20"
          }`}>
            {fetchResult}
            <button onClick={() => setFetchResult(null)} className="ml-3 underline">dismiss</button>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={yearFilter}
            onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-[var(--color-panel)] border border-[var(--color-line)] rounded-lg text-sm"
          >
            <option value="">All Years</option>
            {data?.years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={platformFilter}
            onChange={(e) => { setPlatformFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-[var(--color-panel)] border border-[var(--color-line)] rounded-lg text-sm"
          >
            <option value="">All Platforms</option>
            {data?.platforms.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-[var(--color-panel)] border border-[var(--color-line)] rounded-lg text-sm"
          >
            <option value="">All Types</option>
            {data?.types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-[var(--color-panel)] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="bg-[var(--color-panel)] rounded-xl border border-[var(--color-line)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-line)] text-left text-[var(--color-mute)]">
                    <th className="px-4 py-3 font-medium">Year</th>
                    <th className="px-4 py-3 font-medium">Platform</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Winner</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Image</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.awards.map((award) => (
                    <tr key={award.id} className="border-b border-[var(--color-line)]/50 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-medium">{award.year}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]">
                          {award.platform}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-mute)]">{award.category}</td>
                      <td className="px-4 py-3 font-medium">{award.winner}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-[var(--color-purple)]/10 text-[var(--color-purple)]">
                          {award.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {award.image ? (
                          <img src={award.image} alt="" className="w-8 h-11 object-cover rounded" />
                        ) : (
                          <span className="text-[var(--color-mute)] text-xs">No image</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleEdit(award)}
                          className="text-[var(--color-cyan)] hover:underline mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(award.id)}
                          className="text-red-400 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-line)]">
                <span className="text-sm text-[var(--color-mute)]">
                  Page {data.page} of {data.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1 rounded border border-[var(--color-line)] text-sm disabled:opacity-30"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage(Math.min(data.totalPages, page + 1))}
                    disabled={page >= data.totalPages}
                    className="px-3 py-1 rounded border border-[var(--color-line)] text-sm disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-panel)] border border-[var(--color-line)] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-line)]">
              <h2 className="text-lg font-display font-bold">
                {editAward ? "Edit Award" : "Add Award"}
              </h2>
              <button
                onClick={() => { setShowAddModal(false); setEditAward(null); }}
                className="text-[var(--color-mute)] hover:text-[var(--color-ink)] text-xl"
              >
                X
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--color-mute)] mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-line)] rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--color-mute)] mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-line)] rounded-lg text-sm"
                  >
                    {types.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--color-mute)] mb-1">Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-line)] rounded-lg text-sm"
                >
                  {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--color-mute)] mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Anime of the Year"
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-line)] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-mute)] mb-1">Winner</label>
                <input
                  type="text"
                  value={formData.winner}
                  onChange={(e) => setFormData({ ...formData, winner: e.target.value })}
                  placeholder="e.g. Solo Leveling Season 2"
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-line)] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-mute)] mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-line)] rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--color-mute)] mb-1">MAL ID</label>
                  <input
                    type="number"
                    value={formData.malId}
                    onChange={(e) => setFormData({ ...formData, malId: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-line)] rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--color-mute)] mb-1">AniList ID</label>
                  <input
                    type="number"
                    value={formData.anilistId}
                    onChange={(e) => setFormData({ ...formData, anilistId: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-line)] rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--color-mute)] mb-1">Source URL</label>
                <input
                  type="url"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-line)] rounded-lg text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.category || !formData.winner}
                  className="flex-1 px-4 py-2 bg-[var(--color-cyan)] text-black rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? "Saving..." : editAward ? "Update" : "Create"}
                </button>
                <button
                  onClick={() => { setShowAddModal(false); setEditAward(null); }}
                  className="px-4 py-2 border border-[var(--color-line)] rounded-lg text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
