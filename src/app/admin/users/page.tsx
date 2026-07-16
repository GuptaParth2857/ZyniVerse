"use client";

import { useEffect, useState, useCallback } from "react";

interface UserItem {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  lastSeen: string | null;
  createdAt: string;
  userPoints: { points: number; level: number } | null;
  _count: { userAchievements: number; entries: number; mangaEntries: number };
}

interface UserDetail {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  banner: string | null;
  signature: string | null;
  provider: string | null;
  lastSeen: string | null;
  createdAt: string;
  userPoints: { points: number; level: number } | null;
  rank: { name: string; color: string; tier: number };
  userAchievements: Array<{
    id: string;
    earnedAt: string;
    achievement: { code: string; name: string; icon: string; category: string; points: number };
  }>;
  _count: { entries: number; mangaEntries: number; reviews: number; followers: number; following: number };
  entries: Array<{ mediaId: number; title: string; status: string; score: number | null; progress: number; total: number | null }>;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/users?${params}`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const loadDetail = async (id: string) => {
    setLoadingDetail(true);
    const res = await fetch(`/api/admin/users/${id}`);
    if (res.ok) {
      const data = await res.json();
      setSelectedUser(data.user);
    }
    setLoadingDetail(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Admin</p>
      <h1 className="font-display text-3xl font-bold mt-1">User Management</h1>
      <p className="mt-1 text-sm text-[var(--color-mute)]">{total} registered users</p>

      <div className="mt-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by username or email..."
          className="w-full max-w-md rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-[var(--color-mute)] text-sm">Loading...</div>
      ) : users.length === 0 ? (
        <div className="py-20 text-center text-[var(--color-mute)] text-sm">No users found.</div>
      ) : (
        <div className="mt-6 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-line)]">
                  <th className="text-left py-3 px-4 text-[var(--color-mute)] font-medium text-xs uppercase tracking-wider">User</th>
                  <th className="text-right py-3 px-4 text-[var(--color-mute)] font-medium text-xs uppercase tracking-wider">Points</th>
                  <th className="text-right py-3 px-4 text-[var(--color-mute)] font-medium text-xs uppercase tracking-wider">Level</th>
                  <th className="text-right py-3 px-4 text-[var(--color-mute)] font-medium text-xs uppercase tracking-wider">Achievements</th>
                  <th className="text-right py-3 px-4 text-[var(--color-mute)] font-medium text-xs uppercase tracking-wider">Anime</th>
                  <th className="text-right py-3 px-4 text-[var(--color-mute)] font-medium text-xs uppercase tracking-wider">Manga</th>
                  <th className="text-right py-3 px-4 text-[var(--color-mute)] font-medium text-xs uppercase tracking-wider">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-[var(--color-line)] hover:bg-white/[0.02] cursor-pointer transition-colors"
                    onClick={() => loadDetail(u.id)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {u.avatar ? (
                          <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[var(--color-line)] flex items-center justify-center text-xs">
                            {u.username[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="text-xs font-medium">{u.username}</div>
                          <div className="text-[10px] text-[var(--color-mute)]">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-right text-[var(--color-amber)] font-mono">{u.userPoints?.points || 0}</td>
                    <td className="py-3 px-4 text-xs text-right text-[var(--color-cyan)] font-mono">Lv.{u.userPoints?.level || 1}</td>
                    <td className="py-3 px-4 text-xs text-right text-[var(--color-violet)]">{u._count.userAchievements}</td>
                    <td className="py-3 px-4 text-xs text-right">{u._count.entries}</td>
                    <td className="py-3 px-4 text-xs text-right">{u._count.mangaEntries}</td>
                    <td className="py-3 px-4 text-[10px] text-right text-[var(--color-mute)]">
                      {u.lastSeen ? new Date(u.lastSeen).toLocaleDateString() : "Never"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {loadingDetail ? (
              <div className="py-10 text-center text-[var(--color-mute)] text-sm">Loading...</div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-6">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt="" className="w-14 h-14 rounded-full object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[var(--color-line)] flex items-center justify-center text-xl">
                      {selectedUser.username[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold">{selectedUser.username}</h2>
                    <p className="text-xs text-[var(--color-mute)]">{selectedUser.email}</p>
                    {selectedUser.signature && <p className="text-xs text-[var(--color-mute)] italic mt-0.5">{selectedUser.signature}</p>}
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="ml-auto text-[var(--color-mute)] hover:text-[var(--color-ink)] text-lg"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="rounded-lg bg-[var(--color-line)] px-3 py-2 text-center">
                    <div className="text-[10px] text-[var(--color-mute)] uppercase">Rank</div>
                    <div className="text-sm font-bold" style={{ color: selectedUser.rank.color }}>{selectedUser.rank.name}</div>
                  </div>
                  <div className="rounded-lg bg-[var(--color-line)] px-3 py-2 text-center">
                    <div className="text-[10px] text-[var(--color-mute)] uppercase">Points</div>
                    <div className="text-sm font-bold text-[var(--color-amber)]">{selectedUser.userPoints?.points || 0}</div>
                  </div>
                  <div className="rounded-lg bg-[var(--color-line)] px-3 py-2 text-center">
                    <div className="text-[10px] text-[var(--color-mute)] uppercase">Level</div>
                    <div className="text-sm font-bold text-[var(--color-cyan)]">{selectedUser.userPoints?.level || 1}</div>
                  </div>
                  <div className="rounded-lg bg-[var(--color-line)] px-3 py-2 text-center">
                    <div className="text-[10px] text-[var(--color-mute)] uppercase">Anime</div>
                    <div className="text-sm font-bold">{selectedUser._count.entries}</div>
                  </div>
                  <div className="rounded-lg bg-[var(--color-line)] px-3 py-2 text-center">
                    <div className="text-[10px] text-[var(--color-mute)] uppercase">Manga</div>
                    <div className="text-sm font-bold">{selectedUser._count.mangaEntries}</div>
                  </div>
                  <div className="rounded-lg bg-[var(--color-line)] px-3 py-2 text-center">
                    <div className="text-[10px] text-[var(--color-mute)] uppercase">Followers</div>
                    <div className="text-sm font-bold">{selectedUser._count.followers}</div>
                  </div>
                </div>

                {selectedUser.bio && (
                  <p className="text-sm text-[var(--color-mute)] mb-4">{selectedUser.bio}</p>
                )}

                <p className="text-[10px] text-[var(--color-mute)] mb-2">
                  Joined {new Date(selectedUser.createdAt).toLocaleDateString()}
                  {selectedUser.lastSeen && <> · Last seen {new Date(selectedUser.lastSeen).toLocaleString()}</>}
                  {selectedUser.provider && <> · Provider: {selectedUser.provider}</>}
                </p>

                {selectedUser.userAchievements.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-2">Achievements ({selectedUser.userAchievements.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.userAchievements.map((a) => (
                        <div key={a.id} className="rounded-lg bg-[var(--color-line)] px-2.5 py-1.5 text-xs flex items-center gap-1.5">
                          <span>{a.achievement.icon}</span>
                          <span>{a.achievement.name}</span>
                          <span className="text-[var(--color-mute)]">({a.achievement.points}pt)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedUser.entries.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-2">Recent Anime</h3>
                    <div className="space-y-1">
                      {selectedUser.entries.map((e) => (
                        <div key={e.mediaId} className="flex items-center justify-between text-xs py-1 border-b border-[var(--color-line)]">
                          <span className="truncate">{e.title}</span>
                          <div className="flex items-center gap-3 shrink-0 ml-3">
                            <span className="text-[var(--color-mute)]">{e.status}</span>
                            {e.score && <span className="text-[var(--color-amber)]">{e.score}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
