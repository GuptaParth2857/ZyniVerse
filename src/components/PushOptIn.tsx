"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { logError } from "@/lib/logger";

type OptInState = "loading" | "unsupported" | "denied" | "default" | "subscribed" | "error";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

export default function PushOptIn() {
  const { data: session } = useSession();
  const [state, setState] = useState<OptInState>("loading");

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (!session?.user?.id) return;
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        if (!cancelled) setState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        if (!cancelled) setState("denied");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (!cancelled) setState(sub && Notification.permission === "granted" ? "subscribed" : "default");
      } catch (e) {
        logError(e);
        if (!cancelled) setState("unsupported");
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [session]);

  const subscribe = useCallback(async () => {
    setState("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission === "denied") {
        setState("denied");
        return;
      }
      const res = await fetch("/api/push/key");
      if (!res.ok) throw new Error("key unavailable");
      const { key } = await res.json();

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(key),
        });
      }
      const json = sub.toJSON();
      const save = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint, keys: json.keys, userAgent: navigator.userAgent }),
      });
      if (!save.ok) throw new Error("subscribe failed");
      setState("subscribed");
      await fetch("/api/push/test", { method: "POST" }).catch(() => {});
    } catch (e) {
      logError(e);
      setState("error");
    }
  }, []);

  if (!session?.user?.id) return null;
  if (state !== "default" && state !== "error") return null;

  return (
    <button
      onClick={subscribe}
      className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-[var(--color-amber)] border-t border-[var(--color-line)] hover:bg-white/5 transition-colors"
    >
      <span>🔔</span>
      {state === "error" ? "Retry enabling notifications" : "Enable push notifications"}
    </button>
  );
}
