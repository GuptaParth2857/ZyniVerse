/**
 * Builds a URL for the on-demand image resize route (`/api/img`).
 *
 * `next.config.ts` sets `images.unoptimized: true` site-wide, so `next/image`
 * serves the original upload (cosplay uploads can be several MB). This helper
 * points gallery thumbnails at `/api/img`, which downscales + re-encodes to
 * WebP. Unknown/remote sources the route can't handle are redirected back to
 * the original URL, so this is always safe to call.
 */
export function imgThumb(url: string | null | undefined, width: number): string {
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  // Already a thumb (or a proxied avatar) — leave untouched.
  if (url.startsWith("/api/img?") || url.startsWith("/api/avatar?")) return url;
  return `/api/img?url=${encodeURIComponent(url)}&w=${width}`;
}
