export default function Loader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20 text-[var(--color-mute)]">
      <div className="relative flex items-center justify-center">
        {/* Outer ring */}
        <div className="absolute h-16 w-16 rounded-full border border-[var(--color-magenta)]/20 animate-[spin_3s_linear_infinite]" />
        <div className="absolute h-12 w-12 rounded-full border border-[var(--color-cyan)]/30 animate-[spin_2s_linear_infinite_reverse]" />
        <div className="absolute h-8 w-8 rounded-full border-t-2 border-[var(--color-magenta)] animate-[spin_1.5s_linear_infinite]" />
        {/* Center dot */}
        <div className="h-2 w-2 rounded-full bg-[var(--color-magenta)] animate-pulse" />
      </div>
      <div className="flex items-center gap-1">
        {label.split("").map((char, i) => (
          <span
            key={i}
            className="font-mono text-xs uppercase tracking-widest"
            style={{ animation: `pulse 1.4s ease-in-out ${i * 0.08}s infinite` }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="aspect-[2/3] bg-white/[0.04]" />
      <div className="h-10 border-t border-white/5" />
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] py-16 text-center">
      <p className="font-display text-lg text-[var(--color-magenta)]">Signal lost</p>
      <p className="max-w-sm text-sm text-[var(--color-mute)]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded-full border border-[var(--color-cyan)] px-4 py-1.5 text-sm text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/10"
        >
          Retry
        </button>
      )}
    </div>
  );
}
