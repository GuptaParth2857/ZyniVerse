"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface ListSummary {
  id: string;
  title: string;
  itemCount: number;
  likes: number;
}

export default function UserListSidebar({ userId }: { userId: string }) {
  const { data: session } = useSession();
  const [lists, setLists] = useState<ListSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // `mine=1` is the owner's own view: it may include their private lists and
    // is therefore never served from the CDN cache.
    const mine = session?.user?.id && session.user.id === userId ? "&mine=1" : "";
    fetch(`/api/lists?userId=${userId}&limit=5${mine}`)
      .then((r) => r.json())
      .then((d) => setLists(d.lists || []))
      .catch(() => setLists([]))
      .finally(() => setLoading(false));
  }, [userId, session?.user?.id]);

  if (loading) return null;
  if (lists.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
      <h3 className="text-sm font-semibold mb-3">Custom Lists</h3>
      <div className="space-y-2">
        {lists.map((l) => (
          <Link
            key={l.id}
            href={`/lists/${l.id}`}
            className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors text-sm"
          >
            <span className="truncate">{l.title}</span>
            <span className="text-[11px] text-[var(--color-mute)] shrink-0 ml-2">{l.itemCount} items</span>
          </Link>
        ))}
      </div>
      <Link
        href={`/lists?userId=${userId}`}
        className="mt-2 block text-center text-xs text-[var(--color-cyan)] hover:underline"
      >
        View all lists
      </Link>
    </div>
  );
}
