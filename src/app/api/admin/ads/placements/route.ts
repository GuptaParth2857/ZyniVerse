import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

function invalidateConfig() {
  revalidatePath("/api/ads/config");
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await prisma.adConfig.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json({ placements: rows });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { id, type, network, code, location, isActive, width, height, renderMode } = body;
  if (!id || !type || !network || !code || !location) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const placement = await prisma.adConfig.upsert({
    where: { id },
    update: {
      type,
      network,
      code,
      location,
      isActive: isActive ?? true,
      width: width ?? null,
      height: height ?? null,
      renderMode: renderMode ?? null,
    },
    create: {
      id,
      type,
      network,
      code,
      location,
      isActive: isActive ?? true,
      width: width ?? null,
      height: height ?? null,
      renderMode: renderMode ?? null,
    },
  });
  invalidateConfig();
  return NextResponse.json({ placement });
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { id, type, network, code, location, isActive, width, height, renderMode } = body;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const data: Prisma.AdConfigUpdateInput = {};
  if (typeof type === "string") data.type = type;
  if (typeof network === "string") data.network = network;
  if (typeof code === "string") data.code = code;
  if (typeof location === "string") data.location = location;
  if (typeof isActive === "boolean") data.isActive = isActive;
  if (typeof width === "number") data.width = width;
  if (typeof height === "number") data.height = height;
  if (typeof renderMode === "string") data.renderMode = renderMode;

  const placement = await prisma.adConfig.update({ where: { id }, data });
  invalidateConfig();
  return NextResponse.json({ placement });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  await prisma.adConfig.delete({ where: { id } });
  invalidateConfig();
  return NextResponse.json({ success: true });
}
