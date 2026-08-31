import { readFileSync, writeFileSync } from "fs";

const NEW_REF = process.env.NEW_SUPABASE_REF || "vwzkdjnmdztkdtnnrlfs";
const NEW_DB_PASS = process.env.NEW_DB_PASSWORD;
// Read from environment — never hardcode secrets in source.
const PUB_KEY = process.env.NEW_SUPABASE_PUB_KEY;
const SEC_KEY = process.env.NEW_SUPABASE_SEC_KEY;

const TXN_URL = `postgresql://postgres.${NEW_REF}:${NEW_DB_PASS}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=5&pool_timeout=20&sslmode=require`;
const SESS_URL = `postgresql://postgres.${NEW_REF}:${NEW_DB_PASS}@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require`;

// carry over unchanged from old env files
const CARRY = [
  "YOUTUBE_API_KEY", "CRON_SECRET", "AUTH_SECRET", "AUTH_URL",
  "AUTH_GITHUB_ID", "AUTH_GITHUB_SECRET", "AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET",
  "RESEND_API_KEY", "NEXT_PUBLIC_BASE_URL", "NEXT_PUBLIC_GOOGLE_VERIFICATION",
];

// overrides -> new project values
const OVERRIDE = {
  DATABASE_URL: TXN_URL,
  DIRECT_URL: SESS_URL,
  POSTGRES_PRISMA_URL: TXN_URL,
  POSTGRES_URL: TXN_URL,
  POSTGRES_URL_NON_POOLING: SESS_URL,
  POSTGRES_HOST: "aws-0-ap-south-1.pooler.supabase.com",
  POSTGRES_DATABASE: "postgres",
  POSTGRES_USER: `postgres.${NEW_REF}`,
  POSTGRES_PASSWORD: NEW_DB_PASS,
  NEXT_PUBLIC_SUPABASE_URL: `https://${NEW_REF}.supabase.co`,
  SUPABASE_URL: `https://${NEW_REF}.supabase.co`,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: PUB_KEY,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: PUB_KEY,
  SUPABASE_ANON_KEY: PUB_KEY,
  SUPABASE_PUBLISHABLE_KEY: PUB_KEY,
  SUPABASE_SERVICE_ROLE_KEY: SEC_KEY,
  SUPABASE_SECRET_KEY: SEC_KEY,
};

const DROP_PREFIXES = ["VERCEL_", "TURBO_", "NX_", "SUPABASE_JWT"];

const envs = {};
for (const f of [".env", ".env.local"]) {
  try {
    for (const line of readFileSync(f, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
      if (m && !(m[1] in envs)) envs[m[1]] = m[2];
    }
  } catch {}
}

const out = [];
const missing = [];
for (const k of CARRY) {
  if (envs[k] !== undefined) out.push(`${k}=${envs[k]}`);
  else missing.push(k);
}
for (const [k, v] of Object.entries(OVERRIDE)) out.push(`${k}=${v}`);

writeFileSync(".env.vercel-import", out.join("\n") + "\n");
console.log(`Wrote ${out.length} vars to .env.vercel-import`);
if (missing.length) console.log("MISSING from local env:", missing.join(", "));
console.log("Names included:", out.map((l) => l.split("=")[0]).join(", "));
