"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PageTransition } from "@/components/PageTransition";
import { logError } from "@/lib/logger";
import { getSupabase } from "@/lib/supabase";

const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB — Supabase free plan storage limit
const MAX_DURATION = 180;

type Phase = "idle" | "validating" | "uploading" | "done" | "error";

const parseJsonOrThrow = async (
  res: Response,
): Promise<Record<string, unknown>> => {
  const text = await res.text();
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(
      res.ok
        ? "Unexpected server response"
        : `Upload failed (${res.status}). Please try again.`,
    );
  }
};

export default function ReelUpload() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [caption, setCaption] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  // ── Source mode: upload a file, or paste a direct video link ──
  const [mode, setMode] = useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = useState("");
  const [urlPreview, setUrlPreview] = useState<string | null>(null);
  const [thumbInput, setThumbInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [urlStatus, setUrlStatus] = useState<"idle" | "direct" | "page">(
    "idle",
  );

  const urlValid = /^https?:\/\/\S+$/i.test(urlInput.trim());
  const hasMedia = mode === "file" ? Boolean(previewUrl) : urlValid;

  // Debounced preview load for pasted links (avoids a request per keystroke).
  useEffect(() => {
    if (mode !== "url") return;
    const url = urlInput.trim();
    const t = setTimeout(
      () => {
        setUrlStatus("idle");
        if (/^https?:\/\/\S+$/i.test(url)) {
          setUrlError("");
          setUrlPreview(url);
        } else {
          setUrlPreview(null);
        }
      },
      url ? 400 : 0,
    );
    return () => clearTimeout(t);
  }, [mode, urlInput]);

  // ── Anime link (optional) ──
  interface AnimePick {
    id: number;
    title: string;
    cover: string | null;
  }
  type AnimeMediaItem = {
    id: number;
    title?: { english?: string | null; romaji?: string | null } | null;
    coverImage?: { medium?: string | null; large?: string | null } | null;
  };
  const [animeQuery, setAnimeQuery] = useState("");
  const [animeResults, setAnimeResults] = useState<AnimePick[]>([]);
  const [animePick, setAnimePick] = useState<AnimePick | null>(null);
  const [animeSearching, setAnimeSearching] = useState(false);
  const animeSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAnimeSearch = (value: string) => {
    setAnimeQuery(value);
    if (animeSearchTimer.current) clearTimeout(animeSearchTimer.current);
    const q = value.trim();
    if (q.length < 2) {
      setAnimeResults([]);
      return;
    }
    animeSearchTimer.current = setTimeout(async () => {
      setAnimeSearching(true);
      try {
        const res = await fetch(
          `/api/anilist/search-media?search=${encodeURIComponent(
            q,
          )}&type=ANIME&perPage=6&sort=POPULARITY_DESC`,
        );
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as { media?: AnimeMediaItem[] };
        setAnimeResults(
          (data.media || []).map((m) => ({
            id: m.id,
            title: m.title?.english || m.title?.romaji || `Anime #${m.id}`,
            cover: m.coverImage?.medium || m.coverImage?.large || null,
          })),
        );
      } catch {
        setAnimeResults([]);
      } finally {
        setAnimeSearching(false);
      }
    }, 320);
  };

  const selectAnime = (r: AnimePick) => {
    setAnimePick(r);
    setAnimeQuery("");
    setAnimeResults([]);
  };

  const validateFile = (f: File) => {
    setError("");
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError("Only MP4, WebM, or MOV files are allowed.");
      return null;
    }
    if (f.size > MAX_SIZE) {
      setError("File cannot be larger than 50MB.");
      return null;
    }
    return f;
  };

  const captureThumbnail = (video: HTMLVideoElement): Promise<Blob | null> =>
    new Promise((resolve) => {
      try {
        const canvas = document.createElement("canvas");
        const targetTime = Math.min(video.duration, 1);
        video.currentTime = targetTime;
        video.onseeked = () => {
          const w = 720;
          const h =
            Math.round((video.videoHeight / video.videoWidth) * w) || 1280;
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d")?.drawImage(video, 0, 0, w, h);
          canvas.toBlob((b) => resolve(b), "image/jpeg", 0.7);
        };
      } catch {
        resolve(null);
      }
    });

  const handleFile = (f: File) => {
    const ok = validateFile(f);
    if (!ok) return;

    setPhase("validating");
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    setFile(f);

    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.src = url;
    probe.onloadedmetadata = async () => {
      const d = probe.duration;
      if (Number.isFinite(d) && d > MAX_DURATION) {
        setPhase("idle");
        setError(
          `Reels can be up to ${MAX_DURATION} seconds (yours is ${Math.round(d)}s).`,
        );
        setPreviewUrl(null);
        setFile(null);
        URL.revokeObjectURL(url);
        return;
      }
      setDuration(Math.round(d || 0));
      const thumb = await captureThumbnail(probe);
      setThumbnail(thumb);
      setPhase("idle");
    };
    probe.onerror = () => {
      setPhase("idle");
      setError("Could not read the video file. Check the format.");
    };
  };

  const submit = async () => {
    if (!file || phase === "uploading") return;
    setPhase("uploading");
    setProgress(0);
    setError("");

    try {
      const presignRes = await fetch("/api/upload/reel/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          needThumbnail: Boolean(thumbnail),
        }),
      });
      const presign = await parseJsonOrThrow(presignRes);
      if (!presignRes.ok)
        throw new Error((presign.error as string) || "Failed to start upload");
      setProgress(30);

      const isR2 = presign.mode === "r2";
      if (isR2) {
        const put = await fetch(presign.signedUrl as string, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!put.ok) throw new Error("Upload failed");
      } else {
        const supabase = getSupabase();
        const { error: uploadErr } = await supabase.storage
          .from("reels")
          .uploadToSignedUrl(
            presign.path as string,
            presign.token as string,
            file,
          );
        if (uploadErr) throw new Error(uploadErr.message || "Upload failed");
      }
      setProgress(60);

      let thumbnailUrl: string | null = null;
      const thumb = presign.thumb as
        | {
            path: string;
            token?: string;
            signedUrl?: string;
            publicUrl: string;
          }
        | null
        | undefined;
      if (thumbnail && thumb) {
        const thumbFile =
          thumbnail instanceof File
            ? thumbnail
            : new File([thumbnail], "thumb.jpg", { type: "image/jpeg" });
        if (isR2 && thumb.signedUrl) {
          const putThumb = await fetch(thumb.signedUrl, {
            method: "PUT",
            body: thumbFile,
            headers: { "Content-Type": "image/jpeg" },
          });
          if (!putThumb.ok) throw new Error("Upload failed");
        } else if (thumb.token) {
          const supabase = getSupabase();
          const { error: thumbErr } = await supabase.storage
            .from("reels")
            .uploadToSignedUrl(thumb.path, thumb.token, thumbFile);
          if (thumbErr) throw new Error(thumbErr.message || "Upload failed");
        }
        thumbnailUrl = thumb.publicUrl;
      }

      setProgress(70);
      const createRes = await fetch("/api/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: presign.publicUrl as string,
          thumbnailUrl,
          caption,
          duration,
          animeId: animePick?.id ?? null,
          animeTitle: animePick?.title ?? null,
        }),
      });
      const createData = await parseJsonOrThrow(createRes);
      if (!createRes.ok)
        throw new Error((createData.error as string) || "Failed to save reel");

      setProgress(100);
      setPhase("done");
      setTimeout(() => router.push("/reels"), 700);
    } catch (e) {
      logError(e);
      setPhase("error");
      setError(
        e instanceof Error ? e.message : "Upload failed. Please try again.",
      );
    }
  };

  const submitUrl = async () => {
    const url = urlInput.trim();
    if (!urlValid || phase === "uploading") return;
    setPhase("uploading");
    setProgress(60);
    setError("");
    setUrlError("");
    try {
      const res = await fetch("/api/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: url,
          thumbnailUrl: thumbInput.trim() || null,
          caption,
          duration,
          animeId: animePick?.id ?? null,
          animeTitle: animePick?.title ?? null,
        }),
      });
      const data = await parseJsonOrThrow(res);
      if (!res.ok)
        throw new Error((data.error as string) || "Failed to save reel");

      setProgress(100);
      setPhase("done");
      setTimeout(() => router.push("/reels"), 700);
    } catch (e) {
      logError(e);
      setPhase("error");
      setError(
        e instanceof Error
          ? e.message
          : "Failed to save reel. Please try again.",
      );
    }
  };

  const submitImport = async () => {
    const url = urlInput.trim();
    if (!urlValid || phase === "uploading") return;
    setPhase("uploading");
    setProgress(15);
    setError("");
    try {
      const res = await fetch("/api/reels/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          caption,
          animeId: animePick?.id ?? null,
          animeTitle: animePick?.title ?? null,
        }),
      });
      const data = await parseJsonOrThrow(res);
      if (!res.ok) throw new Error((data.error as string) || "Import failed");

      setProgress(100);
      setPhase("done");
      setTimeout(() => router.push("/reels"), 700);
    } catch (e) {
      logError(e);
      setPhase("error");
      setError(
        e instanceof Error ? e.message : "Import failed. Please try again.",
      );
    }
  };

  const canSubmit =
    phase !== "uploading" &&
    phase !== "validating" &&
    (mode === "file" ? Boolean(previewUrl) : urlValid && urlStatus !== "idle");
  const submitLabel =
    phase === "uploading"
      ? mode === "file"
        ? `Uploading... ${progress}%`
        : urlStatus === "page"
          ? "Importing reel…"
          : "Publishing..."
      : mode === "url" && urlStatus === "page"
        ? "Import reel"
        : "Publish";
  const onSubmit =
    mode === "file" ? submit : urlStatus === "page" ? submitImport : submitUrl;

  return (
    <PageTransition>
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 animate-page-in">
        <div className="mb-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
            Reels
          </p>
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
            <h1 className="font-display text-2xl font-bold sm:text-3xl mt-1">
              Upload Reel
            </h1>
          </div>
          <p className="mt-2 text-sm text-[var(--color-mute)]">
            Upload an MP4/WebM/MOV (max {MAX_DURATION}s, up to 50MB) — or paste
            a direct video link
          </p>
        </div>

        <div className="neon-rgb-border rounded-2xl bg-[var(--color-panel)]/60 backdrop-blur-sm p-5 sm:p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          <div className="mb-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("file")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === "file"
                  ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white"
                  : "neon-rgb-border text-[var(--color-mute)] hover:text-white"
              }`}
            >
              📁 Upload file
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === "url"
                  ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white"
                  : "neon-rgb-border text-[var(--color-mute)] hover:text-white"
              }`}
            >
              🔗 Paste link
            </button>
          </div>

          {mode === "file" ? (
            !previewUrl ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={phase === "validating"}
                className="flex h-64 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[var(--color-line)] bg-[var(--color-void)] text-[var(--color-mute)] transition hover:border-[var(--color-magenta)] hover:text-white disabled:opacity-50"
              >
                <span className="text-4xl">🎬</span>
                <span className="text-sm font-medium">
                  {phase === "validating"
                    ? "Checking video..."
                    : "Choose a video file"}
                </span>
                <span className="text-xs">MP4 / WebM / MOV · max 50MB</span>
              </button>
            ) : (
              <div className="overflow-hidden rounded-xl bg-black">
                <video
                  src={previewUrl}
                  controls
                  playsInline
                  className="mx-auto max-h-80"
                />
              </div>
            )
          ) : (
            <div className="space-y-3">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://cdn.example.com/clip.mp4"
                className="w-full rounded-xl neon-rgb-border bg-[var(--color-void)] px-3 py-2.5 text-sm text-white placeholder:text-[var(--color-mute)]/50"
              />
              <input
                type="url"
                value={thumbInput}
                onChange={(e) => setThumbInput(e.target.value)}
                placeholder="Thumbnail image URL (optional)"
                className="w-full rounded-xl neon-rgb-border bg-[var(--color-void)] px-3 py-2.5 text-sm text-white placeholder:text-[var(--color-mute)]/50"
              />
              <p className="text-xs text-[var(--color-mute)]">
                Direct video file link (.mp4 / .webm / .mov) — ya YouTube /
                Instagram / TikTok page link, jise server import kar lega.
              </p>
              {urlStatus === "direct" && (
                <p className="text-xs text-emerald-400">
                  ✓ Direct video link — isi URL se play hoga.
                </p>
              )}
              {urlStatus === "page" && (
                <p className="text-xs text-amber-400">
                  🔗 Page link mila — Publish karne par server ise download kar
                  ke reel bana dega (30–60s).
                </p>
              )}
              {urlStatus === "idle" && urlValid && (
                <p className="text-xs text-[var(--color-mute)]/70">
                  Link check ho raha hai…
                </p>
              )}
              {urlError && <p className="text-xs text-red-400">{urlError}</p>}
              {urlPreview && urlStatus !== "page" && (
                <div className="overflow-hidden rounded-xl bg-black">
                  <video
                    key={urlPreview}
                    src={urlPreview}
                    controls
                    playsInline
                    preload="metadata"
                    className="mx-auto max-h-80"
                    onLoadedMetadata={(e) => {
                      setDuration(Math.round(e.currentTarget.duration || 0));
                      setUrlStatus("direct");
                      setUrlError("");
                    }}
                    onError={() => {
                      setUrlStatus("page");
                      setUrlError("");
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {hasMedia && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--color-mute)]">
                  Link to Anime{" "}
                  <span className="normal-case tracking-normal text-white/40">
                    (optional)
                  </span>
                </label>
                {animePick ? (
                  <div className="flex items-center justify-between gap-2 rounded-xl neon-rgb-border bg-[var(--color-void)] px-3 py-2">
                    <span className="flex min-w-0 items-center gap-2.5">
                      {animePick.cover && (
                        <Image
                          src={animePick.cover}
                          alt=""
                          width={40}
                          height={56}
                          className="h-14 w-10 shrink-0 rounded object-cover"
                        />
                      )}
                      <span className="truncate text-sm font-medium text-white">
                        {animePick.title}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setAnimePick(null)}
                      aria-label="Remove anime link"
                      className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-xs font-bold text-white/70 transition hover:bg-white/20 hover:text-white"
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      value={animeQuery}
                      onChange={(e) => handleAnimeSearch(e.target.value)}
                      placeholder="Search anime (e.g. One Piece, Jujutsu Kaisen)..."
                      className="w-full rounded-xl neon-rgb-border bg-[var(--color-void)] px-3 py-2.5 text-sm text-white placeholder:text-[var(--color-mute)]/50"
                    />
                    {animeSearching && animeResults.length === 0 && (
                      <p className="mt-1 text-xs text-[var(--color-mute)]">
                        Searching…
                      </p>
                    )}
                    {animeResults.length > 0 && (
                      <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl">
                        {animeResults.map((r) => (
                          <li key={r.id}>
                            <button
                              type="button"
                              onClick={() => selectAnime(r)}
                              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-white transition hover:bg-white/5"
                            >
                              {r.cover ? (
                                <Image
                                  src={r.cover}
                                  alt=""
                                  width={40}
                                  height={56}
                                  className="h-14 w-10 shrink-0 rounded object-cover"
                                />
                              ) : (
                                <div className="h-14 w-10 shrink-0 rounded bg-[var(--color-void)]" />
                              )}
                              <span className="truncate">{r.title}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Write a caption (optional)..."
                className="w-full resize-none rounded-xl neon-rgb-border bg-[var(--color-void)] p-3 text-sm placeholder:text-[var(--color-mute)]/50"
              />
              <p className="text-right text-xs text-[var(--color-mute)]">
                {caption.length}/500
              </p>
              {duration > 0 && (
                <p className="text-xs text-[var(--color-mute)]">
                  Duration: {Math.floor(duration / 60)}:
                  {String(duration % 60).padStart(2, "0")} min
                  {mode === "file" &&
                    (thumbnail
                      ? " · Thumbnail ready"
                      : " · Thumbnail could not be auto-generated")}
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="mt-3 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          {hasMedia && (
            <div className="mt-5 flex gap-2">
              <button
                onClick={() =>
                  mode === "file"
                    ? fileInputRef.current?.click()
                    : setMode("file")
                }
                disabled={phase === "uploading"}
                className="flex-1 rounded-full neon-rgb-border px-4 py-2.5 text-sm font-medium text-[var(--color-mute)] transition hover:border-[var(--color-magenta)] hover:text-white disabled:opacity-50"
              >
                {mode === "file" ? "Choose another file" : "Upload a file"}
              </button>
              <button
                onClick={onSubmit}
                disabled={!canSubmit}
                className="flex-1 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 neon-rgb-border px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
              >
                {submitLabel}
              </button>
            </div>
          )}

          {phase === "uploading" && (
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--color-void)] neon-rgb-border">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-600 to-purple-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
