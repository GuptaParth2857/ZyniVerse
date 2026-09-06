import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserYearRecap } from "@/lib/recap";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const searchParams = req.nextUrl.searchParams;
  const yearParam = Number(searchParams.get("year"));
  const year = yearParam && yearParam > 2000 && yearParam <= new Date().getFullYear() ? yearParam : new Date().getFullYear();

  try {
    const recap = await getUserYearRecap(session.user.id, year);
    return NextResponse.json(recap);
  } catch (e) {
    console.error("Recap error", e);
    return NextResponse.json({ error: "Could not load recap" }, { status: 500 });
  }
}
