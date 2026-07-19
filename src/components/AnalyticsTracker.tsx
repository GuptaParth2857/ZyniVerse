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

    fetch("/api/analytics/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: id,
        userAgent: navigator.userAgent,
      }),
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
