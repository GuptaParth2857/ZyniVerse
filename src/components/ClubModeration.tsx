"use client";

import { useEffect, useState } from "react";

export default function ClubModeration({
  clubId,
  isAdmin,
}: {
  clubId: string;
  isAdmin: boolean;
}) {
  const [joinRequests, setJoinRequests] = useState<
    { id: string; userId: string; status: string; createdAt: string; user: { username: string; avatar: string | null } }[]
  >([]);

  useEffect(() => {
    fetch(`/api/clubs/${clubId}/join-requests`)
      .then((r) => r.json())
      .then((d) => setJoinRequests(d.requests || []))
      .catch(() => {});
  }, [clubId]);

  const handleRequest = async (requestId: string, action: "approve" | "deny") => {
    const res = await fetch(`/api/clubs/${clubId}/join-requests/${requestId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setJoinRequests((prev) => prev.filter((r) => r.id !== requestId));
    }
  };

  if (joinRequests.length === 0) return null;

  return (
    <div className="mt-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
      <h4 className="text-sm font-semibold text-amber-400 mb-2">
        Pending Join Requests ({joinRequests.length})
      </h4>
      {joinRequests.map((req) => (
        <div key={req.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
          <span className="text-xs text-white/70">{req.user.username}</span>
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => handleRequest(req.id, "approve")}
                className="px-2 py-1 text-[10px] bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30"
              >
                Approve
              </button>
              <button
                onClick={() => handleRequest(req.id, "deny")}
                className="px-2 py-1 text-[10px] bg-pink-500/20 text-pink-400 rounded hover:bg-pink-500/30"
              >
                Deny
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
