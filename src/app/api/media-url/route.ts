import { NextRequest, NextResponse } from "next/server";
import { extractMediaUrl } from "@/lib/extractors";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Only allow http/https
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json(
        { error: "Only HTTP/HTTPS URLs allowed" },
        { status: 400 }
      );
    }

    const result = await extractMediaUrl(url);

    if (!result.sources || result.sources.length === 0) {
      return NextResponse.json(
        { error: "No video sources found on this page" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      sources: result.sources,
      tracks: result.tracks || [],
      embedUrl: result.embedUrl || null,
      source: result.source,
    });
  } catch (err) {
    console.error("[MediaURL] Extraction failed:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to extract video URL",
      },
      { status: 500 }
    );
  }
}
