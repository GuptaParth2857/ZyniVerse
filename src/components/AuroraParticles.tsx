"use client";

import { useEffect, useRef } from "react";

/**
 * Canvas aurora embers: slow-drifting glowing particles (cyan/magenta/violet)
 * that softly twinkle. Positioned absolutely inside a relative parent.
 * Skipped for reduced-motion users and tiny screens.
 */
export default function AuroraParticles({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < 640) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const COLORS = ["34,211,238", "232,121,249", "217,70,239", "255,255,255"];

    type P = {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      c: string;
      tw: number;
      ph: number;
    };

    let parts: P[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      w = rect?.width || window.innerWidth;
      h = rect?.height || window.innerHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(50, Math.max(14, Math.floor((w * h) / 26000)));
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.8 + Math.random() * 2.2,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(0.1 + Math.random() * 0.32),
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        tw: 0.4 + Math.random() * 1.4,
        ph: Math.random() * Math.PI * 2,
      }));
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const t = performance.now() / 1000;
      for (const p of parts) {
        p.x += p.vx + Math.sin(t * 0.6 + p.ph) * 0.14;
        p.y += p.vy;
        if (p.y < -12) {
          p.y = h + 12;
          p.x = Math.random() * w;
        }
        if (p.x < -12) p.x = w + 12;
        if (p.x > w + 12) p.x = -12;
        const alpha = 0.18 + Math.abs(Math.sin(t * p.tw + p.ph)) * 0.45;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.c},${alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${p.c},0.8)`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      raf = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
    />
  );
}