import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAwardsForYear, createAwardCycle } from "@/lib/zyni-awards";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  const { year: yearStr } = await params;
  const year = Number(yearStr);
  if (!year) return NextResponse.json({ error: "Invalid year" }, { status: 400 });

  const awards = await getAwardsForYear(year);
  return NextResponse.json({ year, awards });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.email !== "admin@zyverse.in") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { year: yearStr } = await params;
  const year = Number(yearStr);
  if (!year) return NextResponse.json({ error: "Invalid year" }, { status: 400 });

  const { action } = await req.json();

  if (action === "init") {
    await createAwardCycle(year);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
