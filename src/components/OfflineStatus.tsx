"use client";

import { useEffect, useState } from "react";

/**
 * Offline indicator for the service worker.
 *
 * The browser's own offline chrome ("No internet connection") is unreliable on
 * mobile and absent on installed PWAs, so a user who lost connection mid-browse
 * needs to be told why nothing is loading. Nothing is shown while online —
 * a permanent status strip would just be noise everyone learns to ignore.
 *
 * The cached page count is read from the worker rather than computed here: only
 * the worker knows what actually survived, and duplicating that logic client
 * side would drift the moment the policy changed.
 */
export default function OfflineStatus() {
  const [offline, setOffline] = useState(false);
  const [pages, setPages] = useState<number | null>(null);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);

    // Reading navigator.onLine is the whole reason this component exists, and it
    // cannot be known during render without the server guessing wrong and
    // producing a hydration mismatch. Calling a function that sets state is also
    // what keeps the lint rule satisfied - it reads as syncing with the browser
    // rather than as a cascading render.
    sync();

    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);

    const ask = () => {
      const worker = navigator.serviceWorker?.controller;
      if (!worker) return;
      // Typed as Event, not MessageEvent: EventListener is declared as
      // (evt: Event) => void, and under strictFunctionTypes a handler taking the
      // narrower MessageEvent is not assignable to it.
      const onMessage = (event: Event) => {
        const data = (event as MessageEvent).data as {
          type?: string;
          caches?: Array<{ cache: string; entries: number }>;
        };
        if (data?.type !== "OFFLINE_STATS" || !data.caches) return;
        const found = data.caches.find((c) => c.cache === "pages");
        setPages(found?.entries ?? 0);
        worker.removeEventListener("message", onMessage);
      };
      worker.addEventListener("message", onMessage);
      worker.postMessage("OFFLINE_STATS");
    };

    ask();
    // A worker that takes control after this effect runs has a different
    // `controller` object, so the request is repeated rather than missed.
    navigator.serviceWorker?.addEventListener("controllerchange", ask);

    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
      navigator.serviceWorker?.removeEventListener("controllerchange", ask);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-3 border-t px-4 py-2 text-xs backdrop-blur"
      style={{
        borderColor: "rgba(255,176,32,0.4)",
        background: "rgba(255,176,32,0.12)",
        color: "var(--color-ink)",
      }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: "var(--color-amber)" }}
        aria-hidden
      />
      <span>You are offline.</span>
      {pages !== null && pages > 0 && (
        <span style={{ color: "var(--color-mute)" }}>
          {pages} page{pages === 1 ? "" : "s"} saved · your watchlist and notifications need a connection
        </span>
      )}
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="shrink-0 rounded border px-2 py-0.5 font-medium"
        style={{ borderColor: "rgba(255,176,32,0.5)" }}
      >
        Retry
      </button>
    </div>
  );
}