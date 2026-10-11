/**
 * AI Concierge v2 — the "Zyni AI" palette assistant, now with memory.
 *
 * v1 was stateless and cacheable: it routed a bare query to a page or answered
 * a one-off question, so an identical query legitimately returned a cached
 * response for everyone. v2 is neither stateless nor cacheable:
 *
 *  - **Memory.** Each user has one rolling conversation (`AiConversation` /
 *    `AiMessage`). The recent turns are replayed to the model, so "what about
 *    the second one?" means something.
 *  - **Taste.** The user's Taste DNA (top genres, archetype, watch style) is
 *    folded into the system prompt so recommendations land close to what they
 *    actually watch. This is why responses bypass `AiCache` entirely.
 *
 * The model is still untrusted: an `href` is only honoured when it exactly
 * matches a page the viewer may open, exactly like the v1 route.
 */
import { prisma } from "./prisma";
import { commandsFor, type Command } from "./commands";
import { geminiGenerate, parseGeminiJson } from "./gemini";
import { getDnaForUser } from "./dna";

/** How many prior turns are replayed as model context. */
const HISTORY_TURNS = 8;
/** Hard cap so one thread cannot grow without bound. */
const MAX_STORED_TURNS = 40;
const MAX_QUERY = 200;
const MAX_ANSWER = 600;

const SYSTEM = `You are Zyni AI, the concierge inside ZyniVerse, an anime database and community site.

You are given the site's pages. Reply with JSON only:
- {"href": "/exact/path"} when the request clearly matches one listed page.
- {"answer": "short answer"} when it does not match a page and you can genuinely help from anime knowledge, or when you are following up on something you already said.

Rules:
- Only ever return an href that appears verbatim in the page list.
- Never invent a path, query string, or URL.
- Never return admin or moderation pages; they are not in your list.
- Keep an answer under 300 characters and plain text, no markdown.
- When the request is ambiguous between two pages, pick the more general one.
- Use the conversation so far to resolve follow-ups ("that one", "the second", "more like it").`;

export interface ConciergeCommand {
  path: string;
  label: string;
  keywords?: string;
}

export interface ConciergeReply {
  answer?: string;
  href?: string;
  label?: string;
}

export interface ConciergeTurn {
  role: "user" | "model";
  text: string;
  href: string | null;
  createdAt: Date;
}

/** The public page list the concierge may link to — admin paths excluded. */
export function allowedCommands(): ConciergeCommand[] {
  return commandsFor({ isAuth: true, isAdmin: false }).map((c: Command) => ({
    path: c.path,
    label: c.label,
    keywords: c.keywords,
  }));
}

function catalog(allowed: ConciergeCommand[]): string {
  return allowed
    .map((c) => `${c.path} — ${c.label}${c.keywords ? ` (${c.keywords})` : ""}`)
    .join("\n");
}

/**
 * A one-line taste brief for the system prompt. Best-effort: DNA aggregation
 * reaches AniList, so a failure downgrades the concierge to stateless answers
 * rather than failing the request.
 */
export async function buildTasteContext(
  userId: string,
  username: string,
  displayName?: string | null,
  avatar?: string | null
): Promise<string> {
  try {
    const dna = await getDnaForUser(userId, username, displayName, avatar);
    const bits = [
      dna.totalAnime > 0 ? `${dna.totalAnime} anime tracked` : "",
      dna.topGenres.length > 0 ? `top genres: ${dna.topGenres.map((g) => g.genre).join(", ")}` : "",
      `archetype: ${dna.archetype.label}`,
      `watch style: ${dna.watchStyle.label}`,
      dna.favoriteStudio ? `favourite studio: ${dna.favoriteStudio}` : "",
    ].filter(Boolean);
    return bits.join("; ");
  } catch {
    return "";
  }
}

