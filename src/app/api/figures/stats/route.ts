import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFigureStats } from "@/lib/figure-collection";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stats = await getFigureStats(session.user.id);
  return NextResponse.json(stats);
}
