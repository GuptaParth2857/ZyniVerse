"use client";

import WhatsAppShare from "@/components/WhatsAppShare";

export function PostShareRow({ title, postId }: { title: string; postId: string }) {
  const base = typeof window !== "undefined" ? window.location.origin : "https://zyverse.in";
  return (
    <div className="mt-4 flex items-center gap-3">
      <WhatsAppShare
        url={`${base}/posts/${postId}`}
        text={`Check this on ZyniVerse: ${title}`}
        variant="pill"
      />
    </div>
  );
}