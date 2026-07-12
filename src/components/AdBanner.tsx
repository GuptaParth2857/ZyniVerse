"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { getAdsForLocation, shouldShowAds } from "@/lib/ads";

interface AdBannerProps {
  placement: string;
  type?: "banner" | "sidebar" | "in-content" | "native";
}

export default function AdBanner({ placement, type = "banner" }: AdBannerProps) {
  const { data: session } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const [impressionTracked, setImpressionTracked] = useState(false);

  const user = session?.user
    ? { premium: (session.user as any).premium || false }
    : undefined;

  const showAds = shouldShowAds(user);
  const ads = getAdsForLocation(placement);
  const ad = ads[0];

  if (!showAds || !ad) return null;

  useEffect(() => {
    if (impressionTracked) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetch("/api/admin/ads/stats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "impression",
              placement,
              page: window.location.pathname,
            }),
          }).catch(() => {});
          setImpressionTracked(true);
        }
      },
      { threshold: 0.5 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [impressionTracked, placement]);

  const handleClick = () => {
    fetch("/api/admin/ads/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "click",
        placement,
        page: window.location.pathname,
      }),
    }).catch(() => {});
  };

  return (
    <div
      ref={containerRef}
      className="relative rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden"
      onClick={handleClick}
    >
      <div className="absolute top-0 left-0 right-0 flex items-center justify-center py-1 z-10 pointer-events-none">
        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--color-mute)]">
          Advertisement
        </span>
      </div>
    </div>
  );
}
