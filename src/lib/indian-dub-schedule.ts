export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export interface DubSlot {
  day: string;
  hour: number;
  minute: number;
}

const DAY_RE = /(?:every\s+)?(mon|tues|wednes|thurs|fri|satur|sun)days?/i;
const TIME_RE = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;

const DAY_PREFIX: Record<string, string> = {
  mon: "Monday",
  tues: "Tuesday",
  wednes: "Wednesday",
  thurs: "Thursday",
  fri: "Friday",
  satur: "Saturday",
  sun: "Sunday",
};

const IST_OFFSET_MS = 5.5 * 3600 * 1000;

export function parseDubSlot(schedule: string): DubSlot | null {
  const d = schedule.match(DAY_RE);
  const t = schedule.match(TIME_RE);
  if (!t) return null;
  let hour = parseInt(t[1], 10);
  const minute = parseInt(t[2], 10);
  const ap = t[3].toUpperCase();
  if (ap === "PM" && hour !== 12) hour += 12;
  if (ap === "AM" && hour === 12) hour = 0;
  const day = d ? DAY_PREFIX[d[1].toLowerCase()] : "";
  return { day, hour, minute };
}

export function weekIdx(day: string): number {
  const i = WEEKDAYS.indexOf(day as (typeof WEEKDAYS)[number]);
  return i; // Monday = 0 ... Sunday = 6
}

export function isKnownDay(day: string): boolean {
  return (WEEKDAYS as readonly string[]).includes(day);
}

export function nextAiringAt(schedule: string): number | null {
  const slot = parseDubSlot(schedule);
  if (!slot || !isKnownDay(slot.day)) return null;

  const now = Date.now();
  const istMs = now + IST_OFFSET_MS;
  const ist = new Date(istMs);
  // First millisecond of the current IST day (UTC midnight of the IST wall clock date)
  const dayMs = Math.floor(istMs / 86400000) * 86400000;

  const targetIdx = weekIdx(slot.day); // Monday-based
  const todayIdx = (ist.getUTCDay() + 6) % 7; // Monday-based
  let ahead = targetIdx - todayIdx;
  if (ahead < 0) ahead += 7;
  if (ahead === 0) {
    const alreadyPast =
      slot.hour * 3600000 + slot.minute * 60000 <
      (istMs - dayMs);
    if (alreadyPast) ahead = 7;
  }

  const targetIST = dayMs + ahead * 86400000 + slot.hour * 3600000 + slot.minute * 60000;
  return targetIST - IST_OFFSET_MS;
}

export function todayIndexInIST(): number {
  const ist = new Date(Date.now() + IST_OFFSET_MS);
  return (ist.getUTCDay() + 6) % 7;
}

export function formatIST(ts: number): string {
  const ist = new Date(ts + IST_OFFSET_MS);
  const day = WEEKDAYS[(ist.getUTCDay() + 6) % 7].slice(0, 3);
  const h24 = ist.getUTCHours();
  const hour12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const minutes = String(ist.getUTCMinutes()).padStart(2, "0");
  const ap = h24 < 12 ? "AM" : "PM";
  return `${day}, ${ist.getUTCDate()} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][ist.getUTCMonth()]} · ${hour12}:${minutes} ${ap} IST`;
}

export function firstNumber(text: string): number {
  const m = text.match(/\d+(?:\.\d+)?/);
  return m ? Math.floor(parseFloat(m[0])) : 0;
}