/**
 * Builds the semantic index by embedding every source the index knows about.
 *
 * Driven entirely by `SOURCES`, so a new source needs no change here.
 *
 * Safe to re-run: a document whose content hash already has a row is skipped
 * without an API call, and `pruneStale()` afterwards removes rows for documents
 * that were deleted or edited since the last run.
 *
 *   npm run embed:content              # all sources
 *   npm run embed:content -- --source=wiki
 *   npm run embed:content -- --dry     # report what would happen, embed nothing
 *
 * Embeddings cost money, so this prints its plan before doing anything unless
 * --yes is passed.
 */
import "./load-env";
import {
  isEmbeddingConfigured,
  EMBED_DIMS,
  EMBED_MODEL,
} from "../src/lib/embeddings";
import {
  embeddableText,
  pruneStale,
  SOURCES,
  sourceDocuments,
  storeEmbedding,
  syncPgvectorNow,
  type Source,
} from "../src/lib/semantic-index";
import { prisma } from "../src/lib/prisma";

function arg(name: string): string | null {
  const hit = process.argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return null;
  const eq = hit.indexOf("=");
  return eq === -1 ? "" : hit.slice(eq + 1);
}
const has = (name: string) => process.argv.includes(`--${name}`);

async function main() {
  if (!isEmbeddingConfigured()) {
    console.error("GEMINI_API_KEY is not set. Nothing to do.");
    process.exit(1);
  }

  const requested = arg("source");
  const sources: Source[] = requested
    ? requested.split(",").map((s) => s.trim()).filter((s): s is Source => (SOURCES as string[]).includes(s))
    : SOURCES;

  if (sources.length === 0) {
    console.error(`Unknown --source. Valid: ${SOURCES.join(", ")}`);
    process.exit(1);
  }

  const dry = has("dry");
  console.log(`model ${EMBED_MODEL} @ ${EMBED_DIMS} dims`);
  console.log(`sources: ${sources.join(", ")}${dry ? "   (dry run - nothing will be written)" : ""}\n`);

  let embedded = 0;
  let skipped = 0;
  let failed = 0;

  for (const source of sources) {
    const docs = await sourceDocuments(source);
    console.log(`${source}: ${docs.length} document${docs.length === 1 ? "" : "s"}`);

    for (const doc of docs) {
      const text = embeddableText(doc);
      if (!text.trim()) {
        console.log(`  skip  ${doc.id}  (empty text)`);
        skipped++;
        continue;
      }
      if (dry) {
        console.log(`  would ${doc.id}  (${text.length} chars)`);
        continue;
      }
      // Small pause: the embed endpoint has its own rate limits and a tight
      // loop against it returns 429s rather than doing the work faster.
      await new Promise((r) => setTimeout(r, 250));
      const ok = await storeEmbedding(source, doc);
      if (ok) {
        console.log(`  ok    ${doc.id}`);
        embedded++;
      } else {
        console.log(`  FAIL  ${doc.id}  (Gemini did not return a usable vector)`);
        failed++;
      }
    }

    if (!dry) {
      const removed = await pruneStale(source);
      console.log(`  pruned ${removed} stale row${removed === 1 ? "" : "s"}`);
    }
    console.log("");
  }

  // The pgvector mirror is a pure projection of AiCache, so a backfill that
  // changes the cache must refresh it. No-op until the DocEmbedding migration is
  // applied.
  if (!dry) {
    const mirrored = await syncPgvectorNow();
    if (mirrored > 0) console.log(`pgvector mirror: ${mirrored} rows re-synced`);
  }

  console.log(
    dry
      ? "Dry run complete. Re-run without --dry to write."
      : `Done. embedded=${embedded} skipped=${skipped} failed=${failed}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());