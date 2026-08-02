export function logError(error: unknown, context?: string) {
  if (process.env.NODE_ENV === "development") {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(context ? `[${context}]` : "[error]", msg);
  }
}
