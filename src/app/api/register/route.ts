import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authLimiter } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  const rateCheck = authLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  try {
    const { action, email, username, password } = await req.json();

    if (action === "register") {
      if (!email || !username || !password) {
        return NextResponse.json({ error: "All fields required" }, { status: 400 });
      }
      const existing = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });
      if (existing) {
        return NextResponse.json({ error: "Email or username already taken" }, { status: 409 });
      }
      const bcrypt = await import("bcryptjs");
      const hashed = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { email, username, password: hashed },
      });
      await prisma.userPoints.create({ data: { userId: user.id, points: 0, level: 1 } });
      return NextResponse.json({ id: user.id, email: user.email, username: user.username });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
