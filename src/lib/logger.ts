import { AniListUnavailableError } from "./anilist";

type LogMeta = Record<string, unknown>;

function sanitizeMeta(meta?: LogMeta): LogMeta | undefined {
  if (!meta) return undefined;
  const clean: LogMeta = {};
  for (const [key, value] of Object.entries(meta)) {
    if (value !== undefined && value !== null) {
      clean[key] = typeof value === "object" ? JSON.stringify(value) : value;
    }
  }
  return Object.keys(clean).length > 0 ? clean : undefined;
}

export function logError(error: unknown, context?: string, meta?: LogMeta) {
  if (error instanceof AniListUnavailableError) return;
  const msg = error instanceof Error ? error.message : String(error);
  const clean = sanitizeMeta(meta);

  if (process.env.NODE_ENV === "development") {
    console.error(context ? `[${context}]` : "[error]", msg, clean ?? "");
    return;
  }

  try {
    console.error(
      JSON.stringify({
        level: "error",
        context,
        message: msg,
        stack: error instanceof Error ? error.stack : undefined,
        meta: clean,
        time: new Date().toISOString(),
      })
    );
  } catch {
    console.error(context ? `[${context}]` : "[error]", msg);
  }
}

export function logInfo(context: string, meta?: LogMeta) {
  if (process.env.NODE_ENV !== "production") return;
  try {
    console.info(
      JSON.stringify({
        level: "info",
        context,
        meta: sanitizeMeta(meta),
        time: new Date().toISOString(),
      })
    );
  } catch {
    /* ignore serialization errors */
  }
}