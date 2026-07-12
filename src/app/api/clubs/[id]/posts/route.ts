import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const [posts, total] = await Promise.all([
    prisma.clubPost.findMany({
      where: { clubId: id },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    }),
    prisma.clubPost.count({ where: { clubId: id } }),
  ]);

  return NextResponse.json({ posts, total, page, limit });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId: id, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const { title, content } = await req.json();
  if (!title || !content) return NextResponse.json({ error: "Title and content required" }, { status: 400 });

  const post = await prisma.clubPost.create({
    data: {
      clubId: id,
      userId: session.user.id,
      title: title.trim(),
      content: content.trim(),
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });

  const club = await prisma.club.findUnique({ where: { id }, select: { name: true, slug: true } });
  if (club) {
    const members = await prisma.clubMember.findMany({
      where: { clubId: id, userId: { not: session.user.id } },
      select: { userId: true },
    });

    if (members.length > 0) {
      await prisma.notification.createMany({
        data: members.map((m) => ({
          userId: m.userId,
          type: "CLUB",
          title: `New Post in ${club.name}`,
          body: `"${title}" was posted in "${club.name}"`,
          link: `/clubs/${club.slug}`,
        })),
      });
    }
  }

  return NextResponse.json({ post }, { status: 201 });
}
