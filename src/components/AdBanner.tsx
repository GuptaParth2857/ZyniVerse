"use client";

import { useState, useEffect, useRef, useId } from "react";
import { useSession } from "next-auth/react";
import { getAdsForLocation, shouldShowAds } from "@/lib/ads";

interface AdBannerProps {
  placement: string;
  type?: "banner" | "sidebar" | "in-content" | "native" | "socialbar";
  className?: string;
}

/**
 * Renders an Adsterra iframe-sync ad inside a sandboxed iframe.
 * The ad scripts are injected into srcdoc so they execute in isolation.
 */
function IframeSyncAd({
  code,
  width,
  height,
}: {
  code: string;
  width: number;
  height: number;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      background: transparent;
    }
  </style>
</head>
<body>${code}</body>
</html>`;
    iframe.srcdoc = doc;
  }, [code, width, height]);

  return (
    <iframe
      ref={iframeRef}
      width={width}
      height={height}
      style={{ border: "none", overflow: "hidden", maxWidth: "100%" }}
      scrolling="no"
      title="Advertisement"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
    />
  );
}

/**
 * Renders an Adsterra native-async ad by injecting the script tag into the DOM.
 */
function NativeAsyncAd({ containerId }: { containerId: string }) {
  const divRef = useRef<HTMLDivElement>(null);
  const injectedRef = useRef(false);

  useEffect(() => {
    if (injectedRef.current || !divRef.current) return;
    injectedRef.current = true;

    // Create the container div that Adsterra targets
    const container = document.createElement("div");
    container.id = containerId;
    divRef.current.appendChild(container);

    // Inject the async script
    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = `https://formssternlystately.com/188115be46209eff2403f0d29b32d940/invoke.js`;
    divRef.current.appendChild(script);
  }, [containerId]);

  return <div ref={divRef} className="w-full" />;
}

export default function AdBanner({
  placement,
  type = "banner",
  className = "",
}: AdBannerProps) {
  const { data: session } = useSession();
  const [impressionTracked, setImpressionTracked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useId();
  // Make a DOM-safe container id (no colons)
  const containerId = `container-188115be46209eff2403f0d29b32d940-${uniqueId.replace(/:/g, "")}`;

  const user = session?.user
    ? { premium: (session.user as any).premium || false }
    : undefined;

  const showAds = shouldShowAds(user);

  // Track impressions
  useEffect(() => {
    if (!showAds || impressionTracked) return;
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
  }, [showAds, impressionTracked, placement]);

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

  // ── Premium users: show ad-free badge ─────────────────────────────────
  if (!showAds) {
    return (
      <div className={`flex items-center justify-center rounded-xl border border-[var(--color-line)] bg-gradient-to-r from-[var(--color-magenta)]/5 to-[var(--color-violet)]/5 py-3 px-4 ${className}`}>
        <span className="text-xs font-semibold text-[var(--color-magenta)] tracking-wide">
          ⭐ Ad-Free (Premium)
        </span>
      </div>
    );
  }

  const ads = getAdsForLocation(placement);
  const ad = ads[0];

  // ── No ad configured for this placement ───────────────────────────────
  if (!ad) {
    return null;
  }

  // ── Native async ad ───────────────────────────────────────────────────
  if (ad.renderMode === "native-async") {
    return (
      <div
        ref={containerRef}
        onClick={handleClick}
        className={`relative w-full overflow-hidden rounded-xl ${className}`}
      >
        <AdLabel />
        <NativeAsyncAd containerId={containerId} />
      </div>
    );
  }

  // ── iframe-sync ad (728×90 leaderboard or 300×250 rectangle) ──────────
  const w = ad.dimensions?.width ?? 728;
  const h = ad.dimensions?.height ?? 90;

  // Responsive: on mobile always show the 300×250 if available
  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={`relative flex flex-col items-center overflow-hidden rounded-xl border border-[var(--color-line)]/40 bg-[var(--color-panel)]/60 backdrop-blur-sm py-2 ${className}`}
      style={{ minHeight: h + 16 }}
    >
      <AdLabel />
      <div className="pt-1">
        <IframeSyncAd code={ad.code} width={w} height={h} />
      </div>
    </div>
  );
}

function AdLabel() {
  return (
    <span className="block text-center text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--color-mute)] pb-1 select-none pointer-events-none">
      Advertisement
    </span>
  );
}
