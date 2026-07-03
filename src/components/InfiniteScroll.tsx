"use client";

import { useRef, useEffect } from "react";

export default function InfiniteScroll({ onLoadMore, hasMore, loading }: {
  onLoadMore: () => void; hasMore: boolean; loading: boolean;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) onLoadMore();
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  return <div ref={sentinelRef} className="h-4" />;
}
