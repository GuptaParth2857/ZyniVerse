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
are **live on the `zyni-verse` project** (verified 2026-10-13).

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
pure commercial SEO tools only:
```
ahrefsbot, semrushbot, mj12bot, dotbot, dataforseobot, barkrowler, linkdexbot,
meanpathbot, exabot, serpstat, rogerbot, screamingfrog, seokicks, sistrix
```

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

## Verify

```bash
# allowed (expect 200)
curl -s -o /dev/null -w '%{http_code}\n' -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" https://zyverse.in/
curl -s -o /dev/null -w '%{http_code}\n' -A "Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)" https://zyverse.in/
curl -s -o /dev/null -w '%{http_code}\n' -A "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)" https://zyverse.in/
curl -s -o /dev/null -w '%{http_code}\n' -A "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)" https://zyverse.in/

# blocked (expect 403)
curl -s -o /dev/null -w '%{http_code}\n' -A "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)" https://zyverse.in/
curl -s -o /dev/null -w '%{http_code}\n' -A "python-requests/2.31.0" https://zyverse.in/
```

Then re-check Vercel → Observability → Firewall (Traffic → User Agents) to see
what is still driving Function Duration.

## Still open

Function Duration is still burned by high-volume **dynamic page renders**
(catalog enumeration of `/character/*`, `/manga/*`, `/staff/*`, `/anime/*`).
The durable, discoverability-safe fix is edge caching / `revalidate` on those
routes so repeat crawls are served as CDN HITs instead of Node renders — see
`src/proxy.ts` (public cache-control block) and add `export const revalidate`
to the catalog route files.
