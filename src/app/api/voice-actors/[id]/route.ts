import { NextRequest, NextResponse } from "next/server";
import { getVoiceActor } from "@/lib/voice-actors";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const actor = await getVoiceActor(parseInt(id));
    return NextResponse.json({ actor });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
