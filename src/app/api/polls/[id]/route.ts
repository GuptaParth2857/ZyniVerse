import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPollById, deletePoll } from "@/lib/polls";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const { id } = await params;
  const userId = session?.user?.id;

  try {
    const poll = await getPollById(id, userId);
    if (!poll) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ poll });
  } catch {
    return NextResponse.json({ error: "Failed to fetch poll" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await deletePoll(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete poll" }, { status: 500 });
  }
}
