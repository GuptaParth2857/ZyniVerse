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

const base = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = base;

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
