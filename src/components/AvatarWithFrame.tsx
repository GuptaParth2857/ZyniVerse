"use client";

import Image from "next/image";

interface AvatarWithFrameProps {
  avatar: string | null;
  frameImageUrl: string | null;
  size?: number;
  username?: string;
}

export default function AvatarWithFrame({ avatar, frameImageUrl, size = 64, username }: AvatarWithFrameProps) {
  const dim = size;
  const innerSize = frameImageUrl ? size * 0.78 : size;

  return (
    <div className="relative" style={{ width: dim, height: dim }}>
      <div
        className="absolute rounded-full overflow-hidden"
        style={{ width: innerSize, height: innerSize, left: (dim - innerSize) / 2, top: (dim - innerSize) / 2 }}
      >
        {avatar ? (
          <Image src={avatar} alt="" fill className="object-cover" sizes={`${dim}px`} />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-cyan)] font-bold text-black"
            style={{ fontSize: dim * 0.35 }}
          >
            {username ? username.charAt(0).toUpperCase() : "?"}
          </div>
        )}
      </div>
      {frameImageUrl && (
        <div className="absolute inset-0 pointer-events-none">
          <Image src={frameImageUrl} alt="" fill className="object-contain" sizes={`${dim}px`} />
        </div>
      )}
    </div>
  );
}
