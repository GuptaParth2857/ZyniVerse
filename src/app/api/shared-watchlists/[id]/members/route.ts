import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

async function getMemberRole(watchlistId: string, userId: string) {
  const member = await prisma.sharedWatchlistMember.findUnique({
    where: { watchlistId_userId: { watchlistId, userId } },
  });
  return member?.role || null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getMemberRole(id, session.user.id);
  if (!role || (role !== "owner" && role !== "editor")) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const { userId, role: newRole } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const watchlist = await prisma.sharedWatchlist.findUnique({ where: { id } });
  if (!watchlist) return NextResponse.json({ error: "Watchlist not found" }, { status: 404 });

  const validRole = ["editor", "viewer"].includes(newRole) ? newRole : "viewer";

  const member = await prisma.sharedWatchlistMember.upsert({
    where: { watchlistId_userId: { watchlistId: id, userId } },
    update: { role: validRole },
    create: { watchlistId: id, userId, role: validRole },
    include: { user: { select: { id: true, username: true, avatar: true } } },
  });

  return NextResponse.json({ member });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const callerRole = await getMemberRole(id, session.user.id);
  if (!callerRole || (callerRole !== "owner" && callerRole !== "editor")) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  if (userId === session.user.id && callerRole === "owner") {
    return NextResponse.json({ error: "Owner cannot remove themselves" }, { status: 400 });
  }

  const targetRole = await getMemberRole(id, userId);
  if (targetRole === "owner") {
    return NextResponse.json({ error: "Cannot remove owner" }, { status: 403 });
  }
  if (callerRole === "editor" && targetRole === "editor") {
    return NextResponse.json({ error: "Editors cannot remove other editors" }, { status: 403 });
  }

  await prisma.sharedWatchlistMember.deleteMany({
    where: { watchlistId: id, userId },
  });

  return NextResponse.json({ success: true });
}
