import Link from "next/link";

/**
 * Renders caption text with real links:
 *   #tag   -> /search?q=tag   (search page)
 *   @user  -> /creators/user  (creator profile)
 * Plain leaf component: safe to use in both server and client trees.
 */
const TOKEN_RE = /(#[\p{L}\p{N}_]+|@[\p{L}\p{N}_]+)/gu;

export default function RichCaption({ text }: { text: string }) {
  const parts = text.split(TOKEN_RE);
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.startsWith("#")) {
          const tag = part.slice(1);
          return (
            <Link
              key={i}
              href={`/search?q=${encodeURIComponent(tag)}`}
              className="font-semibold text-pink-300 underline decoration-pink-400/40 underline-offset-2 transition hover:text-pink-200 hover:decoration-pink-300"
            >
              {part}
            </Link>
          );
        }
        if (part.startsWith("@")) {
          const name = part.slice(1);
          return (
            <Link
              key={i}
              href={`/creators/${encodeURIComponent(name)}`}
              className="font-semibold text-cyan-300 underline decoration-cyan-400/40 underline-offset-2 transition hover:text-cyan-200 hover:decoration-cyan-300"
            >
              {part}
            </Link>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
