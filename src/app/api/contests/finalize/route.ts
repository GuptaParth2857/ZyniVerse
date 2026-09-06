import { requireAdmin } from "@/lib/admin";
import { finalizeContests } from "@/lib/contests-finalize";
import { NextResponse } from "next/server";

// Admin-triggered (or cron) endpoint to finalize any expired contests.
export async function POST() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const finalized = await finalizeContests();
  return NextResponse.json({ finalized });
}