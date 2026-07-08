import Link from "next/link";
import Image from "next/image";

interface CosplayCardProps {
  cosplay: {
    id: string;
    title: string;
    character: string;
    animeTitle: string;
    imageUrl: string;
    likes: number;
    createdAt: string;
    user: { id: string; username: string; avatar: string | null };
  };
  onLike?: () => void;
  liked?: boolean;
}

export default function CosplayCard({ cosplay, onLike, liked }: CosplayCardProps) {
  return (
    <div className="group break-inside-avoid mb-4">
      <Link href={`/cosplay/${cosplay.id}`} className="block">
        <div className="relative overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="relative overflow-hidden bg-[var(--color-void)]">
            {cosplay.imageUrl ? (
              <Image
                src={cosplay.imageUrl}
                alt={cosplay.title}
                width={400}
                height={500}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div className="aspect-[3/4] flex items-center justify-center text-sm text-[var(--color-mute)]">No image</div>
            )}
          </div>
          <div className="p-3 space-y-1">
            <p className="text-sm font-bold truncate">{cosplay.character}</p>
            <p className="text-[11px] text-[var(--color-mute)] truncate">{cosplay.animeTitle}</p>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <div className="relative h-5 w-5 overflow-hidden rounded-full bg-[var(--color-void)] border border-[var(--color-line)]">
                  {cosplay.user.avatar ? (
                    <Image src={cosplay.user.avatar} alt="" fill className="object-cover" sizes="20px" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[8px] font-bold text-[var(--color-mute)]">
                      {cosplay.user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-[var(--color-mute)] truncate">{cosplay.user.username}</span>
              </div>
              <button
                onClick={(e) => { e.preventDefault(); onLike?.(); }}
                className={`flex items-center gap-1 text-xs transition-colors ${liked ? "text-red-400" : "text-[var(--color-mute)] hover:text-red-400"}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {cosplay.likes}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
