import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPoll, getPolls } from "@/lib/polls";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const activeOnly = searchParams.get("active") === "true";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const perPage = Math.min(50, Math.max(1, Number(searchParams.get("perPage")) || 20));

  try {
    const result = await getPolls(activeOnly, page, perPage);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch polls" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, options, description, endsAt } = await req.json();
  if (!title || !options || options.length < 2) {
    return NextResponse.json({ error: "Title and at least 2 options required" }, { status: 400 });
  }

  try {
    const poll = await createPoll(session.user.id, title, options, description, endsAt);
    return NextResponse.json({ poll });
  } catch {
    return NextResponse.json({ error: "Failed to create poll" }, { status: 500 });
  }
}
