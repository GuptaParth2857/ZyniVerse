import { auth } from "@/lib/auth";
import { sendPushToUser } from "@/lib/push";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await sendPushToUser(session.user.id, {
    title: "ZyniVerse notifications enabled",
    body: "You'll get alerts for new episodes, follows, replies and more.",
    link: "/notifications",
  });

  return NextResponse.json({ ok: true });
}
