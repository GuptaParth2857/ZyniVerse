import { NextResponse } from "next/server";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.YOUTUBE_API_KEY;
  return NextResponse.json({
    hasKey: typeof key === "string" && key.length > 0,
    len: typeof key === "string" ? key.length : -1,
    prefix: typeof key === "string" ? key.slice(0, 4) : "",
  });
}
