"use client";

import { useState, useEffect } from "react";

interface DubNotification {
  id: string;
  malId: number;
  language: string;
  active: boolean;
}

export default function DubNotifyButton({ malId, language, animeTitle }: { malId: number; language: string; animeTitle: string }) {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/dub-notifications")
      .then((r) => r.json())
      .then((data) => {
        const match = data.notifications?.find((n: DubNotification) => n.malId === malId && n.language === language);
        setSubscribed(!!match);
      })
      .catch(() => {});
  }, [malId, language]);

  async function toggle() {
    setLoading(true);
    try {
      if (subscribed) {
        await fetch("/api/dub-notifications", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ malId, language }),
        });
        setSubscribed(false);
      } else {
        await fetch("/api/dub-notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ malId, language }),
        });
        setSubscribed(true);
      }
    } catch {}
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="rounded-lg border px-3 py-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
      style={{
        borderColor: subscribed ? "rgba(0,255,127,0.4)" : "rgba(255,255,255,0.1)",
        background: subscribed ? "rgba(0,255,127,0.1)" : "rgba(255,255,255,0.05)",
        color: subscribed ? "#00ff7f" : "#888",
      }}
      title={subscribed ? `Unsubscribe from ${language} dub alerts` : `Get notified when ${language} dub drops for ${animeTitle}`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill={subscribed ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="inline mr-1 -mt-0.5">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {subscribed ? "Subscribed" : "Notify Me"}
    </button>
  );
}
