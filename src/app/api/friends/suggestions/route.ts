import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFriendSuggestions } from "@/lib/friend-requests";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 12, 30);

  try {
    const suggestions = await getFriendSuggestions(session.user.id, limit);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
