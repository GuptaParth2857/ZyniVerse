import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { resolveUserId } from "@/lib/resolve-user";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const imports = await prisma.listImport.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ imports });
}