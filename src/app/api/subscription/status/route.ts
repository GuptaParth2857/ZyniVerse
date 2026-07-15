import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ plan: "free" });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    select: { plan: true, status: true },
  });

  if (!subscription || subscription.status !== "active") {
    return NextResponse.json({ plan: "free" });
  }

  return NextResponse.json({ plan: subscription.plan });
}