/** Recent turns, oldest first. */
export async function getConversation(userId: string, limit = HISTORY_TURNS): Promise<ConciergeTurn[]> {
  const convo = await prisma.aiConversation.findUnique({
    where: { userId },
    include: { messages: { orderBy: { createdAt: "desc" }, take: limit } },
  });
  if (!convo) return [];
  return [...convo.messages].reverse().map((m) => ({
    role: m.role === "model" ? "model" : "user",
    text: m.text,
    href: m.href,
    createdAt: m.createdAt,
  }));
}

/** Trim leading non-user turns so the replayed history is a valid alternation. */
export function toModelTurns(history: ConciergeTurn[]): { role: "user" | "model"; text: string }[] {
  const turns = [...history];
  while (turns.length > 0 && turns[0].role !== "user") turns.shift();
  return turns.map((t) => ({ role: t.role, text: t.text }));
}

async function saveTurn(userId: string, query: string, reply: ConciergeReply): Promise<void> {
  const convo = await prisma.aiConversation.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  // Explicit timestamps on purpose: both rows land in one transaction, and
  // Postgres `now()` is the *transaction* start, so leaving `createdAt` to its
  // default would give the question and the answer identical timestamps and
  // make read order (and therefore replay order) non-deterministic.
  const base = Date.now();
  await prisma.$transaction([
    prisma.aiMessage.create({
      data: {
        conversationId: convo.id,
        role: "user",
        text: query.slice(0, MAX_QUERY),
        createdAt: new Date(base),
      },
    }),
    prisma.aiMessage.create({
      data: {
        conversationId: convo.id,
        role: "model",
        text: (reply.answer ?? reply.label ?? "").slice(0, MAX_ANSWER),
        href: reply.href ?? null,
        createdAt: new Date(base + 1),
      },
    }),
  ]);

  // Keep the thread bounded: drop everything older than the last N turns.
  const stale = await prisma.aiMessage.findMany({
    where: { conversationId: convo.id },
    orderBy: { createdAt: "desc" },
    skip: MAX_STORED_TURNS,
    select: { id: true },
  });
  if (stale.length > 0) {
    await prisma.aiMessage.deleteMany({ where: { id: { in: stale.map((s) => s.id) } } });
  }
}

export async function clearConversation(userId: string): Promise<void> {
  await prisma.aiConversation.deleteMany({ where: { userId } });
}

/**
 * Ask the concierge. Reads memory + taste, calls Gemini with the history as
 * turns, validates any navigation target, then persists the exchange. A failed
 * generation throws before anything is saved, so memory never records a
 * question that never got an answer.
 */
export async function askConcierge(opts: {
  userId: string;
  username: string;
  displayName?: string | null;
  avatar?: string | null;
  query: string;
}): Promise<ConciergeReply> {
  const { userId, query } = opts;
  const allowed = allowedCommands();

  const [taste, history] = await Promise.all([
    buildTasteContext(userId, opts.username, opts.displayName, opts.avatar),
    getConversation(userId, HISTORY_TURNS),
  ]);

  const system = taste
    ? `${SYSTEM}\n\nWhat you know about this user (use it lightly; never recite it back): ${taste}. Username: ${opts.username}.`
    : SYSTEM;

  const text = await geminiGenerate({
    system,
    turns: toModelTurns(history),
    prompt: `Pages:\n${catalog(allowed)}\n\nRequest: ${query}`,
    json: true,
    // No cacheKey on purpose: a personalized, history-dependent reply is not
    // shareable with anyone else.
  });

  const parsed = parseGeminiJson<{ href?: string; answer?: string }>(text);
  if (!parsed) throw new Error("Zyni AI returned an unreadable reply");

  // Trust nothing the model produced.
  if (typeof parsed.href === "string") {
    const target = allowed.find((c) => c.path === parsed.href);
    if (target) {
      const reply: ConciergeReply = { href: target.path, label: target.label };
      await saveTurn(userId, query, reply);
      return reply;
    }
  }

  if (typeof parsed.answer === "string" && parsed.answer.trim()) {
    const reply: ConciergeReply = { answer: parsed.answer.trim().slice(0, MAX_ANSWER) };
    await saveTurn(userId, query, reply);
    return reply;
  }

  throw new Error("Zyni AI found neither a page nor an answer");
}
