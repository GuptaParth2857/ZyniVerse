import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const runtime = "nodejs";

const MAX_W = 1600;
const DEFAULT_W = 640;
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 800;
const CACHE_CONTROL =
  "public, max-age=31536000, immutable, s-maxage=31536000, stale-while-revalidate=86400";

const cache = new Map<string, { data: ArrayBuffer; expires: number }>();

/** Copies a Buffer into a standalone ArrayBuffer (valid `BodyInit`). */
function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

const EXT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

function guessType(p: string): string {
  const ext = p.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TYPES[ext] ?? "application/octet-stream";
}

/**
 * Only proxies remote images from hosts we control (the R2 public bucket or the
 * Supabase storage project). Anything else is redirected to the original URL so
 * this can't be used as an open image proxy / SSRF vector.
 */
function isAllowedRemote(hostname: string): boolean {
  const h = hostname.toLowerCase();
  for (const base of [process.env.R2_PUBLIC_BASE, process.env.NEXT_PUBLIC_SUPABASE_URL]) {
    if (!base) continue;
    try {
      const bh = new URL(base).hostname.toLowerCase();
      if (h === bh || h.endsWith("." + bh)) return true;
    } catch {
      // ignore malformed env
    }
  }
  return h.endsWith(".supabase.co") || h.endsWith(".r2.dev");
}

/** Loads a file from `public/`, restricted to the uploads directory. */
async function loadLocal(p: string): Promise<Buffer | null> {
  if (!p.startsWith("/uploads/")) return null;
  const root = path.join(process.cwd(), "public", "uploads");
  const full = path.normalize(path.join(process.cwd(), "public", p));
  if (!full.startsWith(root)) return null;
  try {
    return await readFile(full);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");
  if (!raw) return new NextResponse("Bad Request", { status: 400 });

  const wParam = Number.parseInt(req.nextUrl.searchParams.get("w") ?? "", 10);
  const width = Number.isFinite(wParam) ? Math.min(MAX_W, Math.max(16, wParam)) : DEFAULT_W;

  const key = `${width}|${raw}`;
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return new NextResponse(cached.data, {
      headers: { "content-type": "image/webp", "cache-control": CACHE_CONTROL, "x-img-cache": "hit" },
    });
  }

  let buffer: Buffer;
  if (raw.startsWith("/")) {
    const local = await loadLocal(raw);
    if (!local) {
      // Local upload not present on this instance (e.g. serverless) — let the
      // browser fetch the original static asset instead of 404ing.
      return NextResponse.redirect(new URL(raw, req.url), 302);
    }
    buffer = local;
  } else {
    let parsed: URL;
    try {
      parsed = new URL(raw);
    } catch {
      return new NextResponse("Bad Request", { status: 400 });
    }
    if (parsed.protocol !== "https:" || !isAllowedRemote(parsed.hostname)) {
      return NextResponse.redirect(raw, 302);
    }
    try {
      const upstream = await fetch(parsed, {
        headers: { accept: "image/avif,image/webp,image/*,*/*" },
        redirect: "follow",
      });
      if (!upstream.ok) return NextResponse.redirect(raw, 302);
      buffer = Buffer.from(await upstream.arrayBuffer());
    } catch {
      return NextResponse.redirect(raw, 302);
    }
  }

  try {
    const resized = await sharp(buffer, { animated: true })
      .rotate()
      .resize({ width, withoutEnlargement: true, fit: "inside" })
      .webp({ quality: 72 })
      .toBuffer();
    const data = toArrayBuffer(resized);

    cache.set(key, { data, expires: Date.now() + CACHE_TTL });
    if (cache.size > MAX_ENTRIES) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }

    return new NextResponse(data, {
      headers: { "content-type": "image/webp", "cache-control": CACHE_CONTROL, "x-img-cache": "miss" },
    });
  } catch {
    // Unsupported input (e.g. SVG) — serve the original bytes untouched.
    return new NextResponse(toArrayBuffer(buffer), {
      headers: { "content-type": guessType(raw), "cache-control": CACHE_CONTROL },
    });
  }
}
