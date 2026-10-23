#!/usr/bin/env node
/**
 * Apply the ZyniVerse bot-traffic Firewall rules to a Vercel project, and
 * optionally turn off Vercel Authentication (Deployment Protection).
 *
 * The rules live in the project's Firewall configuration — they are NOT part
 * of the repository, so a new project starts with an empty firewall and the
 * crawler flood comes straight back (that is exactly what happened when the
 * project was moved to a new scope: the old project still has these rules,
 * the new one had none).
 *
 * The live rules were verified against the `zyni-verse` project on 2026-10-13
 * and are documented in VERCEL_WAF_RULES.md.
 *
 * Usage:
 *   node scripts/vercel-firewall-apply.mjs --project <idOrName> [--team <teamId>]
 *   node scripts/vercel-firewall-apply.mjs --project prj_xxx --disable-sso
 *   node scripts/vercel-firewall-apply.mjs --project prj_xxx --list
 *   node scripts/vercel-firewall-apply.mjs --project prj_xxx --dry-run
 *
 * Authentication (first match wins):
 *   1. --token <token>
 *   2. VERCEL_TOKEN environment variable
 *   3. the Vercel CLI's own auth file (so `vercel login` is enough)
 *   4. the Vercel CLI itself (`npx vercel api ...`), when no usable token is
 *      found — the CLI refreshes its own session, so `vercel login` as the
 *      owner of the scope is all that is needed.
 *
 * A Vercel token for the scope that owns the project is required: the token
 * has to be able to read and write that team's firewall configuration.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const API = "https://api.vercel.com";

// ---------------------------------------------------------------------------
// args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
function arg(name) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : null;
}
const has = (name) => args.includes(`--${name}`);

const project = arg("project");
const team = arg("team");
const dryRun = has("dry-run");
const listOnly = has("list");
const disableSso = has("disable-sso");

if (!project) {
  console.error("Missing --project <idOrName>");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// token
// ---------------------------------------------------------------------------
function tokenFromCliAuth() {
  const candidates = [
    path.join(os.homedir(), ".local", "share", "com.vercel.cli", "auth.json"),
    path.join(os.homedir(), "AppData", "Roaming", "com.vercel.cli", "Data", "auth.json"),
    path.join(os.homedir(), "AppData", "Roaming", "xdg.data", "com.vercel.cli", "auth.json"),
    path.join(os.homedir(), ".vercel", "auth.json"),
  ];
  for (const file of candidates) {
    try {
      const raw = JSON.parse(fs.readFileSync(file, "utf8"));
      // The CLI stores an expiring session token; a stale one is rejected by
      // the API with 403 invalidToken, so treat it as "no token".
      if (raw?.expiresAt && Number(raw.expiresAt) * 1000 < Date.now()) continue;
      if (raw?.token) return raw.token;
    } catch {
      /* not there */
    }
  }
  return null;
}

const token = arg("token") || process.env.VERCEL_TOKEN || tokenFromCliAuth();
if (!token) {
  console.log("No usable API token found — falling back to the Vercel CLI (`npx vercel api`).");
  console.log("Run `vercel login` as an account that owns the target scope first.\n");
}

const qs = () => {
  const p = new URLSearchParams();
  p.set("projectId", project);
  if (team) p.set("teamId", team);
  return p.toString();
};

