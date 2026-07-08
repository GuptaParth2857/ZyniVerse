export default function ForumSignature({ signature }: { signature: string | null }) {
  if (!signature) return null;
  return (
    <div className="mt-4 pt-3 border-t border-white/10">
      <div className="text-xs text-white/40 italic leading-relaxed max-w-xl">
        {signature}
      </div>
    </div>
  );
}
