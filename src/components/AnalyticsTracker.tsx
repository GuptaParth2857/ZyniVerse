"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

const BATCH_KEY = "analytics_pending_pageviews";
const BATCH_SIZE = 10;
// Backstop flush for long-lived tabs. Unload/hidden flushes are what actually
// guarantee delivery for short visits.
const FLUSH_INTERVAL_MS = 60000;
// Drop queued entries from sessions we never came back to, so localStorage
// can't grow unbounded.
const PENDING_TTL_MS = 6 * 60 * 60 * 1000;

type PendingEntry = { path: string; sessionId: string; referrer: string | null; ts: number };

function getPending(): PendingEntry[] {
  try {
    return JSON.parse(localStorage.getItem(BATCH_KEY) || "[]");
  } catch {
    return [];
  }
}

function addPending(entry: PendingEntry) {
  const pending = getPending();
  pending.push(entry);
  localStorage.setItem(BATCH_KEY, JSON.stringify(pending));
}

function postEntries(payload: { batch: PendingEntry[]; sessionId: string }) {
  const body = JSON.stringify(payload);
  // sendBeacon is the only delivery method browsers reliably complete while a
  // page is being unloaded. A plain fetch() (even with keepalive) is often
  // cancelled here, which silently dropped most page views.
  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon("/api/analytics/pageview", blob)) return;
    }
  } catch {
    /* fall through to fetch */
  }
  fetch("/api/analytics/pageview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

function flushPending(sessionId: string) {
  const pending = getPending();
  if (pending.length === 0) return;

  const entries = pending.filter((e) => e.sessionId === sessionId);
  const now = Date.now();
  const kept = pending.filter((e) => e.sessionId !== sessionId && now - e.ts < PENDING_TTL_MS);

  if (kept.length > 0) localStorage.setItem(BATCH_KEY, JSON.stringify(kept));
  else localStorage.removeItem(BATCH_KEY);

  if (entries.length === 0) return;
  postEntries({ batch: entries, sessionId });
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const viewCount = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let id = sessionStorage.getItem("analytics_session_id");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("analytics_session_id", id);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessionId(id);

    const ua = navigator.userAgent;
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua);
    const device = /iPad|Tablet/i.test(ua) ? "Tablet" : isMobile ? "Mobile" : "Desktop";
    let browser = "Unknown";
    if (/Edg\//.test(ua)) browser = "Edge";
    else if (/OPR\/|Opera/.test(ua)) browser = "Opera";
    else if (/Chrome\//.test(ua)) browser = "Chrome";
    else if (/Safari\//.test(ua)) browser = "Safari";
    else if (/Firefox\//.test(ua)) browser = "Firefox";
    let os = "Unknown";
    if (/Windows/.test(ua)) os = "Windows";
    else if (/Mac OS X|Macintosh/.test(ua)) os = "macOS";
    else if (/Android/.test(ua)) os = "Android";
    else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
    else if (/Linux/.test(ua)) os = "Linux";

    fetch("/api/analytics/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: id, device, browser, os }),
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !sessionId) return;

    addPending({ path: pathname, sessionId, referrer: document.referrer || null, ts: Date.now() });
    viewCount.current++;

    if (viewCount.current >= BATCH_SIZE) {
      viewCount.current = 0;
      flushPending(sessionId);
    }
  }, [pathname, sessionId]);

  useEffect(() => {
    if (typeof window === "undefined" || !sessionId) return;

    const interval = setInterval(() => {
      if (!document.hidden) flushPending(sessionId);
    }, FLUSH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [sessionId]);

  useEffect(() => {
    if (typeof window === "undefined" || !sessionId) return;

    // visibilitychange(hidden) and pagehide fire far more reliably than
    // beforeunload, especially on mobile Safari / bfcache navigations.
    const flush = () => flushPending(sessionId);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };

    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [sessionId]);

  return null;
}
