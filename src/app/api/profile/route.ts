import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        entries: { orderBy: { updatedAt: "desc" } },
        reviews: { include: { user: { select: { username: true } } }, orderBy: { createdAt: "desc" }, take: 20 },
      },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const stats = {
      total: user.entries.length,
      current: user.entries.filter((e) => e.status === "CURRENT").length,
      planning: user.entries.filter((e) => e.status === "PLANNING").length,
      completed: user.entries.filter((e) => e.status === "COMPLETED").length,
      dropped: user.entries.filter((e) => e.status === "DROPPED").length,
      paused: user.entries.filter((e) => e.status === "PAUSED").length,
      episodesWatched: user.entries.reduce((s, e) => s + (e.progress || 0), 0),
    };

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        banner: user.banner,
        themeColor: user.themeColor,
        signature: user.signature,
        bio: user.bio,
        createdAt: user.createdAt,
        entries: user.entries,
        reviews: user.reviews,
      },
      stats,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { banner, themeColor, signature, bio, avatar } = await req.json();
  const data: Record<string, string> = {};
  if (banner !== undefined) data.banner = banner;
  if (themeColor !== undefined) data.themeColor = themeColor;
  if (signature !== undefined) data.signature = signature;
  if (bio !== undefined) data.bio = bio;
  if (avatar !== undefined) data.avatar = avatar;

  const user = await prisma.user.update({ where: { id: session.user.id }, data });
  return NextResponse.json({ user });
}
