"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

const BATCH_KEY = "analytics_pending_pageviews";
const BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 900000;

function getPending(): Array<{ path: string; sessionId: string; referrer: string | null; ts: number }> {
  try {
    return JSON.parse(localStorage.getItem(BATCH_KEY) || "[]");
  } catch {
    return [];
  }
}

function addPending(entry: { path: string; sessionId: string; referrer: string | null; ts: number }) {
  const pending = getPending();
  pending.push(entry);
  localStorage.setItem(BATCH_KEY, JSON.stringify(pending));
}

function flushPending(sessionId: string) {
  const pending = getPending();
  if (pending.length === 0) return;
  localStorage.removeItem(BATCH_KEY);

  const entries = pending.filter((e) => e.sessionId === sessionId);
  if (entries.length === 0) return;

  fetch("/api/analytics/pageview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ batch: entries, sessionId }),
  }).catch(() => {});
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

    const handleUnload = () => {
      flushPending(sessionId);
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [sessionId]);

  return null;
}
