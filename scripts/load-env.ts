/**
 * Loads `.env` files for standalone scripts (tsx / node), mirroring the
 * precedence Next.js uses at runtime:
 *
 *   real process environment  >  .env.local  >  .env
 *
 * Node's `process.loadEnvFile` never overwrites a variable that is already
 * set, so loading `.env.local` before `.env` lets the local file win while a
 * value exported in the shell still takes precedence over both.
 *
 * Import this module for its side effect *before* anything that reads
 * `process.env` at import time (e.g. the Prisma client):
 *
 *   import "./load-env";
 */
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) loadEnvFile(file);
}
