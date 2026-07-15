import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFigureCollection, addFigure } from "@/lib/figure-collection";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const figures = await getFigureCollection(session.user.id);
  return NextResponse.json({ figures });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const figure = await addFigure(session.user.id, body);
  return NextResponse.json({ figure }, { status: 201 });
}
