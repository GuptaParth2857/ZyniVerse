"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // Dev: unregister any stale SW from a previous production run so it can't
      // serve old cached bundles while editing. Also purge origin caches.
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister());
      });
      if (window.caches) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // When a new SW is waiting, activate it right away and reload once
        // so users land on the fresh deploy instead of a stale mix.
        if (reg.waiting && navigator.serviceWorker.controller) {
          reg.waiting.postMessage("SKIP_WAITING");
        }
        reg.addEventListener("updatefound", () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener("statechange", () => {
            if (nw.state === "installed" && navigator.serviceWorker.controller) {
              nw.postMessage("SKIP_WAITING");
            }
          });
        });
        let reloaded = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (reloaded) return;
          reloaded = true;
          window.location.reload();
        });
      })
      .catch((err) => {
        console.error("SW registration failed:", err);
      });
  }, []);

  return null;
}
