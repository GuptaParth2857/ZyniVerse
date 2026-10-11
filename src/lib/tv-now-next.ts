import type { TimeSlot } from "./tv-channels";

export interface NowNext {
  /** The slot currently airing (null if nothing is airing right now). */
  now: TimeSlot | null;
  /** The next slot that will start, if any. */
  next: TimeSlot | null;
  /** Minutes remaining on the current slot. */
  nowEndsInMinutes: number | null;
  /** Minutes until the next slot starts. */
  nextInMinutes: number | null;
}

export function timeToMinutes(t: string): number {
  const [h = 0, m = 0] = t.split(":").map(Number);
  return h * 60 + m;
}

function isWithin(start: number, end: number, now: number): boolean {
  if (start === end) return false; // 00:00–00:00 = 24/7 stream, never a boundary slot
  if (start > end) return now >= start || now < end; // overnight slot
  return now >= start && now < end;
}

/**
 * Pure now/next computation for a single day's slot list.
 *
 * - Handles overnight slots (e.g. 22:00 → 06:00) natively.
 * - `now` is the airing slot; `next` is its immediate successor (the slot
 *   starting at/after the current one ends, or the first future slot when
 *   nothing is airing).
 * - Durations wrap past midnight so the countdown is always positive.
 */
export function computeNowNext(slots: TimeSlot[], nowMinutes: number): NowNext {
  if (!slots.length) {
    return { now: null, next: null, nowEndsInMinutes: null, nextInMinutes: null };
  }

  const sorted = [...slots].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

  const now = sorted.find((s) => isWithin(timeToMinutes(s.start), timeToMinutes(s.end), nowMinutes)) || null;

  let next: TimeSlot | null = null;
  if (now) {
    const nowStart = timeToMinutes(now.start);
    const nowEnd = timeToMinutes(now.end);
    const endsToday = nowEnd > nowStart; // non-overnight current program
    next =
      sorted.find((s) => {
        const st = timeToMinutes(s.start);
        if (s === now) return false;
        // Overnight current program: successor is whatever starts after "now".
        if (!endsToday) return st > nowMinutes;
        // Normal program: the next one starts when this one ends.
        return st >= nowEnd;
      }) || null;
  } else {
    next = sorted.find((s) => timeToMinutes(s.start) > nowMinutes) || null;
  }

  const nowEndsInMinutes = now
    ? (timeToMinutes(now.end) - nowMinutes + 1440) % 1440
    : null;
  const nextInMinutes = next
    ? (() => {
        const diff = timeToMinutes(next.start) - nowMinutes;
        return diff > 0 ? diff : diff + 1440;
      })()
    : null;

  return { now, next, nowEndsInMinutes, nextInMinutes };
}

/** Convenience: compute now/next against the current local time. */
export function computeNowNextNow(slots: TimeSlot[], now = new Date()): NowNext {
  return computeNowNext(slots, now.getHours() * 60 + now.getMinutes());
}