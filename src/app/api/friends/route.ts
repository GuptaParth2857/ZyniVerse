import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendFriendRequest, getPendingRequests, getFriends } from "@/lib/friend-requests";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "friends";

  try {
    if (type === "pending") {
      const requests = await getPendingRequests(session.user.id);
      return NextResponse.json({ requests });
    }
    const friends = await getFriends(session.user.id);
    return NextResponse.json({ friends });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { receiverId } = await req.json();
  if (!receiverId) {
    return NextResponse.json({ error: "receiverId required" }, { status: 400 });
  }

  try {
    const result = await sendFriendRequest(session.user.id, receiverId);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 400 });
  }
}
