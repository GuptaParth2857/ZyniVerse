"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { logError } from "@/lib/logger";

interface AddFriendButtonProps {
  userId: string;
  username: string;
  className?: string;
  onChange?: () => void;
}

type FriendStatus =
  | { status: "self" }
  | { status: "none" }
  | { status: "pending-sent"; requestId: string }
  | { status: "pending-received"; requestId: string; senderName?: string | null }
  | { status: "friends" };

export default function AddFriendButton({ userId, username, className = "", onChange }: AddFriendButtonProps) {
  const { data: session } = useSession();
  const [status, setStatus] = useState<FriendStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/friends/status?userId=${userId}`);
      const data = await res.json();
      setStatus(data.status ? data : { status: "none" });
    } catch (e) {
      setStatus({ status: "none" });
      logError(e);
    }
  }, [userId]);

  useEffect(() => {
    if (session?.user?.id && session.user.id !== userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchStatus();
    } else {
      setStatus({ status: "self" });
    }
  }, [session, userId, fetchStatus]);

  if (!session?.user?.id || session.user.id === userId) return null;
  if (!status) return null;

  async function sendRequest() {
    setLoading(true);
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: userId }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(data.status === "accepted" ? { status: "friends" } : { status: "pending-sent", requestId: "" });
        onChange?.();
      }
    } catch (e) { logError(e); }
    setLoading(false);
  }

  async function respond(action: "accept" | "reject") {
    if (status?.status !== "pending-received") return;
    setLoading(true);
    try {
      const res = await fetch(`/api/friends/${status.requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setStatus(action === "accept" ? { status: "friends" } : { status: "none" });
        onChange?.();
      }
    } catch (e) { logError(e); }
    setLoading(false);
  }

  async function remove() {
    setLoading(true);
    try {
      const res = await fetch(`/api/friends/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setStatus({ status: "none" });
        onChange?.();
      }
    } catch (e) { logError(e); }
    setLoading(false);
  }

  async function cancelRequest() {
    setLoading(true);
    try {
      const res = await fetch(`/api/friends/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setStatus({ status: "none" });
        onChange?.();
      }
    } catch (e) { logError(e); }
    setLoading(false);
  }

  const base = `inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`;

  if (status.status === "friends") {
    return (
      <button
        onClick={() => {
          if (confirming) {
            setConfirming(false);
            remove();
          } else {
            setConfirming(true);
            setTimeout(() => setConfirming(false), 3000);
          }
        }}
        disabled={loading}
        title="Remove friend"
        className={`${base} border border-[var(--color-line)] text-[var(--color-mute)] hover:border-red-400 hover:text-red-400`}
      >
        {loading ? "..." : confirming ? "Confirm?" : "Friends ✓"}
      </button>
    );
  }

  if (status.status === "pending-sent") {
    return (
      <button
        onClick={cancelRequest}
        disabled={loading}
        title="Cancel friend request"
        className={`${base} border border-[var(--color-line)] text-[var(--color-mute)] hover:border-red-400 hover:text-red-400`}
      >
        {loading ? "..." : "Requested · Cancel"}
      </button>
    );
  }

  if (status.status === "pending-received") {
    return (
      <div className="inline-flex items-center gap-1.5">
        <button
          onClick={() => respond("accept")}
          disabled={loading}
          className={`${base} bg-[var(--color-cyan)] text-black hover:opacity-90`}
        >
          {loading ? "..." : "Accept"}
        </button>
        <button
          onClick={() => respond("reject")}
          disabled={loading}
          className={`${base} border border-[var(--color-line)] text-[var(--color-mute)] hover:text-red-400`}
        >
          Decline
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={sendRequest}
      disabled={loading}
      className={`${base} border border-[var(--color-line)] text-[var(--color-ink)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]`}
    >
      {loading ? "..." : `Add Friend · ${username}`}
    </button>
  );
}
