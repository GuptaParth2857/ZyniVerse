"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import WatchPartyCard from "@/components/WatchPartyCard";
import { PageTransition } from "@/components/PageTransition";
import type { WatchPartyData } from "@/lib/watch-party";

export default function WatchPartyClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeParties, setActiveParties] = useState<WatchPartyData[]>([]);
  const [userParties, setUserParties] = useState<WatchPartyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ mediaId: "", mediaTitle: "", mediaImage: "" });

  useEffect(() => {
    Promise.all([
      fetch("/api/watch-party").then((r) => r.json()),
      session?.user?.id ? fetch("/api/watch-party?mine=true").then((r) => r.json()) : Promise.resolve({ parties: [] }),
    ]).then(([active, user]) => {
      setActiveParties(active.parties || []);
      setUserParties(user.parties || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [session]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.mediaId || !createForm.mediaTitle) return;
    const res = await fetch("/api/watch-party", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mediaId: parseInt(createForm.mediaId),
        mediaTitle: createForm.mediaTitle,
        mediaImage: createForm.mediaImage || null,
      }),
    });
    const data = await res.json();
    if (data.party) {
      router.push(`/watch-party/${data.party.id}`);
    }
  }

  return (
    <PageTransition>
      <div className="mx-auto min-h-[80vh] max-w-7xl px-4 py-10 sm:px-6">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold">Watch Party</h1>
          <p className="mt-2 text-[var(--color-mute)] text-sm">Watch anime episodes together in sync</p>
        </div>

        {/* Create */}
        {session?.user?.id && (
          <div className="text-center mb-8">
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="rounded-lg bg-[var(--color-magenta)]/20 border border-[var(--color-magenta)]/30 px-6 py-2.5 text-sm font-semibold text-[var(--color-magenta)] hover:bg-[var(--color-magenta)]/30 transition-colors"
            >
              {showCreate ? "Cancel" : "Create Watch Party"}
            </button>
          </div>
        )}

        {showCreate && (
          <form onSubmit={handleCreate} className="mx-auto max-w-md mb-8 p-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] space-y-3">
            <input
              value={createForm.mediaId}
              onChange={(e) => setCreateForm((p) => ({ ...p, mediaId: e.target.value }))}
              placeholder="Anime ID"
              className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
              required
            />
            <input
              value={createForm.mediaTitle}
              onChange={(e) => setCreateForm((p) => ({ ...p, mediaTitle: e.target.value }))}
              placeholder="Anime Title"
              className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
              required
            />
            <input
              value={createForm.mediaImage}
              onChange={(e) => setCreateForm((p) => ({ ...p, mediaImage: e.target.value }))}
              placeholder="Cover Image URL (optional)"
              className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
            />
            <button type="submit"
              className="w-full rounded-lg bg-[var(--color-cyan)]/20 border border-[var(--color-cyan)]/30 py-2 text-sm font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/30"
            >Create Party</button>
          </form>
        )}

        {/* User's parties */}
        {userParties.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-[var(--color-cyan)]" />
              Your Parties
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userParties.map((p) => (
                <WatchPartyCard key={p.id} party={p} userId={session?.user?.id} />
              ))}
            </div>
          </section>
        )}

        {/* Active parties */}
        <section>
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-[var(--color-magenta)]" />
            Active Parties
          </h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-magenta)] border-t-transparent" />
            </div>
          ) : activeParties.length === 0 ? (
            <p className="text-center text-sm text-[var(--color-mute)] py-12">No active parties. Create one or check back later!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeParties.map((p) => (
                <WatchPartyCard key={p.id} party={p} userId={session?.user?.id} />
              ))}
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
}
