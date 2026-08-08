import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const runtime = "nodejs";

type ServiceStatus = "operational" | "degraded" | "down";

interface ServiceResult {
  name: string;
  status: ServiceStatus;
  description: string;
  latencyMs: number | null;
  detail: string;
}

const FILLER_JSON_URL =
  "https://github.com/AniraTeam/AniFiller/releases/latest/download/anifiller.json";
const ANILIST_ENDPOINT = "https://graphql.anilist.co";
const USER_AGENT = "ZyniVerse/1.0 (https://zyverse.in)";
const TIMEOUT_MS = 10_000;

function dbHost(): string {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";
  try {
    return new URL(url).hostname || "unknown";
  } catch {
    return "unknown";
  }
}

async function checkDatabase(): Promise<ServiceResult> {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1 AS ok`;
    return {
      name: "Database",
      status: "operational",
      description: "PostgreSQL via Prisma",
      latencyMs: Date.now() - started,
      detail: `Host: ${dbHost()}`,
    };
  } catch (err) {
    return {
      name: "Database",
      status: "down",
      description: "PostgreSQL via Prisma",
      latencyMs: Date.now() - started,
      detail: err instanceof Error ? err.message.slice(0, 200) : "Unknown error",
    };
  }
}

async function checkAniList(): Promise<ServiceResult> {
  const started = Date.now();
  try {
    const res = await fetch(ANILIST_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify({
        query: "query { Page(perPage: 1) { media(type: ANIME) { id } } }",
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.ok) {
      return {
        name: "AniList Upstream",
        status: "operational",
        description: "AniList GraphQL integration",
        latencyMs: Date.now() - started,
        detail: `HTTP ${res.status}`,
      };
    }
    return {
      name: "AniList Upstream",
      status: res.status === 429 ? "degraded" : "down",
      description: "AniList GraphQL integration",
      latencyMs: Date.now() - started,
      detail: `HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      name: "AniList Upstream",
      status: "down",
      description: "AniList GraphQL integration",
      latencyMs: Date.now() - started,
      detail: err instanceof Error ? err.message.slice(0, 200) : "Unknown error",
    };
  }
}

async function checkGitHubFiller(): Promise<ServiceResult> {
  const started = Date.now();
  try {
    const res = await fetch(FILLER_JSON_URL, {
      method: "HEAD",
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.ok) {
      return {
        name: "GitHub Filler Data",
        status: "operational",
        description: "Crowdsourced filler guides (AniFiller)",
        latencyMs: Date.now() - started,
        detail: `HTTP ${res.status}`,
      };
    }
    return {
      name: "GitHub Filler Data",
      status: "degraded",
      description: "Crowdsourced filler guides (AniFiller)",
      latencyMs: Date.now() - started,
      detail: `HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      name: "GitHub Filler Data",
      status: "down",
      description: "Crowdsourced filler guides (AniFiller)",
      latencyMs: Date.now() - started,
      detail: err instanceof Error ? err.message.slice(0, 200) : "Unknown error",
    };
  }
}

export async function GET() {
  const apiStarted = Date.now();
  const [database, anilist, filler] = await Promise.all([
    checkDatabase(),
    checkAniList(),
    checkGitHubFiller(),
  ]);

  const services: ServiceResult[] = [
    {
      name: "API Server",
      status: "operational",
      description: "Handles all API requests",
      latencyMs: Date.now() - apiStarted,
      detail: `Node ${process.version} · ${process.platform}`,
    },
    database,
    anilist,
    filler,
  ];

  const status: ServiceStatus = services.some((s) => s.status === "down")
    ? "down"
    : services.some((s) => s.status === "degraded")
      ? "degraded"
      : "operational";

  return Response.json(
    {
      generatedAt: new Date().toISOString(),
      status,
      services,
      meta: {
        node: process.version,
        platform: process.platform,
        region: process.env.VERCEL_REGION ?? "local",
        uptimeMs: Math.floor(process.uptime() * 1000),
        rssMB: Math.round(process.memoryUsage().rss / 1048576),
      },
    },
    {
      headers: { "cache-control": "no-store" },
    },
  );
}
