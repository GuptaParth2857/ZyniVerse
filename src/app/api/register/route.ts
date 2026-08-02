import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authLimiter } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  const rateCheck = authLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  try {
    const { action, email, username, password, ref } = await req.json();

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
      const code = username.toLowerCase() + Math.random().toString(36).slice(2, 6);
      let referredBy: string | null = null;
      if (ref) {
        const referrer = await prisma.user.findUnique({ where: { referralCode: ref } });
        if (referrer && referrer.id) referredBy = referrer.id;
      }
      const user = await prisma.user.create({
        data: { email, username, password: hashed, referralCode: code, referredBy },
      });
      if (referredBy) {
        await prisma.user.update({ where: { id: referredBy }, data: { referralCount: { increment: 1 } } });
        const rp = await prisma.userPoints.findUnique({ where: { userId: referredBy } });
        if (rp) {
          await prisma.userPoints.update({ where: { userId: referredBy }, data: { points: { increment: 100 } } });
        } else {
          await prisma.userPoints.create({ data: { userId: referredBy, points: 100, level: 1 } });
        }
        await prisma.notification.create({
          data: { userId: referredBy, type: "SYSTEM", title: "New Referral!", body: `${username} joined using your link. You earned 100 XP!`, link: "/earn" },
        });
      }
      await prisma.userPoints.create({ data: { userId: user.id, points: referredBy ? 50 : 0, level: 1 } });
      return NextResponse.json({ id: user.id, email: user.email, username: user.username });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
