"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { shouldShowAds } from "@/lib/ads";

/**
 * Adsterra Social Bar — a floating sticky widget that appears on all pages.
 * It's an ANTI-ADBLOCK script so it runs directly in the page (not sandboxed).
 * Only injected once per page, only for non-premium users.
 */
export default function SocialBarAd() {
  const { data: session } = useSession();
  const injectedRef = useRef(false);

  const user = session?.user
    ? { premium: (session.user as any).premium || false }
    : undefined;

  const showAds = shouldShowAds(user);

  useEffect(() => {
    // Wait until we know the premium status (session loaded)
    if (session === undefined) return; // still loading
    if (!showAds) return;             // premium user
    if (injectedRef.current) return;  // already injected
    injectedRef.current = true;

    const script = document.createElement("script");
    script.src =
      "https://formssternlystately.com/79/88/46/798846c18dea1cf9f50c54e73acf1380.js";
    script.type = "text/javascript";
    document.head.appendChild(script);

    return () => {
      // Don't remove on unmount — Social Bar is a global widget
    };
  }, [showAds, session]);

  // This component renders nothing visible itself
  return null;
}
