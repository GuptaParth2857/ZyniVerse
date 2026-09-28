# Vercel WAF rules — bot blocking (moved out of `src/proxy.ts`)

## Why this moved

`src/proxy.ts` used to run a 74-token bot blocklist on every request. In
Next.js 16 Proxy runs on the **Node.js** runtime by default (middleware was
renamed to Proxy and the Edge default was removed), so that blocklist was
billed as Node function duration on every single request. The WAF evaluates
rules at the CDN edge, before your function is ever invoked, so it costs
nothing against Function Duration.

The proxy blocklist was removed in the same change. **If you skip this step,
bot traffic is no longer blocked at all.**

## Where to add them

Vercel Dashboard → your project → **Settings → Firewall → Create Rule**
(rule type: *Block request*). Condition: *Path does not match* `/api/og/*`
plus a *User-Agent contains* condition, one rule per group below.

## Rules

Add each group as a separate rule. Tokens are matched as substrings, exactly
as the old `lower.includes(token)` check did.

**Group 1 — AI training / AI search scrapers**
```
gptbot, chatgpt-user, chatgpt, oai-searchbot, gpt-3.5-turbo, perplexity, pplx,
claudebot, claude-web, claude-external, anthropic-ai, amazonbot,
google-extended, googleother, bytespider, ai2bot, ai2bot-dolma,
bytedance-webcrawler, tiktok-webcrawler, cohere-ai, dataforseekbot, youbot,
omgilibot, omgili, webzio-extractor, velenpublicwebcrawler, zumbot,
mia-research, imagesiftbot, brightbot, checkthewebsite, magpie-crawler,
komodia, dupax-ai-crawler, kangaroobot, awarios, zentcrawl
```

**Group 2 — SEO / analytics scrapers**
```
ccbot, dataforseobot, ahrefsbot, semrushbot, mj12bot, dotbot, seznambot,
barkrowler, petalbot, applebot-extended, meta-externalagent,
meta-externalfetcher, diffbot, yandexbot, baiduspider, sogou, exabot,
linkdexbot, meanpathbot
```

**Group 3 — generic non-browser clients (curl/wget/LIBS, never real users)**
```
python-requests, python-urllib, python-httpx, pantra, scrapy, node-fetch,
go-http-client, curl/, wget/, java/, http-client, axios/, okhttp-utils
```

## Do NOT block

`googlebot` and `bingbot` are deliberately allowed — they drive real organic
search traffic, including AI Overviews / AI Search answers. Note that
`google-extended` (Group 1) *is* blocked: that is the AI-training opt-out
token and is separate from `googlebot`.

## Verify

After saving, confirm with a blocked request:

```bash
curl -sI -A "Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)" https://zyverse.in/ | head -1
# expect: HTTP/2 403

curl -sI -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" https://zyverse.in/ | head -1
# expect: HTTP/2 200
```

Also re-check in Vercel → Observability → Firewall that hits are being counted
and that Function Duration has stopped growing on bot-shaped traffic.
