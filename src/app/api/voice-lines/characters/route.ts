import { NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { getCharacters } from "@/lib/voice-lines";

async function GET_inner() {
  const characters = getCharacters();
  return NextResponse.json({ characters });
}


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}
