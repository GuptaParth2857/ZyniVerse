import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const userId = session.user.id;

  const body = (await req.json().catch(() => ({}))) as { confirm?: string };
  if (body.confirm !== "DELETE") {
    return NextResponse.json({ error: "Type DELETE to confirm account deletion." }, { status: 400 });
  }

  // Clean up push subscriptions + active auth sessions explicitly before deleting the user
  // to avoid leftover webhook/push attempts and stale session rows.
  try {
    await prisma.pushSubscription.deleteMany({ where: { userId } });
    await prisma.userSession.deleteMany({ where: { userId } });
  } catch { /* ignore */ }

  try {
    await prisma.user.delete({ where: { id: userId } });
  } catch (e) {
    console.error("Account deletion failed", e);
    return NextResponse.json(
      { error: "Could not delete account. Please contact support." },
      { status: 500 }
    );
  }

  return NextResponse.json({ deleted: true });
}
