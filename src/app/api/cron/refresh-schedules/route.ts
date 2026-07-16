import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

  const routes = [
    "/api/tv-schedule/live",
    "/api/airing/live",
    "/api/v1/schedule",
  ];

  const results: { route: string; status: number; ok: boolean }[] = [];

  for (const route of routes) {
    try {
      const res = await fetch(`${baseUrl}${route}`, {
        headers: { "Authorization": `Bearer ${process.env.CRON_SECRET}` },
        next: { revalidate: 0 },
      });
      results.push({ route, status: res.status, ok: res.ok });
    } catch (error) {
      results.push({ route, status: 500, ok: false });
    }
  }

  return NextResponse.json({
    refreshedAt: new Date().toISOString(),
    results,
  });
}
