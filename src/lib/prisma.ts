import { PrismaClient } from "@prisma/client";
import { proxyImageUrl } from "./avatar-src";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function rewriteImageFields<T>(value: T): T {
  if (Array.isArray(value)) return value.map((v) => rewriteImageFields(v)) as T;
  if (value && typeof value === "object") {
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) return value;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if ((k === "avatar" || k === "banner") && typeof v === "string") {
        out[k] = proxyImageUrl(v);
      } else {
        out[k] = rewriteImageFields(v);
      }
    }
    return out as T;
  }
  return value;
}

// Serverless functions run one request at a time (`fluid: false` on Vercel), so
// a large per-instance pool just exhausts the Supabase pooler as the fleet
// scales. Force a single connection on serverless; self-hosted keeps a small
// default pool.
function pooledDatabaseUrl(raw: string | undefined): string | undefined {
  if (!raw) return raw;
  try {
    const url = new URL(raw);
    const serverless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    if (serverless) {
      url.searchParams.set("connection_limit", "1");
      url.searchParams.set("pool_timeout", "20");
      // Transaction pooler (Supavisor / pgBouncer on 6543) needs this flag so
      // Prisma disables prepared statements.
      if (url.port === "6543" && !url.searchParams.has("pgbouncer")) {
        url.searchParams.set("pgbouncer", "true");
      }
    } else if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "3");
    }
    return url.toString();
  } catch {
    return raw;
  }
}

const base = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: pooledDatabaseUrl(process.env.DATABASE_URL),
});
// Cache the client on globalThis in every environment. Serverless cold starts
// re-evaluate this module; reusing the instance avoids opening a fresh pool on
// each evaluation (the previous code only cached it when NODE_ENV !== production).
globalForPrisma.prisma = base;

export const prisma = base.$extends({
  query: {
    user: {
      async $allOperations({ query, args }) {
        const result = await query(args);
        return rewriteImageFields(result);
      },
    },
  },
});
