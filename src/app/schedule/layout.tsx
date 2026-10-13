// Metadata for /schedule lives in `page.tsx` (the richer, canonical copy).
// This layout is intentionally a pass-through so the two files can't drift
// into conflicting titles/descriptions again.
export default function ScheduleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
