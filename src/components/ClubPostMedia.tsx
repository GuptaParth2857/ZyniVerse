"use client";

export default function ClubPostMedia({
  image,
  videoUrl,
  thumbnailUrl,
}: {
  image?: string | null;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
}) {
  if (!image && !videoUrl) return null;

  return (
    <div className="mt-3 space-y-3">
      {videoUrl && (
        <video
          src={videoUrl}
          poster={thumbnailUrl || undefined}
          controls
          playsInline
          preload="metadata"
          className="max-h-96 w-full rounded-xl border border-white/10 bg-black"
        />
      )}
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="max-h-96 w-full rounded-xl border border-white/10 object-cover" />
      )}
    </div>
  );
}
