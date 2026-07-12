import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkActivityAchievements } from "@/lib/achievements";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ awarded: [] });

  const awarded = await checkActivityAchievements(session.user.id);
  return NextResponse.json({ awarded });
}
