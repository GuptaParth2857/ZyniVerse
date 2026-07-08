import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/api-key";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ malId: string }> }) {
  const auth = await verifyApiKey(req);
  if (auth.error) return auth.error;

  const { malId } = await params;
  const malIdNum = Number(malId);
  if (isNaN(malIdNum)) {
    return NextResponse.json({ error: "Invalid MAL ID" }, { status: 400 });
  }

  const dubData = await prisma.dubRequest.findMany({
    where: { mediaId: malIdNum },
    select: { language: true, createdAt: true },
    distinct: ["language"],
  });

  const languages = dubData.map((d) => d.language);
  const totalRequests = dubData.length;

  return NextResponse.json({
    malId: malIdNum,
    available: languages,
    total_dub_requests: totalRequests,
    last_updated: dubData.length > 0 ? dubData[dubData.length - 1].createdAt : null,
  });
}
