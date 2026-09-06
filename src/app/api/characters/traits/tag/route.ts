import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { resolveUserId } from "@/lib/resolve-user";

const HAIR = ["Black", "Brown", "Blonde", "Blue", "Red", "Pink", "Purple", "White", "Green", "Silver"];
const EYES = ["Brown", "Blue", "Green", "Red", "Pink", "Purple", "Hazel", "Black", "Amber"];

export async function POST(request: Request) {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const characterId = Number(body.characterId);
  const characterName = String(body.characterName || "").trim();
  const characterImage = body.characterImage ? String(body.characterImage) : null;
  const hairColor = body.hairColor ? String(body.hairColor) : null;
  const eyeColor = body.eyeColor ? String(body.eyeColor) : null;

  if (!characterId) return NextResponse.json({ error: "characterId is required" }, { status: 400 });
  if (hairColor && !HAIR.includes(hairColor)) return NextResponse.json({ error: "Invalid hair color" }, { status: 400 });
  if (eyeColor && !EYES.includes(eyeColor)) return NextResponse.json({ error: "Invalid eye color" }, { status: 400 });

  const existing = await prisma.characterTrait.findUnique({ where: { characterId } });

  let row;
  if (existing) {
    row = await prisma.characterTrait.update({
      where: { characterId },
      data: {
        ...(existing.name === "" ? { name: characterName } : {}),
        ...(hairColor ? { hairColor } : {}),
        ...(eyeColor ? { eyeColor } : {}),
      },
    });
  } else {
    if (!characterName) return NextResponse.json({ error: "characterName is required for a new character" }, { status: 400 });
    row = await prisma.characterTrait.create({
      data: {
        characterId,
        name: characterName,
        image: characterImage,
        hairColor,
        eyeColor,
      },
    });
  }

  return NextResponse.json({ trait: row });
}