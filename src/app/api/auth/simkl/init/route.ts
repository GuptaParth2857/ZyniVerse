import { NextResponse } from "next/server";
import { resolveUserId } from "@/lib/resolve-user";
import { simklAuthUrl, simklConfigured } from "@/lib/simkl-client";

export async function GET() {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!simklConfigured()) return NextResponse.json({ error: "Simkl not configured" }, { status: 500 });
  return NextResponse.json({ url: simklAuthUrl() });
}