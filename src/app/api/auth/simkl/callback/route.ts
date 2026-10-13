import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveUserId } from "@/lib/resolve-user";
import { simklConfigured, simklExchangeCode } from "@/lib/simkl-client";
import { encryptSecret } from "@/lib/token-encryption";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.redirect(new URL("/login", req.url));

  if (!simklConfigured()) return NextResponse.redirect(new URL("/settings?simkl=error", req.url));

  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/settings?simkl=error", req.url));

  try {
    const token = await simklExchangeCode(code);
    if (!token.access_token) return NextResponse.redirect(new URL("/settings?simkl=error", req.url));

    await prisma.externalAccount.upsert({
      where: { userId_provider: { userId, provider: "simkl" } },
      update: {
        accessToken: encryptSecret(token.access_token),
        refreshToken: null,
        expiresAt: token.expires_in ? new Date(Date.now() + token.expires_in * 1000) : null,
        syncAt: null,
      },
      create: {
        userId,
        provider: "simkl",
        providerId: "simkl",
        accessToken: encryptSecret(token.access_token),
        expiresAt: token.expires_in ? new Date(Date.now() + token.expires_in * 1000) : null,
      },
    });

    return NextResponse.redirect(new URL("/profile?simkl=connected", req.url));
  } catch {
    return NextResponse.redirect(new URL("/profile?simkl=error", req.url));
  }
}