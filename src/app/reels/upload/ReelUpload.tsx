"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/PageTransition";
import { logError } from "@/lib/logger";
import { getSupabase } from "@/lib/supabase";

const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB — Supabase free plan storage limit
const MAX_DURATION = 180;

type Phase = "idle" | "validating" | "uploading" | "done" | "error";

const parseJsonOrThrow = async (res: Response): Promise<Record<string, unknown>> => {
  const text = await res.text();
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(res.ok ? "Unexpected server response" : `Upload failed (${res.status}). Please try again.`);
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
          const h = Math.round((video.videoHeight / video.videoWidth) * w) || 1280;
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
        setError(`Reels can be up to ${MAX_DURATION} seconds (yours is ${Math.round(d)}s).`);
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
      if (!presignRes.ok) throw new Error((presign.error as string) || "Failed to start upload");
      setProgress(30);

      const supabase = getSupabase();
      const { error: uploadErr } = await supabase.storage
        .from("reels")
        .uploadToSignedUrl(presign.path as string, presign.token as string, file);
      if (uploadErr) throw new Error(uploadErr.message || "Upload failed");
      setProgress(60);

      let thumbnailUrl: string | null = null;
      const thumb = presign.thumb as { path: string; token: string; publicUrl: string } | null | undefined;
      if (thumbnail && thumb) {
        const thumbFile =
          thumbnail instanceof File ? thumbnail : new File([thumbnail], "thumb.jpg", { type: "image/jpeg" });
        const { error: thumbErr } = await supabase.storage
          .from("reels")
          .uploadToSignedUrl(thumb.path, thumb.token, thumbFile);
        if (thumbErr) throw new Error(thumbErr.message || "Upload failed");
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
        }),
      });
      const createData = await parseJsonOrThrow(createRes);
      if (!createRes.ok) throw new Error((createData.error as string) || "Failed to save reel");

      setProgress(100);
      setPhase("done");
      setTimeout(() => router.push("/reels"), 700);
    } catch (e) {
      logError(e);
      setPhase("error");
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 animate-page-in">
        <div className="mb-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Reels</p>
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
            <h1 className="font-display text-2xl font-bold sm:text-3xl mt-1">Upload Reel</h1>
          </div>
          <p className="mt-2 text-sm text-[var(--color-mute)]">
            Anime clips, AMVs or edits — max {MAX_DURATION} seconds, MP4/WebM/MOV, up to 50MB
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

          {!previewUrl ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={phase === "validating"}
              className="flex h-64 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[var(--color-line)] bg-[var(--color-void)] text-[var(--color-mute)] transition hover:border-[var(--color-magenta)] hover:text-white disabled:opacity-50"
            >
              <span className="text-4xl">🎬</span>
              <span className="text-sm font-medium">
                {phase === "validating" ? "Checking video..." : "Choose a video file"}
              </span>
              <span className="text-xs">MP4 / WebM / MOV · max 50MB</span>
            </button>
          ) : (
            <div className="overflow-hidden rounded-xl bg-black">
              <video src={previewUrl} controls playsInline className="mx-auto max-h-80" />
            </div>
          )}

          {previewUrl && (
            <div className="mt-4 space-y-3">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Write a caption (optional)..."
                className="w-full resize-none rounded-xl neon-rgb-border bg-[var(--color-void)] p-3 text-sm placeholder:text-[var(--color-mute)]/50"
              />
              <p className="text-right text-xs text-[var(--color-mute)]">{caption.length}/500</p>
              {duration > 0 && (
                <p className="text-xs text-[var(--color-mute)]">
                  Duration: {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")} min ·{" "}
                  {thumbnail ? "Thumbnail ready" : "Thumbnail could not be auto-generated"}
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="mt-3 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          {previewUrl && (
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={phase === "uploading"}
                className="flex-1 rounded-full neon-rgb-border px-4 py-2.5 text-sm font-medium text-[var(--color-mute)] transition hover:border-[var(--color-magenta)] hover:text-white disabled:opacity-50"
              >
                Choose another file
              </button>
              <button
                onClick={submit}
                disabled={phase === "uploading" || phase === "validating"}
                className="flex-1 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 neon-rgb-border px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
              >
                {phase === "uploading" ? `Uploading... ${progress}%` : "Publish"}
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
