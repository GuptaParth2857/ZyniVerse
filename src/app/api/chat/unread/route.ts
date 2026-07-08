import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getUnreadTotal } from "@/lib/chat";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ count: 0 });

  const count = await getUnreadTotal(session.user.id);
  return NextResponse.json({ count });
}
