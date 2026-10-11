import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { invalidateEditorial, type EditorialKind } from "@/lib/editorial";

export const dynamic = "force-dynamic";

const KINDS: EditorialKind[] = ["dubbed", "theatrical"];

function parseKind(value: unknown): EditorialKind | null {
  return typeof value === "string" && (KINDS as string[]).includes(value)
    ? (value as EditorialKind)
    : null;
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const kind = parseKind(searchParams.get("kind"));

  const entries = await prisma.editorialEntry.findMany({
    where: kind ? { kind } : {},
    orderBy: [{ kind: "asc" }, { sortOrder: "asc" }],
    take: 500,
  });
  return NextResponse.json({ entries, total: entries.length });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const kind = parseKind(body?.kind);
  if (!kind || !body?.slug || !body?.title || body?.data == null) {
    return NextResponse.json(
      { error: "kind, slug, title and data are required" },
      { status: 400 }
    );
  }

  const entry = await prisma.editorialEntry.upsert({
    where: { kind_slug: { kind, slug: String(body.slug) } },
    update: {
      title: String(body.title),
      data: body.data,
      sortOrder: Number(body.sortOrder) || 0,
      isPublished: body.isPublished ?? true,
    },
    create: {
      kind,
      slug: String(body.slug),
      title: String(body.title),
      data: body.data,
      sortOrder: Number(body.sortOrder) || 0,
      isPublished: body.isPublished ?? true,
    },
  });
  invalidateEditorial(kind);
  return NextResponse.json({ entry });
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

  const existing = await prisma.editorialEntry.findUnique({ where: { id } });
  await prisma.editorialEntry.delete({ where: { id } });
  if (existing) invalidateEditorial(existing.kind as EditorialKind);
  return NextResponse.json({ success: true });
}
