import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const PER_USER_DAILY_LIMIT = 20;
export const GLOBAL_DAILY_LIMIT = 1200;
const GLOBAL_SENTINEL = "__global__";

export class AiQuotaError extends Error {}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function aiCacheKey(kind: string, value: string): string {
  return `${kind}:${createHash("sha256").update(value.trim().toLowerCase()).digest("hex")}`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function bump(day: string, userId: string): Promise<number> {
  const row = await prisma.aiUsageDaily.upsert({
    where: { day_userId: { day, userId } },
    update: { count: { increment: 1 } },
    create: { day, userId, count: 1 },
  });
  return row.count;
}

export async function consumeAiQuota(userId: string): Promise<void> {
  const day = today();
  const global = await prisma.aiUsageDaily.findUnique({
    where: { day_userId: { day, userId: GLOBAL_SENTINEL } },
  });
  if ((global?.count ?? 0) >= GLOBAL_DAILY_LIMIT) {
    throw new AiQuotaError("Zyni AI is resting for today — the free daily budget is used up. Come back tomorrow!");
  }
  await bump(day, GLOBAL_SENTINEL);
  const used = await bump(day, userId);
  if (used > PER_USER_DAILY_LIMIT) {
    throw new AiQuotaError(`You've used all ${PER_USER_DAILY_LIMIT} free AI requests today. Come back tomorrow!`);
  }
}

interface GeminiPart {
  text?: string;
  inline_data?: { mime_type: string; data: string };
}

interface GeminiTurn {
  role: "user" | "model";
  text: string;
}

export interface GeminiImage {
  mime: string;
  base64: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function geminiGenerate(opts: {
  system?: string;
  prompt?: string;
  turns?: GeminiTurn[];
  image?: GeminiImage;
  json?: boolean;
  cacheKey?: string | null;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  if (opts.cacheKey) {
    const hit = await prisma.aiCache.findUnique({ where: { key: opts.cacheKey } }).catch(() => null);
    if (hit) return hit.response;
  }

  const contents: { role: string; parts: GeminiPart[] }[] = [
    ...(opts.turns ?? []).map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
    ...(opts.prompt ? [{ role: "user", parts: [{ text: opts.prompt }] as GeminiPart[] }] : []),
  ];
  if (opts.image && contents.length > 0) {
    contents[contents.length - 1].parts.unshift({
      inline_data: { mime_type: opts.image.mime, data: opts.image.base64 },
    });
  }

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
      // 2.5 models burn hidden "thought" tokens from maxOutputTokens by
      // default — long prompts then return EMPTY text. Disable thinking.
      thinkingConfig: { thinkingBudget: 0 },
      ...(opts.json ? { responseMimeType: "application/json" } : {}),
    },
  };
  if (opts.system) body.systemInstruction = { parts: [{ text: opts.system }] };

  let lastError: unknown = new Error("Gemini request failed");
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${API_BASE}/models/${MODEL}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 429 || res.status >= 500) {
        lastError = new Error(`Gemini ${res.status}`);
        await sleep(1200 * 2 ** attempt);
        continue;
      }
      if (!res.ok) throw new Error(`Gemini error ${res.status}`);
      const data = (await res.json()) as {
        candidates?: { content?: { parts?: GeminiPart[] } }[];
      };
      const text =
        data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      if (!text) throw new Error("Empty Gemini response");
      if (opts.cacheKey) {
        await prisma.aiCache
          .create({ data: { key: opts.cacheKey, kind: opts.cacheKey.split(":")[0], response: text } })
          .catch(() => {});
      }
      return text;
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("429") && !msg.includes("Gemini 5")) break;
    }
  }
  throw lastError;
}

export function parseGeminiJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
