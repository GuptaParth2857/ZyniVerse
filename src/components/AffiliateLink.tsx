"use client";

import { useCallback } from "react";
import { logError } from "@/lib/logger";
import { AMAZON_TAG } from "@/lib/affiliate-config";

interface AffiliateLinkProps {
  partner: string;
  path: string;
  children: React.ReactNode;
  className?: string;
  params?: Record<string, string>;
}

export default function AffiliateLink({ partner, path, children, className, params }: AffiliateLinkProps) {
  const url = new URL(path.startsWith("http") ? path : `https://${path}`);
  url.searchParams.set("ref", "zyniverse");
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  if (partner === "amazon" || partner === "amazon-prime") {
    url.searchParams.set("tag", AMAZON_TAG);
  }

  const handleClick = useCallback(async () => {
    try {
      await fetch("/api/affiliate/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partner, page: window.location.pathname }),
      });
    } catch (e) { logError(e); }
  }, [partner]);

  return (
    <a
      href={url.toString()}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
