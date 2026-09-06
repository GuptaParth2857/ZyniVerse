"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { getAiringSchedule, type AiringScheduleEntry } from "@/lib/anilist";

interface UpcomingEpisode {
  title: string;
  episode: number;
  airDate: string;
  mediaId: number;
}

export default function CalendarSyncButtons() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [upcoming, setUpcoming] = useState<UpcomingEpisode[]>([]);
  const [icalUrl, setIcalUrl] = useState("");

  useEffect(() => {
    if (!session?.user?.id) return;
    const baseUrl = window.location.origin;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIcalUrl(`${baseUrl}/api/calendar/ical?userId=${session.user.id}`);

    const now = Math.floor(Date.now() / 1000);
    const threeMonths = now + 90 * 24 * 60 * 60;

    getAiringSchedule(now, threeMonths)
      .then((items) => {
        const episodes: UpcomingEpisode[] = (items || [])
          .slice(0, 5)
          .map((item: AiringScheduleEntry) => ({
            title: item.media?.title?.english || item.media?.title?.romaji || "Unknown",
            episode: item.episode || 1,
            airDate: item.airingAt ? new Date(item.airingAt * 1000).toISOString() : new Date().toISOString(),
            mediaId: item.media?.id || 0,
          }));
        setUpcoming(episodes);
      })
      .catch(() => {});
  }, [session?.user?.id]);

  const handleDownload = () => {
    if (!icalUrl) return;
    window.open(icalUrl, "_blank");
  };

  const handleGoogle = () => {
    if (!icalUrl) return;
    const googleUrl = `https://calendar.google.com/calendar/r/ical/${encodeURIComponent(icalUrl)}`;
    window.open(googleUrl, "_blank");
  };

  const handleApple = () => {
    if (!icalUrl) return;
    const link = document.createElement("a");
    link.href = icalUrl;
    link.download = "zyniverse_watchlist.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    if (!icalUrl) return;
    try {
      await navigator.clipboard.writeText(icalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = icalUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!session?.user?.id) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium border border-[var(--color-line)] bg-[var(--color-panel)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-all"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Sync Calendar
        <svg className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl overflow-hidden"
          >
            <div className="p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-mute)] mb-3">
                Sync Options
              </p>

              <div className="space-y-1.5">
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-white/5 transition-colors group"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/15 text-green-400 group-hover:bg-green-500/25 transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">Download .ics</p>
                    <p className="text-[10px] text-[var(--color-mute)]">Import into any calendar app</p>
                  </div>
                </button>

                <button
                  onClick={handleGoogle}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-white/5 transition-colors group"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400 group-hover:bg-blue-500/25 transition-colors">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">Add to Google Calendar</p>
                    <p className="text-[10px] text-[var(--color-mute)]">Sync with your Google account</p>
                  </div>
                </button>

                <button
                  onClick={handleApple}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-white/5 transition-colors group"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400 group-hover:bg-purple-500/25 transition-colors">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">Add to Apple Calendar</p>
                    <p className="text-[10px] text-[var(--color-mute)]">Opens in Calendar app</p>
                  </div>
                </button>

                <button
                  onClick={handleCopy}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-white/5 transition-colors group"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-cyan)]/15 text-[var(--color-cyan)] group-hover:bg-[var(--color-cyan)]/25 transition-colors">
                    {copied ? (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </span>
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">{copied ? "Copied!" : "Copy Calendar URL"}</p>
                    <p className="text-[10px] text-[var(--color-mute)]">Subscribe for auto-sync</p>
                  </div>
                </button>
              </div>
            </div>

            {upcoming.length > 0 && (
              <div className="border-t border-[var(--color-line)] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-mute)] mb-2">
                  Upcoming Episodes
                </p>
                <div className="space-y-1.5">
                  {upcoming.map((ep, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-[var(--color-void)] px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[var(--color-ink)] truncate">{ep.title}</p>
                        <p className="text-[10px] text-[var(--color-mute)]">Episode {ep.episode}</p>
                      </div>
                      <span className="ml-2 shrink-0 text-[10px] text-[var(--color-cyan)]">
                        {new Date(ep.airDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
