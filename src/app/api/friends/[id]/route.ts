import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { respondToRequest, removeFriend } from "@/lib/friend-requests";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { action } = await req.json();

  try {
    const result = await respondToRequest(id, session.user.id, action === "accept");
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await removeFriend(session.user.id, id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
