"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { logError } from "@/lib/logger";

const SPRING = { type: "spring", stiffness: 260, damping: 20 } as const;

interface ProfileData {
  id: string;
  displayName: string | null;
  bio: string | null;
  kofiUrl: string | null;
  buymeacoffeeUrl: string | null;
  upiId: string | null;
  totalTips: number;
  _count: { tips: number };
  user: { id: string; username: string; avatar: string | null };
}

export default function CreatorSetupPage() {
  const { data: session, status } = useSession();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState({ displayName: "", bio: "", kofiUrl: "", buymeacoffeeUrl: "", upiId: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/creator-profile")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);
          setForm({
            displayName: data.profile.displayName || "",
            bio: data.profile.bio || "",
            kofiUrl: data.profile.kofiUrl || "",
            buymeacoffeeUrl: data.profile.buymeacoffeeUrl || "",
            upiId: data.profile.upiId || "",
          });
        }
      })
      .catch((e) => logError(e));
  }, [status]);

  function setField(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function save() {
    if (saving) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/creator-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.displayName || undefined,
          bio: form.bio || undefined,
          kofiUrl: form.kofiUrl || undefined,
          buymeacoffeeUrl: form.buymeacoffeeUrl || undefined,
          upiId: form.upiId || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Save failed (${res.status})`);
      }
      const data = await res.json();
      setSaved(true);
      setProfile(data.profile);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      logError(e);
    }
    setSaving(false);
  }

  if (status === "loading") {
    return (
      <PageTransition>
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-32">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-cyan)] border-t-transparent" />
            <p className="text-sm text-[var(--color-mute)]">Loading your creator profile...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (status === "unauthenticated") {
    return (
      <PageTransition>
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-32">
          <div className="neon-rgb-ring w-full max-w-lg overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#120d1d] to-[#0a0812]" />
            <div className="relative z-10 px-8 py-14 text-center">
              <div className="mb-5 text-5xl">🎙️</div>
              <h1 className="font-display text-2xl font-bold">
                <span className="neon-text-gradient">Creator Profile Setup</span>
              </h1>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                Sign in to set up your creator profile, share your payment links, and start receiving tips from the
                community.
              </p>
              <Link
                href="/login"
                className="mt-8 inline-flex rounded-xl px-7 py-3 text-sm font-black uppercase tracking-wider text-black transition-all hover:brightness-110"
                style={{ background: "linear-gradient(90deg, #00ffe0, #ff7ad9)", boxShadow: "0 0 26px rgba(0,255,224,0.3)" }}
              >
                Sign In to Continue
              </Link>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  const initials = (session?.user?.name || session?.user?.email || "?").charAt(0).toUpperCase();
  const previewAvatar = session?.user?.image || null;

  return (
    <PageTransition>
      <ErrorBoundary label="Creator Setup">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="neon-rgb-ring relative mb-10 overflow-hidden rounded-3xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#120d1d] to-[#0a0812]" />
            <div
              className="absolute inset-0 opacity-[0.2] pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[var(--color-magenta)]/20 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[var(--color-cyan)]/20 blur-[100px]" />

            <div className="relative z-10 px-8 py-10 sm:px-12">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, ...SPRING }}
                className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-cyan)]"
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] shadow-[0_0_12px_var(--color-cyan)]" />
                {profile ? "Edit your" : "Set up your"}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14, ...SPRING }}
                className="font-display text-3xl font-bold sm:text-4xl"
              >
                <span className="neon-text-gradient">Creator Profile</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, ...SPRING }}
                className="mt-4 max-w-xl text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Add a display name, a little bio, and your direct payment links. Fans discover you on the creators page
                and can send tips your way.
              </motion.p>
            </div>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, ...SPRING }}
              className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 p-6 sm:p-8"
            >
              <div className="mb-8 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Profile details</h2>
                <span className="rounded-full border border-[var(--color-line)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-mute)]">
                  {profile ? "Editing" : "New"}
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--color-mute)]">Display name</label>
                  <input
                    value={form.displayName}
                    onChange={setField("displayName")}
                    placeholder="e.g. Sakura Stroke"
                    className="w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-ink)]/5 px-4 py-3 text-sm text-[var(--color-ink)] focus:border-[var(--color-cyan)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--color-mute)]">Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={setField("bio")}
                    placeholder="A short intro for fans..."
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-[var(--color-line)] bg-[var(--color-ink)]/5 px-4 py-3 text-sm text-[var(--color-ink)] focus:border-[var(--color-cyan)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--color-mute)]">Ko-fi URL</label>
                  <input
                    value={form.kofiUrl}
                    onChange={setField("kofiUrl")}
                    placeholder="https://ko-fi.com/yourname"
                    className="w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-ink)]/5 px-4 py-3 text-sm text-[var(--color-ink)] focus:border-[var(--color-cyan)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--color-mute)]">Buy Me a Coffee URL</label>
                  <input
                    value={form.buymeacoffeeUrl}
                    onChange={setField("buymeacoffeeUrl")}
                    placeholder="https://buymeacoffee.com/yourname"
                    className="w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-ink)]/5 px-4 py-3 text-sm text-[var(--color-ink)] focus:border-[var(--color-cyan)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--color-mute)]">UPI ID</label>
                  <input
                    value={form.upiId}
                    onChange={setField("upiId")}
                    placeholder="yourname@upi"
                    className="w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-ink)]/5 px-4 py-3 text-sm text-[var(--color-ink)] focus:border-[var(--color-cyan)] focus:outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-[var(--color-cyan)] via-[var(--color-magenta)] to-[var(--color-cyan)] bg-[length:200%_100%] px-6 py-3 text-sm font-bold text-black transition-all hover:bg-[position:100%_0] disabled:opacity-60"
                >
                  {saving ? "Saving..." : profile ? "Save Changes" : "Create Profile"}
                </button>
                <Link href="/creators" className="rounded-xl border border-[var(--color-line)] px-6 py-3 text-sm font-bold text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors">
                  Back to Creators
                </Link>
              </div>
            </motion.div>

            <div className="space-y-6">
              <AnimatePresence>
                {saved && (
                  <motion.div
                    initial={{ opacity: 0, y: -12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ ...SPRING }}
                    className="rounded-2xl border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎉</span>
                      <div>
                        <p className="text-sm font-bold text-[var(--color-cyan)]">Profile saved!</p>
                        <p className="text-xs text-[var(--color-mute)]">You are now visible on the creators page.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24, ...SPRING }}
                className="neon-premium rounded-[24px]"
              >
                <div className="neon-premium-track" />
                <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
                <div className="relative p-4">
                  <p className="mb-4 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-mute)]">Live preview</p>
                  <div className="mb-4 flex items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-[var(--color-cyan)]/30">
                      {previewAvatar ? (
                        <Image src={previewAvatar} alt="" fill className="object-cover" sizes="56px" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-cyan)] text-lg font-bold text-black">
                          {initials}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{form.displayName || session?.user?.name || "Your Display Name"}</p>
                      <p className="text-[10px] text-[var(--color-mute)]">@{session?.user?.name || "username"}</p>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-[10px] font-bold text-[var(--color-cyan)]">₹{profile?.totalTips?.toLocaleString() || "0"}</span>
                        <span className="text-[10px] text-[var(--color-mute)]">received · {profile?._count?.tips || 0} tips</span>
                      </div>
                    </div>
                  </div>
                  {form.bio && <p className="mb-4 text-xs text-[var(--color-mute)] line-clamp-2">{form.bio}</p>}
                  <div className="flex flex-wrap gap-1.5">
                    {form.upiId && (
                      <span className="rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-bold text-green-400">UPI: {form.upiId}</span>
                    )}
                    {form.kofiUrl && <span className="rounded-full bg-[var(--color-cyan)]/10 px-3 py-1 text-[10px] font-bold text-[var(--color-cyan)]">Ko-fi</span>}
                    {form.buymeacoffeeUrl && <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-[10px] font-bold text-yellow-400">Buy Me a Coffee</span>}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, ...SPRING }}
                className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/40 p-5"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-mute)] mb-3">Pro tips</p>
                <ul className="space-y-2 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <li>• Add real payment links so tips actually reach you.</li>
                  <li>• A punchy bio gets 3x more tips.</li>
                  <li>• Link your profile to /profile for social reach.</li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
}