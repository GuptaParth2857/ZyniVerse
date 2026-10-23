# Vercel WAF rules — bot traffic (moved out of `src/proxy.ts`)

## Why this moved

`src/proxy.ts` used to run a 74-token bot blocklist on every request. In
Next.js 16 Proxy runs on the **Node.js** runtime by default (middleware was
renamed to Proxy and the Edge default was removed), so that blocklist was
billed as Node function duration on every single request. The WAF evaluates
rules at the CDN edge, before your function is ever invoked, so it costs
nothing against Function Duration.

The proxy blocklist was removed in the same change. **If you skip this step,
bot traffic is no longer blocked at all.** The rules below are the ones that
are **live on the `zyni-verse` project** (verified 2026-10-13, re-applied and
re-verified 2026-10-21).

> Discoverability rule of thumb: **never block AI-search / answer crawlers or
> search engines.** We want ChatGPT Search, Perplexity, Claude, Google and Bing
> to index and cite ZyniVerse. Only pure SEO/backlink tools and generic
> non-browser clients are denied.

## Where these live

Applied via the Vercel Firewall REST API (no dashboard click needed), and they
take effect immediately — **no redeploy required**:

- `PATCH /v1/security/firewall/config/draft?projectId=…&teamId=…`
  with `{ "action": "rules.insert" | "rules.update", "id": null | "<ruleId>", "value": { … } }`
- `POST  /v1/security/firewall/config/draft/activate?projectId=…&teamId=…` to publish

Hobby allows **up to 3 custom rules** — exactly the 3 below.

## Applying them: `scripts/vercel-firewall-apply.mjs`

The rules are **project configuration, not repository content**. Every new
Vercel project starts with an empty firewall — that is exactly what happened
when the project was moved to the `parthgup0102-2490s-projects` scope: the old
project still had these 3 rules, the new one had none, and the crawler flood
came straight back.

```bash
# list the current rules
node scripts/vercel-firewall-apply.mjs --project prj_XXXX --list

# apply the 3 rules (idempotent: updates rules with the same name, inserts the rest)
node scripts/vercel-firewall-apply.mjs --project prj_XXXX

# apply + turn off Vercel Authentication (Deployment Protection)
node scripts/vercel-firewall-apply.mjs --project prj_XXXX --disable-sso

# show what would happen, write nothing
node scripts/vercel-firewall-apply.mjs --project prj_XXXX --dry-run
```

Authentication is resolved in this order:

1. `--token <token>`
2. `VERCEL_TOKEN` environment variable
3. the Vercel CLI's own auth file (used only while its session token is valid)
4. the Vercel CLI itself (`npx vercel api …`) — the CLI refreshes its own
   session, so `vercel login` as an account that owns the target scope is
   enough.

**The token has to belong to the scope that owns the project.** The CLI
session in this workspace is logged in as `devilgamerparth009` and can only
see `gupta-s1` (`zyni-verse`), so the new scope had to be driven with a token
that has access to `parthgup0102-2490s-projects`.

## Live rules

### Rule 1 — Throttle aggressive crawlers (action: `rate_limit`)
Per-IP rate limit **100 requests / 60s**, exceeded → challenge/429. Search
engines and AI crawlers are exempt, and static asset paths do not count.

- Condition A (NOT): `path` matches
  `^/(_next/|favicon\.ico|.*\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|txt|xml|json))$`
- Condition B (NOT): `user_agent` matches
  `(googlebot|mediapartners-google|adsbot-google|bingbot|msnbot|applebot|duckduckbot|duckassistbot|yandex|baiduspider|sogou|seznambot|oai-searchbot|chatgpt-user|gptbot|perplexity|claudebot|claude-user|claude-web|anthropic|meta-external|facebookexternalhit|amazonbot|cohere|petalbot)`
- `rateLimit`: `{ algo: "fixed_window", window: 60, limit: 100, keys: ["ip"], action: "challenge" }`

> Note: a *distributed* crawler (many IPs) is not stopped by an per-IP limit.

### Rule 2 — Block SEO / backlink scrapers (action: `deny`)
pure commercial SEO tools plus the catalog harvesters measured in the app's own
`bot:*` counters (see below):
```
ahrefsbot, semrushbot, mj12bot, dotbot, dataforseobot, barkrowler, linkdexbot,
meanpathbot, exabot, serpstat, rogerbot, screamingfrog, seokicks, sistrix,
serankingbacklinksbot, reflectionbot, exasearchbot,
tokenfoundrybot, aionbot, astracia(bot|previewbot), mybzzbot, eteonbot,
tablifbot, vexelsearchbot, agenttrustbot, mochiimagecrawler, yisouspider
```

> **2026-10-23 update — this was the actual overage driver.** The Hobby plan
> hit `ISR Writes 461K/200K` and `Function Duration 133/100 GB-Hrs` with
> `Function Invocations 502K` ≈ `ISR Writes 461K`, i.e. almost every invocation
> was a page render that then wrote to the ISR cache. Cause, from the
> `bot:day:*` / `bot:path:*` counters:
>
> | bot | hits / 14d | distinct URLs |
> | --- | --- | --- |
> | `SERankingBacklinksBot` | 23,218 | 23,236 |
> | `Reflectionbot` | 22,072 | 17,948 |
> | `ExaSearchBot` | 10,281 | 9,977 |
> | everything else | 6,314 | — |
>
> 90% of 61,885 bot hits came from those three, and on 2026-10-23 alone they
> made 19,234 of 20,632 hits (≈600k renders/month at that run-rate). None of
> them was in the rule-2 regex, so the WAF let every one through. After adding
> them: those UAs get `403`, while Googlebot / Bingbot / Applebot /
> OAI-SearchBot / PerplexityBot still get `200` (verified).
>
> `ExaSearchBot` is an AI *search* index rather than a backlink tool. It is
> blocked because it was crawling ~700 URLs/day for a site with ~30 page views
> a day; remove `|exasearchbot` from the rule-2 regex if its citations ever
> matter more than the quota.