/** Run a request through the Vercel CLI (it refreshes its own session). */
function apiViaCli(method, endpoint, body) {
  const cliArgs = ["vercel", "api", endpoint, "-X", method];
  let tmp = null;
  if (body !== undefined) {
    tmp = path.join(os.tmpdir(), `vercel-firewall-${Date.now()}.json`);
    fs.writeFileSync(tmp, JSON.stringify(body), "utf8");
    cliArgs.push("--input", tmp);
  }
  const res = spawnSync("npx", cliArgs, { encoding: "utf8", shell: true, maxBuffer: 32 * 1024 * 1024 });
  if (tmp) {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
  const out = res.stdout || "";
  const start = out.search(/[[{]/);
  let json = null;
  if (start >= 0) {
    try {
      json = JSON.parse(out.slice(start));
    } catch {
      json = { raw: out };
    }
  }
  if (res.status !== 0) {
    const err = new Error(`${method} ${endpoint} -> CLI exit ${res.status}`);
    err.payload = json ?? { stderr: res.stderr };
    throw err;
  }
  return json;
}

async function api(method, endpoint, body) {
  if (!token) return apiViaCli(method, endpoint, body);

  const res = await fetch(`${API}${endpoint}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(`${method} ${endpoint} -> ${res.status} ${res.statusText}`);
    err.payload = json;
    throw err;
  }
  return json;
}

// ---------------------------------------------------------------------------
// the rules (identical to the ones live on `zyni-verse` since 2026-10-13)
// ---------------------------------------------------------------------------
const RULES = [
  {
    name: "Throttle aggressive crawlers",
    description: "Per-IP rate limit; search engines and AI answer/search crawlers exempt",
    action: {
      mitigate: {
        action: "rate_limit",
        rateLimit: {
          limit: 100,
          action: "challenge",
          window: 60,
          algo: "fixed_window",
          keys: ["ip"],
        },
      },
    },
    active: true,
    conditionGroup: [
      {
        conditions: [
          {
            neg: true,
            op: "re",
            type: "path",
            value:
              "^/(_next/|favicon\\.ico|.*\\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|txt|xml|json))$",
          },
          {
            neg: true,
            op: "re",
            type: "user_agent",
            value:
              "(googlebot|mediapartners-google|adsbot-google|bingbot|msnbot|applebot|duckduckbot|duckassistbot|yandex|baiduspider|sogou|seznambot|oai-searchbot|chatgpt-user|gptbot|perplexity|claudebot|claude-user|claude-web|anthropic|meta-external|facebookexternalhit|amazonbot|cohere|petalbot)",
          },
        ],
      },
    ],
  },
  {
    name: "Block SEO/backlink scrapers",
    description:
      "Commercial SEO/backlink crawlers and catalog-harvesting bots (no search/AI-answer crawler)",
    action: { mitigate: { action: "deny" } },
    active: true,
    conditionGroup: [
      {
        conditions: [
          {
            type: "user_agent",
            op: "re",
            value:
              "(ahrefsbot|semrushbot|mj12bot|dotbot|dataforseobot|barkrowler|linkdexbot|meanpathbot|exabot|serpstat|rogerbot|screamingfrog|seokicks|sistrix" +
              // Measured 2026-10-09 → 2026-10-23 in `bot:path:*`: these three
              // alone crawled ~51k distinct URLs (SERankingBacklinksBot 23.2k,
              // Reflectionbot 17.9k, ExaSearchBot 10.0k) out of 61.9k bot hits,
              // and every first fetch of a URL is a Node render + an ISR write.
              // None of them is a search engine or an AI answer surface.
              "|serankingbacklinksbot|reflectionbot|exasearchbot" +
              // Long tail of self-identified harvesters seen in the same data.
              "|tokenfoundrybot|aionbot|astracia|mybzzbot|eteonbot|tablifbot|vexelsearchbot|agenttrustbot|mochiimagecrawler|yisouspider)",
          },
        ],
      },
    ],
  },
  {
    name: "Block generic non-browser clients",
    description: "curl/wget/python/script UAs",
    action: { mitigate: { action: "deny" } },
    active: true,
    conditionGroup: [
      {
        conditions: [
          {
            type: "user_agent",
            op: "re",
            value:
              "(python-requests|python-urllib|python-httpx|pantra|scrapy|node-fetch|go-http-client|curl/|wget/|java/|http-client|axios/|okhttp-utils)",
          },
        ],
      },
    ],
  },
];

async function main() {
  console.log(`project: ${project}${team ? `  team: ${team}` : ""}`);
  console.log(`mode:    ${listOnly ? "list" : dryRun ? "dry-run" : "apply"}`);

  const config = await api("GET", `/v1/security/firewall/config?${qs()}`);
  const existing = config?.active?.rules ?? [];
  console.log(`\ncurrent rules (${existing.length}/3 allowed on Hobby):`);
  for (const r of existing) {
    console.log(`  - ${r.name}  [${r.id}]  active=${r.active}`);
  }

  if (listOnly) return;

  if (!dryRun) {
    for (const rule of RULES) {
      const match = existing.find((r) => r.name === rule.name);
      const payload = match
        ? { action: "rules.update", id: match.id, value: rule }
        : { action: "rules.insert", id: null, value: rule };
      try {
        await api("PATCH", `/v1/security/firewall/config/draft?${qs()}`, payload);
        console.log(`\n${match ? "updated" : "inserted"}: ${rule.name}`);
      } catch (err) {
        console.error(`\nfailed on "${rule.name}": ${err.message}`);
        console.error(JSON.stringify(err.payload)?.slice(0, 600));
        process.exitCode = 1;
        return;
      }
    }

    await api("POST", `/v1/security/firewall/config/draft/activate?${qs()}`);
    console.log("\nfirewall rules published");
  } else {
    console.log("\n(dry run — nothing was written)");
  }

  if (disableSso) {
    if (dryRun) {
      console.log("(dry run) would PATCH /v9/projects with ssoProtection: null");
    } else {
      try {
        await api("PATCH", `/v9/projects/${encodeURIComponent(project)}${team ? `?teamId=${encodeURIComponent(team)}` : ""}`, {
          ssoProtection: null,
        });
        console.log("Vercel Authentication (Deployment Protection) turned off");
      } catch (err) {
        console.error(`failed to disable ssoProtection: ${err.message}`);
        console.error(JSON.stringify(err.payload)?.slice(0, 600));
        process.exitCode = 1;
      }
    }
  }

  const after = await api("GET", `/v1/security/firewall/config?${qs()}`);
  console.log(`\nfinal rules (${after?.active?.rules?.length ?? 0}):`);
  for (const r of after?.active?.rules ?? []) {
    console.log(`  - ${r.name}  active=${r.active}`);
  }
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  if (err.payload) console.error(JSON.stringify(err.payload).slice(0, 800));
  process.exit(1);
});
