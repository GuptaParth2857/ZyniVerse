"use client";

import { useEffect } from "react";

/**
 * Keeps every animation design intact while removing the main-thread cost of
 * infinite CSS animations:
 *
 *  1. Pauses infinite CSS animations on elements that are off screen
 *     (resumes the instant they scroll into view — same idea as the existing
 *     `#participant-grid` rule).
 *  2. "Sleeps" all infinite animations after the page has been idle for a few
 *     seconds; any interaction (scroll, pointer, touch, key) wakes them.
 *  3. Pauses everything while the tab is hidden.
 *
 * Uses Element.getAnimations() (also covers ::before/::after), so every
 * infinite keyframe animation is managed regardless of how it was defined.
 * One-shot entrance animations (framer-motion whileInView etc.) are untouched.
 */
export default function AnimationPauser() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (document.visibilityState === "hidden") return;

    const animations = new Map<Element, Animation[]>();
    const visibleState = new WeakMap<Element, boolean>();
    let io: IntersectionObserver | null = null;
    let sleeping = false;
    let idleTimer: number | undefined;
    let waking = false;
    let disposed = false;

    const isInfinite = (a: Animation): boolean => {
      try {
        const timing = (a.effect as KeyframeEffect | null)?.getComputedTiming?.();
        return !!timing && timing.iterations === Infinity;
      } catch {
        return false;
      }
    };

    const play = (a: Animation) => {
      try {
        if (a.playState === "paused") a.play();
      } catch {
        /* noop */
      }
    };

    const pause = (a: Animation) => {
      try {
        if (a.playState === "running") a.pause();
      } catch {
        /* noop */
      }
    };

    const applyAwake = () => {
      animations.forEach((anims, el) => {
        const vis = visibleState.get(el) ?? false;
        anims.forEach((a) => (vis ? play(a) : pause(a)));
      });
    };

    const applySleep = () => {
      animations.forEach((anims) => anims.forEach(pause));
    };

    const scheduleIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        if (disposed || document.hidden) return;
        sleeping = true;
        applySleep();
      }, 8000);
    };

    const wake = () => {
      if (disposed || document.hidden) return;
      if (waking) return;
      waking = true;
      requestAnimationFrame(() => {
        waking = false;
        if (sleeping) {
          sleeping = false;
          applyAwake();
        }
        scheduleIdle();
      });
    };

    const scan = () => {
      if (disposed) return;
      animations.forEach((anims) => anims.forEach(play));
      animations.clear();
      if (io) {
        io.disconnect();
        io = null;
      }

      io = new IntersectionObserver(
        (entries) => {
          if (sleeping) return;
          for (const entry of entries) {
            visibleState.set(entry.target, entry.isIntersecting);
            const anims = animations.get(entry.target);
            if (!anims) continue;
            anims.forEach((a) => (entry.isIntersecting ? play(a) : pause(a)));
          }
        },
        { rootMargin: "140px 0px" }
      );

      const all = document.querySelectorAll("*");
      const viewport = window.innerHeight;
      for (const el of all) {
        let anims: Animation[] | null = null;
        try {
          anims = el.getAnimations({ subtree: false });
        } catch {
          continue;
        }
        if (!anims || anims.length === 0) continue;
        const infinite = anims.filter(isInfinite);
        if (infinite.length === 0) continue;
        animations.set(el, infinite);
        let near = false;
        try {
          const r = el.getBoundingClientRect();
          near = r.top < viewport + 140 && r.bottom > -140;
        } catch {
          near = false;
        }
        visibleState.set(el, near);
        io.observe(el);
      }

      if (sleeping) applySleep();
      else applyAwake();
    };

    const scanSoon = () => {
      if (disposed) return;
      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(() => scan(), { timeout: 1400 });
      } else {
        setTimeout(scan, 300);
      }
    };

    const onVisChange = () => {
      if (document.hidden) {
        sleeping = true;
        applySleep();
      } else {
        sleeping = false;
        applyAwake();
        scheduleIdle();
        scanSoon();
      }
    };

    const onLoad = () => scanSoon();

    const passive = { passive: true } as AddEventListenerOptions;
    ["pointerdown", "keydown", "wheel", "touchstart", "scroll"].forEach((evt) =>
      window.addEventListener(evt, wake, passive)
    );

    document.addEventListener("visibilitychange", onVisChange);
    window.addEventListener("load", onLoad);

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        scan();
        scheduleIdle();
      })
    );

    return () => {
      disposed = true;
      if (idleTimer) clearTimeout(idleTimer);
      ["pointerdown", "keydown", "wheel", "touchstart", "scroll"].forEach((evt) =>
        window.removeEventListener(evt, wake)
      );
      document.removeEventListener("visibilitychange", onVisChange);
      window.removeEventListener("load", onLoad);
      if (io) io.disconnect();
      animations.forEach((anims) => anims.forEach(play));
    };
  }, []);

  return null;
}