"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface FeaturedFeedback {
  id: string;
  type: string;
  message: string;
  featuredHeading: string | null;
  featuredDescription: string | null;
  featuredImage: string | null;
  likeCount: number;
  replyCount: number;
}

export default function FeaturedFeedbackCarousel() {
  const [items, setItems] = useState<FeaturedFeedback[]>([]);

  useEffect(() => {
    fetch("/api/feedback/public?featured=true&limit=5")
      .then((r) => r.json())
      .then((data) => setItems(data.feedbacks || []))
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-amber)]">★ Featured</p>
          <h2 className="font-display text-2xl font-bold mt-1">What People Are Saying</h2>
        </div>
        <Link
          href="/feedback"
          className="text-xs text-[var(--color-cyan)] hover:underline"
        >
          View all →
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {items.map((item) => (
          <div
            key={item.id}
            className="min-w-[280px] max-w-[320px] shrink-0 rounded-xl border border-[var(--color-amber)]/20 bg-[var(--color-panel)] p-5 relative overflow-hidden"
          >
            {item.featuredImage && (
              <div className="absolute inset-0 opacity-10">
                <img src={item.featuredImage} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="relative">
              {item.featuredHeading && (
                <h3 className="font-display text-base font-bold mb-1">{item.featuredHeading}</h3>
              )}
              {item.featuredDescription && (
                <p className="text-xs text-[var(--color-mute)] mb-2 line-clamp-2">{item.featuredDescription}</p>
              )}
              <p className="text-sm line-clamp-3 mb-3">{item.message}</p>
              <div className="flex items-center gap-3 text-[10px] text-[var(--color-mute)]">
                <span>♥ {item.likeCount}</span>
                <span>💬 {item.replyCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
