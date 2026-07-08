import { NextResponse } from "next/server";
import { getCharacters } from "@/lib/voice-lines";

export async function GET() {
  const characters = getCharacters();
  return NextResponse.json({ characters });
}
