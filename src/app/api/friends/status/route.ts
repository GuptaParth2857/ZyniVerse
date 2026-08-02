import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFriendStatus } from "@/lib/friend-requests";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  try {
    const status = await getFriendStatus(session.user.id, userId);
    return NextResponse.json(status);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
