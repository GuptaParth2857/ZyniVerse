"use client";

import { useEffect } from "react";
import { logError } from "@/lib/logger";

/**
 * Counts a view when someone lands on a reel's share/SEO page.
 *
 * Before this, only the feed's autoplay reported views, so every shared link
 * and search-engine visit left the counter untouched even though a real person
 * watched the reel.
 */
export default function ReelViewReporter({ reelId }: { reelId: string }) {
  useEffect(() => {
    // Short dwell first so bounces and instant back-clicks don't count.
    const timer = setTimeout(() => {
      fetch(`/api/reels/${reelId}/view`, {
        method: "POST",
        // Keep the request alive if the visitor navigates away right after.
        keepalive: true,
      }).catch((e) => logError(e));
    }, 1200);
    return () => clearTimeout(timer);
  }, [reelId]);

  return null;
}
