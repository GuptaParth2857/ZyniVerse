"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useWatchlist } from "@/components/WatchlistProvider";

const MAL_STATUS: Record<string, string> = {
  CURRENT: "watching",
  COMPLETED: "completed",
  PLANNING: "plan to watch",
  DROPPED: "dropped",
  PAUSED: "on-hold",
  REWATCHING: "rewatching",
};

type ImportRecord = {
  id: string;
  source: string;
  mediaType: string;
  fileName: string | null;
  totalEntries: number;
  imported: number;
  skipped: number;
  createdAt: string;
};

export default function ListImportExport() {
  const { status: authStatus } = useSession();
  const { items, getStatus, getProgress, getScore } = useWatchlist();
  const fileRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<"mal" | "anilist">("mal");
  const [anilistUser, setAnilistUser] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [history, setHistory] = useState<ImportRecord[] | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const loadHistory = async () => {
    if (authStatus !== "authenticated") {
      setHistory([]);
      setShowHistory(true);
      setMsg({ type: "err", text: "Sign in to see your import history." });
      return;
    }
    try {
      const res = await fetch("/api/watchlist/imports");
      if (!res.ok) return;
      const data = await res.json();
      setHistory(data.imports);
    } catch {
      setHistory([]);
    }
    setShowHistory((s) => !s);
  };

  const exportXml = async () => {
    setBusy(true);
    setMsg(null);
    try {
      let blob: Blob;
      if (authStatus !== "authenticated") {
        // No account → build the MAL XML from the local watchlist.
        const rows = items.map((i) => {
          const status = MAL_STATUS[getStatus(i.id) || "PLANNING"] || "plan to watch";
          return `    <anime>
      <series_animedb_id>${i.id}</series_animedb_id>
      <my_status>${status}</my_status>
      <my_watched_episodes>${getProgress(i.id)}</my_watched_episodes>
      <my_score>${getScore(i.id) ?? 0}</my_score>
      <my_start_date>0000-00-00</my_start_date>
      <my_finish_date>0000-00-00</my_finish_date>
    </anime>`;
        }).join("\n");
        blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n<myanimelist>\n${rows}\n</myanimelist>`], { type: "application/xml" });
      } else {
        const res = await fetch("/api/watchlist/export?format=xml");
        if (!res.ok) throw new Error("Export failed");
        blob = await res.blob();
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zyniverse-myanimelist-${Date.now()}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMsg({ type: "ok", text: "MAL-compatible XML exported!" });
    } catch {
      setMsg({ type: "err", text: "Export failed. Please try again." });
    }
    setBusy(false);
  };

  const doImport = async () => {
    if (authStatus !== "authenticated") {
      setMsg({ type: "err", text: "Sign in to import your list." });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      if (source === "mal") {
        const file = fileRef.current?.files?.[0];
        if (!file) {
          setMsg({ type: "err", text: "Please choose a MAL XML file first." });
          setBusy(false);
          return;
        }
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/import/mal", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Import failed");
        setMsg({ type: "ok", text: `Imported ${data.imported} of ${data.total} entries.` });
      } else {
        if (!anilistUser.trim()) {
          setMsg({ type: "err", text: "Enter an AniList username." });
          setBusy(false);
          return;
        }
        const res = await fetch("/api/import/anilist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: anilistUser.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Import failed");
        setMsg({ type: "ok", text: `Imported ${data.imported} of ${data.total} entries.` });
      }
    } catch (e) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "Import failed." });
    }
    setBusy(false);
  };

  return (
    <div className="mt-6 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold">Transfer List</h2>
          <p className="text-xs text-[var(--color-mute)]">Import from MyAnimeList or AniList, or export a MAL-compatible backup.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportXml} disabled={busy} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-cyan)] transition-all disabled:opacity-50">
            {busy ? "..." : "Export MAL XML"}
          </button>
          <button onClick={loadHistory} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-cyan)] transition-all">
            {showHistory ? "Hide History" : "Import History"}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-[var(--color-line)] p-1">
          <button onClick={() => setSource("mal")} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${source === "mal" ? "bg-[var(--color-cyan)] text-black" : "text-[var(--color-mute)] hover:text-[var(--color-text)]"}`}>
            MyAnimeList
          </button>
          <button onClick={() => setSource("anilist")} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${source === "anilist" ? "bg-[var(--color-cyan)] text-black" : "text-[var(--color-mute)] hover:text-[var(--color-text)]"}`}>
            AniList
          </button>
        </div>

        {source === "mal" ? (
          <>
            <input ref={fileRef} type="file" accept=".xml,text/xml" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="rounded-lg border border-dashed border-[var(--color-line)] bg-[var(--color-void)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-cyan)] transition-all">
              {fileName || "Choose .xml file"}
            </button>
          </>
        ) : (
          <input
            value={anilistUser}
            onChange={(e) => setAnilistUser(e.target.value)}
            placeholder="AniList username"
            className="rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-1.5 text-xs text-[var(--color-text)] outline-none placeholder:text-[var(--color-mute)] focus:border-[var(--color-cyan)]"
          />
        )}

        <button onClick={doImport} disabled={busy} className="rounded-lg px-4 py-1.5 text-xs font-bold text-black transition-all hover:scale-105 disabled:opacity-50" style={{ background: "var(--color-magenta)" }}>
          {busy ? "..." : "Import"}
        </button>
      </div>

      {msg && <p className={`mt-3 text-xs ${msg.type === "ok" ? "text-[var(--color-cyan)]" : "text-red-400"}`}>{msg.text}</p>}

      {showHistory && (
        <div className="mt-4 space-y-1">
          {!history || history.length === 0 ? (
            <p className="text-xs text-[var(--color-mute)]">No imports yet.</p>
          ) : (
            history.map((h) => (
              <div key={h.id} className="flex items-center justify-between rounded-lg border border-[var(--color-line)]/50 bg-[var(--color-void)] px-3 py-2 text-xs">
                <span className="font-medium capitalize">{h.source} &bull; {h.mediaType}</span>
                <span className={h.skipped > 0 ? "text-amber-300" : "text-[var(--color-cyan)]"}>{h.imported}/{h.totalEntries} entries</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}