### Rule 3 — Block generic non-browser clients (action: `deny`)
```
python-requests, python-urllib, python-httpx, pantra, scrapy, node-fetch,
go-http-client, curl/, wget/, java/, http-client, axios/, okhttp-utils
```

## Do NOT block (intentionally allowed)

`googlebot`, `bingbot`, and every AI answer/search crawler:
`oai-searchbot` (ChatGPT Search), `chatgpt-user`, `gptbot`, `perplexity`,
`claudebot`, `claude-user`, `anthropic`, `applebot`, `duckduckbot`, `yandex`,
`baiduspider`, `sogou`, `cohere`, `meta-external`, `amazonbot`, …

`google-extended` and `ccbot` are **not** blocked either, so Google's / Common
Crawl's AI pipelines can still learn about the site.

## The scraper fleet (2026-10-11 → 2026-10-20) — what the WAF cannot see

The flood that blew the Hobby overage was **not** made of the User-Agents
above. Measured on the database:

| signal | value |
| --- | --- |
| `UserSession` rows | 123,897 (54.8 MB) |
| `Chrome / Linux` | 116,595 (94%) |
| country US / DE / GB / FR / SG | 86,154 / 8,965 / 8,422 / 7,017 / 4,961 |
| country IN | 533 (0.4%) |
| peak day (2026-10-19) | 19,608 sessions vs 8,824 page views (2.2 sessions / page view — impossible for humans) |
| hits caught by the bot catalogue | 25,754 in total (Reflectionbot 15,948, ExaSearchBot 4,834, Applebot 1,468 …) |

So ~99% of the traffic was a **headless browser fleet with a spoofed, perfectly
ordinary Chrome User-Agent** — it executes JavaScript (it produced session rows
and page views) and it rotates IP addresses, so neither the WAF rules nor an
per-IP rate limit can see it. Only 0.6% of the classified bot hits were on
`/forum/*`, and `/forum/create` (1,869 page views) was crawled by this
unclassified fleet.

Three layers now stop it (implemented 2026-10-21):

1. **Client side** — `src/lib/automation-detect.ts`: `navigator.webdriver` and
   the "no plugins + no `window.chrome`" headless signature. The tracker then
   never sends the request: **0 serverless invocations, 0 database rows**.
2. **Proxy** — `src/proxy.ts` answers `/api/analytics/*` with `204` for known
   crawlers, so the route handler is never invoked.
3. **Route** — `src/app/api/analytics/{session,pageview}/route.ts` skip the
   write for a known crawler or a missing User-Agent, and the page view now
   stores the real User-Agent (it used to be `NULL` on 100% of rows).

## Verify

```bash
# allowed (expect 200)
curl -s -o /dev/null -w '%{http_code}\n' -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" https://zyverse.in/
curl -s -o /dev/null -w '%{http_code}\n' -A "Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)" https://zyverse.in/
curl -s -o /dev/null -w '%{http_code}\n' -A "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)" https://zyverse.in/
curl -s -o /dev/null -w '%{http_code}\n' -A "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claude-bot@anthropic.com)" https://zyverse.in/

# blocked (expect 403)
curl -s -o /dev/null -w '%{http_code}\n' -A "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)" https://zyverse.in/
curl -s -o /dev/null -w '%{http_code}\n' -A "python-requests/2.31.0" https://zyverse.in/
```

Then re-check Vercel → Observability → Firewall (Traffic → User Agents) to see
what is still driving Function Duration.

## Deployment Protection (Vercel Authentication)

**A new project has Vercel Authentication ON by default.** Every visitor then
gets a login wall — the site looked "broken" (302 → `vercel.com/login`) until
it was turned off.

```bash
# via the API (script)
node scripts/vercel-firewall-apply.mjs --project prj_XXXX --disable-sso

# via the API (raw)
curl -X PATCH "https://api.vercel.com/v9/projects/prj_XXXX" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ssoProtection": null}'
```

Dashboard equivalent: Project → Settings → **Deployment Protection** →
*Vercel Authentication* → **Disabled**. There is no `PATCH /v10/projects/…`
for this — the `ssoProtection` field lives on `PATCH /v9/projects/{idOrName}`.

## Still open

- **Function Duration is still burned by high-volume dynamic page renders**
  (catalog enumeration of `/character/*`, `/manga/*`, `/staff/*`, `/anime/*`).
  The 2026-10-23 measurement above showed the volume was not organic: it was
  three self-identified harvesters, now denied at the edge and disallowed in
  `robots.txt`. Watch Observability → Firewall for a week; if catalog renders
  are still the top consumer, the next step is edge caching / a longer
  `revalidate` on those routes so repeat crawls are CDN HITs, not Node renders.
- **The new project still needs the 3 firewall rules + Deployment Protection
  off** (see above). Until that happens it has no bot protection at all.
- **Egress is not measurable from the database** — the Supabase free tier
  allows 5 GB/month and the dashboard has to be checked separately.
- The GitHub Actions cron was silently running to completion without calling
  any endpoint for five days (it routed on the wall-clock hour, and GitHub
  starts scheduled runs late). It now routes on `github.event.schedule` —
  see `.github/workflows/cron.yml` and `src/__tests__/cron-workflow.test.ts`.
