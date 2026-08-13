"use client";

import { useEffect, useMemo, useState } from "react";
import { CITIES, nearestCity, bookingLinks, SEAT_CLASSES, type City, type Theater } from "@/lib/theaters";
import SeatMap from "./SeatMap";

interface TheaterBookingModalProps {
  movieTitle: string;
  onClose: () => void;
}

export default function TheaterBookingModal({ movieTitle, onClose }: TheaterBookingModalProps) {
  const [cityId, setCityId] = useState<string>(CITIES[0].id);
  const [locating, setLocating] = useState(false);
  const [locMsg, setLocMsg] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const city = useMemo(() => CITIES.find((c) => c.id === cityId) ?? CITIES[0], [cityId]);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function useMyLocation() {
    setLocating(true);
    setLocMsg(null);
    if (!("geolocation" in navigator)) {
      setLocMsg("Geolocation unsupported — city manually choose karo.");
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const near = nearestCity(pos.coords.latitude, pos.coords.longitude);
        setCityId(near.id);
        setLocMsg(`Location detected → ${near.name}, ${near.state}`);
        setLocating(false);
      },
      (err) => {
        setLocMsg(err.code === 1 ? "Location permission denied — city manually choose karo." : "Location fetch fail hui — city choose karo.");
        setLocating(false);
      },
      { timeout: 8000, maximumAge: 600000 }
    );
  }

  const links = bookingLinks(movieTitle);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-void)] shadow-[0_0_60px_rgba(138,92,255,0.25)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[var(--color-line)] p-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-cyan)]">Book Tickets</p>
            <h2 className="mt-1 font-display text-xl font-bold text-[var(--color-ink)]">{movieTitle}</h2>
            <p className="mt-0.5 text-xs text-[var(--color-mute)]">
              Nearby theaters + direct booking links — India
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg border border-[var(--color-line)] p-1.5 text-[var(--color-mute)] transition-colors hover:border-red-400/50 hover:text-red-400"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="max-h-[calc(90vh-120px)] overflow-y-auto p-5">
          {/* City selector */}
          <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto]">
            <div className="neon-input">
              <label className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)]">Choose City</label>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="w-full rounded-xl bg-[var(--color-void)] px-3 py-2.5 text-sm text-[var(--color-ink)] outline-none"
              >
                {CITIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} · {c.state}</option>
                ))}
              </select>
            </div>
            <button
              onClick={useMyLocation}
              disabled={locating}
              className="mt-auto rounded-xl border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-4 py-2.5 text-xs font-bold text-[var(--color-cyan)] transition-all hover:bg-[var(--color-cyan)]/20 disabled:opacity-50"
            >
              {locating ? "Locating…" : "📍 Use my location"}
            </button>
          </div>
          {locMsg && <p className="mb-3 text-xs text-[var(--color-cyan)]">{locMsg}</p>}

          {/* Nearby theaters */}
          <div className="mb-5">
            <h3 className="mb-2 text-sm font-bold text-[var(--color-ink)]">
              Theaters in {city.name}
              <span className="ml-2 font-mono text-[10px] font-normal text-[var(--color-mute)]">{city.theaters.length} found</span>
            </h3>
            <div className="space-y-2">
              {city.theaters.map((t: Theater) => (
                <TheaterRow
                  key={t.id}
                  theater={t}
                  movieTitle={movieTitle}
                  expanded={expanded === t.id}
                  selected={selected === t.id}
                  onToggle={() => {
                    setExpanded(expanded === t.id ? null : t.id);
                    setSelected(selected === t.id ? null : t.id);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Booking platforms */}
          <div>
            <h3 className="mb-2 text-sm font-bold text-[var(--color-ink)]">Book directly</h3>
            <div className="grid gap-2 sm:grid-cols-3">
              {links.map((l) => (
                <a
                  key={l.id}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-3 text-center text-xs font-bold text-[var(--color-ink)] transition-all hover:border-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/5"
                >
                  {l.name}
                  <span className="block font-mono text-[9px] font-normal text-[var(--color-mute)]">Open ↗</span>
                </a>
              ))}
            </div>
            <p className="mt-3 text-[10px] leading-relaxed text-[var(--color-mute)]/80">
              BookMyShow link movie search kholta hai — city & showtime wahan select karo. PVR/District links booking platform ke pages hain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TheaterRow({
  theater,
  movieTitle,
  expanded,
  selected,
  onToggle,
}: {
  theater: Theater;
  movieTitle: string;
  expanded: boolean;
  selected: boolean;
  onToggle: () => void;
}) {
  const classes = theater.classes.filter((c) => c !== "WHEELCHAIR").map((c) => SEAT_CLASSES[c].label);
  return (
    <div className={`rounded-2xl border transition-all ${selected ? "border-[var(--color-cyan)]/50 bg-[var(--color-cyan)]/5" : "border-[var(--color-line)] bg-[var(--color-panel)]/50"}`}>
      <button onClick={onToggle} className="flex w-full items-center gap-3 p-3.5 text-left">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-cyan)] text-sm font-black text-black">
          {theater.chain.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[var(--color-ink)]">{theater.name}</p>
          <p className="truncate text-xs text-[var(--color-mute)]">
            {theater.chain} · {theater.area} · {theater.screens} screens
          </p>
          <p className="mt-0.5 truncate text-[10px] text-[var(--color-mute)]/80">{classes.join(" · ")}</p>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`shrink-0 text-[var(--color-mute)] transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-[var(--color-line)] p-4">
          <SeatMap classes={theater.classes} />
          <a
            href={theater.bookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block rounded-xl bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-cyan)] px-4 py-2.5 text-center text-xs font-bold text-black transition-all hover:opacity-90"
          >
            Book at {theater.name} — {movieTitle} ↗
          </a>
        </div>
      )}
    </div>
  );
}
