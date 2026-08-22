import { NextRequest } from "next/server";
import { isAllowedAvatarHost } from "@/lib/avatar-src";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");
  if (!raw) return new Response("Bad Request", { status: 400 });

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  if (url.protocol !== "https:" || !isAllowedAvatarHost(url.hostname)) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        "user-agent": "ZyniVerse-AvatarProxy/1.0",
        accept: "image/avif,image/webp,image/apng,image/png,image/jpeg,image/gif,*/*",
      },
      redirect: "follow",
    });

    if (!upstream.ok) {
      return new Response(`Upstream error ${upstream.status}`, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    if (!contentType.startsWith("image/")) {
      return new Response("Not an image", { status: 415 });
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control":
          "public, max-age=604800, s-maxage=1209600, stale-while-revalidate=2592000",
        "x-avatar-source": url.origin,
      },
    });
  } catch {
    return new Response("Upstream error", { status: 502 });
  }
}
