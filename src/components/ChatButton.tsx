"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";

interface ChatButtonProps {
  userId: string;
  username: string;
}

export default function ChatButton({ userId, username }: ChatButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!session?.user?.id || session.user.id === userId) return null;

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok && data.conversation) {
        router.push(`/messages?conversation=${data.conversation.id}`);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-lg bg-[var(--color-violet)] px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {loading ? "..." : "Message"}
    </button>
  );
}
