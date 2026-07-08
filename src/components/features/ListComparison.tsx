"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import Loader, { ErrorState } from "@/components/Loader";
import { useState, useEffect } from "react";

interface CompareData {
  user: { id: string; username: string; avatar: string | null };
  stats: {
    myTotal: number; theirTotal: number; shared: number;
    onlyMe: number; onlyThem: number; compatibility: number; genresInCommon: number;
  };
  sharedMedia: { mediaId: number; myScore: number | null; theirScore: number | null }[];
}

export default function ListComparison({ username }: { username: string }) {
  const { data: session } = useSession();
  const [data, setData] = useState<CompareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/compare/${username}`)
      .then((r) => {
        if (!r.ok) throw new Error("Comparison failed");
        return r.json();
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [username]);

  if (loading) return <Loader label="Comparing lists..." />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const { stats, user: other } = data;
  const compatColor = stats.compatibility >= 70 ? "var(--color-cyan)" : stats.compatibility >= 40 ? "#eab308" : "var(--color-magenta)";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-[var(--color-line)]">
            {session?.user?.image
              ? <Image src={session.user.image} alt="" fill className="object-cover" sizes="64px" />
              : <div className="h-full w-full flex items-center justify-center text-lg font-bold bg-[var(--color-magenta)]/20 text-[var(--color-magenta)]">{(session?.user?.name || "You")[0]}</div>
            }
          </div>
          <p className="text-xs font-semibold">{session?.user?.name || "You"}</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold font-mono" style={{ color: compatColor }}>{stats.compatibility}%</div>
          <p className="text-[10px] text-[var(--color-mute)]">Compatibility</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-[var(--color-line)]">
            {other.avatar
              ? <Image src={other.avatar} alt="" fill className="object-cover" sizes="64px" />
              : <div className="h-full w-full flex items-center justify-center text-lg font-bold bg-[var(--color-cyan)]/20 text-[var(--color-cyan)]">{other.username[0]}</div>
            }
          </div>
          <p className="text-xs font-semibold">{other.username}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatBox label="Your Anime" value={stats.myTotal} />
        <StatBox label="Their Anime" value={stats.theirTotal} />
        <StatBox label="Shared" value={stats.shared} color="var(--color-cyan)" />
        <StatBox label="Only You" value={stats.onlyMe} />
        <StatBox label="Only Them" value={stats.onlyThem} />
      </div>

      {data.sharedMedia.length > 0 && (
        <div>
          <h3 className="font-display text-sm font-bold mb-3">Shared Anime ({data.sharedMedia.length})</h3>
          <div className="space-y-1.5">
            {data.sharedMedia.map((item) => (
              <Link key={item.mediaId} href={`/anime/${item.mediaId}`}
                className="flex items-center gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-3 hover:border-[var(--color-magenta)]/40 transition-all"
              >
                <span className="font-mono text-xs text-[var(--color-mute)]">#{item.mediaId}</span>
                <div className="flex items-center gap-2 ml-auto text-xs">
                  <span className="font-mono font-bold" style={{ color: item.myScore ? (item.myScore >= 70 ? "var(--color-cyan)" : item.myScore >= 40 ? "#eab308" : "var(--color-magenta)") : "var(--color-mute)" }}>
                    {item.myScore ? `${item.myScore}%` : "—"}
                  </span>
                  <span className="text-[var(--color-mute)]">vs</span>
                  <span className="font-mono font-bold" style={{ color: item.theirScore ? (item.theirScore >= 70 ? "var(--color-cyan)" : item.theirScore >= 40 ? "#eab308" : "var(--color-magenta)") : "var(--color-mute)" }}>
                    {item.theirScore ? `${item.theirScore}%` : "—"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-3 text-center">
      <div className="text-xl font-bold font-mono" style={{ color: color || "var(--color-ink)" }}>{value}</div>
      <div className="text-[9px] text-[var(--color-mute)] mt-0.5">{label}</div>
    </div>
  );
}
