import { prisma } from "@/lib/prisma";
import { withPublicCache } from "@/lib/api-cache";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
export const dynamic = "force-dynamic";


async function GET_inner(request: Request) {
  const url = new URL(request.url);
  const gender = url.searchParams.get("gender");
  const ageFrom = url.searchParams.get("ageFrom");
  const ageTo = url.searchParams.get("ageTo");
  const hair = url.searchParams.get("hair");
  const eye = url.searchParams.get("eye");
  const q = url.searchParams.get("q");
  const sort = url.searchParams.get("sort") || "favourites";
  const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);
  const perPage = Math.min(Math.max(Number(url.searchParams.get("perPage")) || 30, 1), 60);

  const where: Prisma.CharacterTraitWhereInput = {};
  if (gender && gender !== "any") where.gender = gender;
  if (hair && hair !== "any") where.hairColor = hair;
  if (eye && eye !== "any") where.eyeColor = eye;
  if (q) where.name = { contains: q, mode: "insensitive" };

  const ageFilter: Prisma.IntNullableFilter = {};
  if (ageFrom) ageFilter.gte = Number(ageFrom);
  if (ageTo) ageFilter.lte = Number(ageTo);
  if (Object.keys(ageFilter).length > 0) where.ageInt = ageFilter;

  const orderBy = sort === "name" ? { name: "asc" as const } : { favourites: "desc" as const };

  const [total, results] = await Promise.all([
    prisma.characterTrait.count({ where }),
    prisma.characterTrait.findMany({ where, orderBy, skip: (page - 1) * perPage, take: perPage }),
  ]);

  return NextResponse.json({ characters: results, page, perPage, total, hasMore: page * perPage < total });
}

export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}
