import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

interface WatchlistMeta {
  watchlistPublic?: boolean;
}

function parseSignature(raw: string | null): WatchlistMeta {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { signature: true },
  });

  const meta = parseSignature(user?.signature ?? null);
  return NextResponse.json({ isPublic: meta.watchlistPublic ?? false });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { isPublic } = await req.json();

  if (typeof isPublic !== "boolean") {
    return NextResponse.json({ error: "isPublic must be a boolean" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { signature: true },
  });

  const meta = parseSignature(user?.signature ?? null);
  meta.watchlistPublic = isPublic;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { signature: JSON.stringify(meta) },
  });

  return NextResponse.json({ isPublic });
}
