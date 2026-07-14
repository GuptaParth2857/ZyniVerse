"use client";

import { useEffect, useRef, useId } from "react";
import { useSession } from "next-auth/react";
import { shouldShowAds } from "@/lib/ads";

/**
 * Adsterra Native Banner Ad.
 * Renders the native ad grid (4 images by default) between content sections.
 * Best placed: between major sections on high-traffic pages.
 */
export default function NativeBannerAd({ className = "" }: { className?: string }) {
  const { data: session, status } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const injectedRef = useRef(false);
  const uniqueId = useId().replace(/:/g, "");
  const containerId = `adsterra-native-${uniqueId}`;

  const user = session?.user
    ? { premium: (session.user as any).premium || false }
    : undefined;

  const showAds = shouldShowAds(user);

  useEffect(() => {
    // Wait until session is resolved
    if (status === "loading") return;
    if (!showAds) return;
    if (injectedRef.current || !containerRef.current) return;
    injectedRef.current = true;

    // Create the container div Adsterra targets
    const div = document.createElement("div");
    div.id = "container-188115be46209eff2403f0d29b32d940";
    containerRef.current.appendChild(div);

    // Inject the async script
    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src =
      "https://formssternlystately.com/188115be46209eff2403f0d29b32d940/invoke.js";
    containerRef.current.appendChild(script);
  }, [showAds, status]);

  // Don't render anything for premium users
  if (status !== "loading" && !showAds) return null;

  return (
    <div className={`w-full overflow-hidden rounded-xl ${className}`}>
      <span className="block text-center text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--color-mute)] py-1 select-none">
        Advertisement
      </span>
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
