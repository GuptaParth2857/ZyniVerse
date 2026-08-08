"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const [sessionId, setSessionId] = useState<string | null>(null);

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

    fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        sessionId,
        referrer: document.referrer || null,
      }),
    }).catch(() => {});
  }, [pathname, sessionId]);

  useEffect(() => {
    if (typeof window === "undefined" || !sessionId) return;

    const interval = setInterval(() => {
      fetch("/api/analytics/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }).catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, [sessionId]);

  useEffect(() => {
    if (typeof window === "undefined" || !sessionId) return;

    const handleUnload = () => {
      navigator.sendBeacon(
        "/api/analytics/heartbeat",
        new Blob(
          [JSON.stringify({ sessionId })],
          { type: "application/json" }
        )
      );
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [sessionId]);

  return null;
}
