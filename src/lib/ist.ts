// IST (Asia/Kolkata, UTC+5:30, no DST) date/time helpers.
//
// AniList and most upstream airing data ship Unix timestamps in UTC. ZyniVerse
// is India-first, so schedule surfaces must render and group by IST no matter
// where the visitor — or a crawler rendering in UTC — happens to be.
//
// Every helper works in "IST wall-clock" space: the instant is shifted by the
// offset so the Date UTC getters read IST values directly.

export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** IST wall-clock ms for an instant (shift so the UTC getters read IST values). */
export function toIstWallMs(ms: number): number {
  return ms + IST_OFFSET_MS;
}

/** Sunday 00:00 IST of the requested week, returned as a real UTC timestamp. */
export function startOfWeekIST(offsetWeeks = 0): number {
  const istMidnight = Math.floor(toIstWallMs(Date.now()) / DAY_MS) * DAY_MS;
  const weekday = new Date(istMidnight).getUTCDay(); // 0 = Sunday
  return istMidnight - weekday * DAY_MS + offsetWeeks * 7 * DAY_MS - IST_OFFSET_MS;
}

/** Day-of-week index (0 = Sunday) in IST for a Unix timestamp (seconds). */
export function istDayIndex(ts: number): number {
  return new Date(toIstWallMs(ts * 1000)).getUTCDay();
}

/** "18 Oct" for an IST wall-clock ms value. */
export function formatIstDate(istWallMs: number): string {
  const d = new Date(istWallMs);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

/** "9:30 PM" (or "9:30 PM IST" with `suffix`) for a Unix timestamp (seconds). */
export function formatISTTime(ts: number, opts: { suffix?: boolean } = {}): string {
  const ist = new Date(toIstWallMs(ts * 1000));
  let hour = ist.getUTCHours();
  const minute = String(ist.getUTCMinutes()).padStart(2, "0");
  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${suffix}${opts.suffix ? " IST" : ""}`;
}
