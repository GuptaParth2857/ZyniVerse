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

// App-router route handlers and server components run Prisma queries
// concurrently (Promise.all), and Vercel can route several requests to the same
// serverless instance. Forcing `connection_limit=1` made those queries queue on
// a single connection; any slow query (e.g. the large epgCache JSON rows) then
// pushed the rest past `pool_timeout` and surfaced as Prisma P2024 errors.
// Respect an explicit `connection_limit` from the URL (Supabase pooler URLs set
// one) and only apply a small default otherwise. The transaction pooler
// (Supavisor / pgBouncer on 6543) needs `pgbouncer=true` so prepared statements
// are disabled.
function pooledDatabaseUrl(raw: string | undefined): string | undefined {
  if (!raw) return raw;
  try {
    const url = new URL(raw);
    const serverless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    // `next build` prerenders pages in parallel worker processes, and every
    // worker is a separate Node process with its own Prisma pool — so the
    // total connection count is (workers x connection_limit), not
    // connection_limit. With the serverless default of 5 that is ~75
    // concurrent connections opened by a single deploy, which is what
    // exhausted the database's max_connections (EMAXCONN, limit 200) and
    // failed the prerender of /feed, /live-action/[id] and /sitemap.xml with
    // Prisma P2024. One connection per worker keeps the build at ~15
    // connections; the pool timeout is raised so queries that queue behind
    // the single connection wait instead of failing.
    const isBuild = process.env.NEXT_PHASE === "phase-production-build";

    if (isBuild) {
      if (!url.searchParams.has("connection_limit")) {
        url.searchParams.set("connection_limit", "1");
      }
      if (!url.searchParams.has("pool_timeout")) {
        url.searchParams.set("pool_timeout", "60");
      }
    } else if (serverless) {
      if (!url.searchParams.has("connection_limit")) {
        url.searchParams.set("connection_limit", "5");
      }
      if (!url.searchParams.has("pool_timeout")) {
        url.searchParams.set("pool_timeout", "20");
      }
    } else if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "3");
    }

    if (url.port === "6543" && !url.searchParams.has("pgbouncer")) {
      url.searchParams.set("pgbouncer", "true");
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
