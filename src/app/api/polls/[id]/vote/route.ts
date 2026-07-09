import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { votePoll } from "@/lib/polls";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { optionId } = await req.json();
  if (!optionId) {
    return NextResponse.json({ error: "optionId required" }, { status: 400 });
  }

  try {
    const poll = await votePoll(id, optionId, session.user.id);
    return NextResponse.json({ poll });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to vote" }, { status: 500 });
  }
}
