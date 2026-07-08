import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkAndAwardAchievement } from "@/lib/achievements";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { event, data } = await req.json();
  if (!event) return NextResponse.json({ error: "Missing event" }, { status: 400 });

  const awarded = await checkAndAwardAchievement(session.user.id, event, data);
  return NextResponse.json({ awarded: !!awarded, achievement: awarded });
}
