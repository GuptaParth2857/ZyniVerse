// Metadata for /manga lives in ./page.tsx (a pass-through layout avoids the
// duplicate title/description that previously rendered here *and* there).
export default function MangaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
