import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { logError } from "@/lib/logger";

const resendKey = process.env.RESEND_API_KEY;
const resend = resendKey ? new Resend(resendKey) : null;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't leak whether user exists for security reasons
      return NextResponse.json({ success: true, message: "If an account exists, an email was sent." });
    }

    // Clear old tokens
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    // Generate 6 digit OTP
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    if (resend) {
      await resend.emails.send({
        from: "ZyniVerse <noreply@zyverse.in>",
        to: email,
        subject: "ZyniVerse - Password Reset Request",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #fff; padding: 20px; border-radius: 12px; border: 1px solid #333;">
            <h2 style="color: #00ffe0; text-align: center;">ZyniVerse Password Reset</h2>
            <p>You requested a password reset. Here is your 6-digit verification code:</p>
            <div style="background: #111; padding: 16px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 8px; margin: 24px 0; color: #ff00e6;">
              ${token}
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p style="color: #888; font-size: 12px; margin-top: 32px; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
    } else {
      // Email not configured — silently skip
    }

    return NextResponse.json({ success: true, message: "If an account exists, an email was sent." });
  } catch (error) {
    logError(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
