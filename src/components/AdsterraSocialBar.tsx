"use client";

import { useEffect, useRef } from "react";

const SOCIAL_BAR_URL = "https://pl30333407.effectivecpmnetwork.com/79/88/46/798846c18dea1cf9f50c54e73acf1380.js";

export default function AdsterraSocialBar() {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;

    let interacted = false;

    function onInteraction() {
      if (interacted || loaded.current) return;
      interacted = true;

      setTimeout(() => {
        if (loaded.current) return;
        loaded.current = true;

        const container = document.createElement("div");
        container.id = "adsterra-social-bar";
        container.style.position = "fixed";
        container.style.bottom = "0";
        container.style.left = "0";
        container.style.right = "0";
        container.style.zIndex = "9999";
        container.style.pointerEvents = "auto";
        document.body.appendChild(container);

        const script = document.createElement("script");
        script.src = SOCIAL_BAR_URL;
        script.async = true;
        container.appendChild(script);

        document.removeEventListener("scroll", onInteraction, true);
        document.removeEventListener("click", onInteraction, true);
        document.removeEventListener("touchstart", onInteraction, true);
      }, 3000);
    }

    document.addEventListener("scroll", onInteraction, { capture: true, passive: true });
    document.addEventListener("click", onInteraction, { capture: true, passive: true });
    document.addEventListener("touchstart", onInteraction, { capture: true, passive: true });

    return () => {
      document.removeEventListener("scroll", onInteraction, true);
      document.removeEventListener("click", onInteraction, true);
      document.removeEventListener("touchstart", onInteraction, true);
    };
  }, []);

  return null;
}
