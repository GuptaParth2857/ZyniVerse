"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { getAdsForLocation, shouldShowAds } from "@/lib/ads";

interface AdBannerProps {
  placement: string;
  type?: "banner" | "sidebar" | "in-content" | "native";
}

function injectAdInSandbox(container: HTMLDivElement, code: string, dimensions?: { width: number; height: number }) {
  const w = dimensions?.width || 300;
  const h = dimensions?.height || 250;

  const iframe = document.createElement("iframe");
  iframe.width = String(w);
  iframe.height = String(h);
  iframe.style.border = "none";
  iframe.style.overflow = "hidden";
  iframe.style.maxWidth = "100%";
  iframe.scrolling = "no";
  iframe.title = "Advertisement";
  iframe.setAttribute("sandbox", "allow-forms allow-scripts");
  iframe.srcdoc = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;overflow:hidden;width:${w}px;height:${h}px;">${code}</body></html>`;
  container.appendChild(iframe);
}

export default function AdBanner({ placement, type = "banner" }: AdBannerProps) {
  const { data: session } = useSession();
  const [adBlocked, setAdBlocked] = useState(false);
  const [impressionTracked, setImpressionTracked] = useState(false);
  const [injected, setInjected] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const adSlotRef = useRef<HTMLDivElement>(null);

  const user = session?.user
    ? { premium: (session.user as any).premium || false }
    : undefined;

  const showAds = shouldShowAds(user);

  useEffect(() => {
    setAdBlocked(false);
  }, [showAds]);

  useEffect(() => {
    if (!showAds || adBlocked || !adSlotRef.current || injected) return;
    const ads = getAdsForLocation(placement);
    const ad = ads[0];
    if (ad && ad.network === "adsterra") {
      injectAdInSandbox(adSlotRef.current, ad.code, ad.dimensions);
      setInjected(true);
    }
  }, [showAds, adBlocked, placement, injected]);

  useEffect(() => {
    if (!showAds || adBlocked || impressionTracked) return;
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
  }, [showAds, adBlocked, impressionTracked, placement]);

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

  if (!showAds) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-[var(--color-line)] bg-gradient-to-r from-[var(--color-magenta)]/5 to-[var(--color-violet)]/5 py-3 px-4">
        <span className="text-xs font-semibold text-[var(--color-magenta)] tracking-wide">
          ⭐ Ad-Free (Premium)
        </span>
      </div>
    );
  }

  if (adBlocked) {
    return (
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-center">
        <p className="text-xs font-mono uppercase tracking-wider text-[var(--color-mute)]">Advertisement</p>
        <p className="mt-2 text-sm text-[var(--color-cyan)] font-semibold">
          Support ZyniVerse —{" "}
          <a href="/premium" className="underline hover:text-[var(--color-magenta)] transition-colors">
            Go Premium
          </a>
        </p>
      </div>
    );
  }

  const ads = getAdsForLocation(placement);
  const ad = ads[0];

  const sizeClasses: Record<string, string> = {
    banner: "min-h-[90px]",
    sidebar: "min-h-[250px]",
    "in-content": "min-h-[90px]",
    native: "min-h-[250px]",
  };

  return (
    <div
      ref={containerRef}
      className={`relative rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden ${sizeClasses[type] || "min-h-[90px]"}`}
      onClick={handleClick}
    >
      <div className="absolute top-0 left-0 right-0 flex items-center justify-center py-1 z-10 pointer-events-none">
        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--color-mute)]">
          Advertisement
        </span>
      </div>
      <div className="flex h-full min-h-[inherit] items-center justify-center pt-5 pb-3 px-4">
        {ad ? (
          <div ref={adSlotRef} className="w-full h-full flex items-center justify-center" />
        ) : (
          <div className="text-center">
            <p className="text-xs text-[var(--color-mute)]">Your ad here — Support ZyniVerse</p>
            <p className="text-[10px] text-[var(--color-mute)]/50 mt-1">
              Ad network integration coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
