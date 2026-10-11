# ZyniVerse Growth Audit — Indexing, Analytics & Health

_Last updated: 2026-10-11 · Owner: Parth Gupta_

Ye doc har hafte 20 min me update karna hai. Isme wo sab hai jo code me nahi dikhta — Search Console, analytics aur index health.

---

## 1. Kya pehle se wired hai (verify karo)

| Cheez | Status | Kahan |
|-------|--------|-------|
| Google Analytics 4 | ✅ Wired | `src/app/layout.tsx` → `G-1B5P1BSEB9` (gtag) |
| Vercel Analytics | ✅ Wired (prod only) | `layout.tsx` — `process.env.VERCEL_URL &&` ke andar |
| Vercel Speed Insights | ✅ Wired (prod only) | same |
| Google AdSense | ✅ Wired | `ca-pub-5241033119281791` |
| sitemap.xml | ✅ | `/sitemap.xml` (revalidate 24h) |
| robots.txt | ✅ | `/robots.txt` |
| Google verification | ⚠️ env pe depend | `NEXT_PUBLIC_GOOGLE_VERIFICATION` — deploy me set hai? |

**Action:** GSC me property `zyverse.in` verified hai ye confirm karo, aur GA4 me realtime check karo ki traffic aa raha hai.

---

## 2. Indexing Snapshot (har hafte bharo)

| Metric | Value | Date | Note |
|--------|-------|------|------|
| `site:zyverse.in` results | _(GSC se bharo)_ | | Google me kitne pages |
| GSC — Indexed (Valid) | | | trend up hona chahiye |
| GSC — Crawled, not indexed | | | ye sabse bada red flag hai |
| GSC — Discovered, not indexed | | | crawl budget issue |
| GSC — Impressions (7d) | | | |
| GSC — Clicks (7d) | | | |
| GSC — Avg CTR | | | |
| GSC — Avg position | | | |

> **Golden rule:** agar "Crawled — currently not indexed" badh raha hai, content thin/duplicate hai — naye pages nahi, maujooda pages ko strong karo.

---

## 3. Issues mile (aur unka status)

### ✅ Abhi fix kiye (is round me)

1. **Thin AniList mirror pages Google ko flood kar rahe the**
   - `/character/[id]`, `/staff/[id]`, `/studio/[id]` → ab `noindex, follow` (pehle `index, follow`).
   - Sitemap se character pages hata diye (noindex URL sitemap me nahi hone chahiye).
   - Files: `src/app/character/[id]/layout.tsx`, `src/app/staff/[id]/layout.tsx`, `src/app/studio/[id]/layout.tsx`, `src/app/sitemap.ts`

2. **Filler pages ab original content carry karte hain**
   - `src/lib/filler-notes.ts` me 14 → **52 anime** ke hand-written watch/skip verdicts.
   - Ye AniFiller data se alag, apna editorial content hai — Google ke liye differentiation.

3. **Hindi dub cluster double (16 → 40 guides)**
   - `src/lib/indian-dub-guides.ts` me 16 → **40 dub guides**. Naye: Demon Slayer, My Hero Academia, Chainsaw Man, SAO, Spy x Family, Bleach TYBW, HxH, Haikyuu, Tokyo Revengers, Blue Lock, Code Geass, Oshi no Ko, Naruto, Boruto, Mashle, DBZ, Kakegurui, Cyberpunk, Record of Ragnarok, Great Pretender, One Punch Man, Tokyo Ghoul, Steins;Gate, Fate/Zero.
   - Har guide ek `/indian-dubs/{slug}` page banata hai — unique editorial + FAQ schema, sitemap me auto-include.
   - AniList IDs API se verify kiye (poster art sahi aaye).

4. **Homepage India moat lead karta hai**
   - Naya `src/components/IndiaHub.tsx` — hero ke turant baad, "This Week's Hindi Dub Schedule" (weekly-fresh) sabse upar.
   - Purana buried "Indian Hub" section hata diya.
   - Hero CTA ab "🇮🇳 This Week's Hindi Dubs" hai.

5. **Galat/inflated claims fix**
   - Hero stat "1000+ dubs" (asli ~70) → ab data se compute (`DUBBED_ANIME_STATIC`).
   - Home meta description "Join millions of Indian anime fans" (unsubstantiated) → honest, India-led copy.

6. **Dubbed tracker: data fix + expansion (73 → 104 titles)**
   - `src/lib/data/dubbed-static.ts` me 51 galat/duplicate `mal_id` the — jaise Bleach TYBW ka id Code Geass aur One Punch Man se share ho raha tha. `dub-languages.ts` isi mal_id se anime pages pe Hindi/Tamil/Telugu badges lagata hai, to wrong IDs = **galat anime pe galat language badge**. Sab IDs AniList `idMal` se verify karke fix kiye (Jikan/MAL API is sandbox se blocked tha).
   - **31 naye verified Crunchyroll Hindi titles** add: Dr. Stone (+New World, Science Future), The Apothecary Diaries, Kaiju No. 8 (H/T/Te), Dan Da Dan (H/T/Te), Gachiakuta (H/T/Te), Wind Breaker, Tower of God, The God of High School, Fire Force, Rent-a-Girlfriend, A Couple of Cuckoos (H/T/Te), Tsukimichi, SK8 the Infinity, Black Butler, Toilet-bound Hanako-kun, Campfire Cooking, Ranking of Kings, Zenshu, Berserk of Gluttony, The Red Ranger, Ameku M.D., Magic Maker, I'm Getting Married…, Heroines Run the Show, A Wild Last Boss Appeared!, Once Upon a Witch's Death, Your Name, Weathering With You, Suzume.
   - Kochikame ki duplicate poster (One Piece wali) fix; `lastUpdated` refresh.

7. **Internal linking across the three moat clusters**
   - Naya `src/lib/cross-links.ts` — watch-order ↔ filler ↔ Indian-dub surfaces ke curated cross-links. Slugs AniFiller dataset + `INDIAN_DUB_GUIDES` se verify kiye, isliye koi broken link nahi.
   - Watch-order detail page: "Skip filler" + "in Hindi" buttons. Filler page: watch-order + Hindi-dub buttons. Watch-order hub: filler / Indian-dub / dub-schedule band. IndiaHub: naya "Watch Orders" card.

### ⚠️ Baaki / manual (code se bahar)

5. **AniList rate-limit** — live pages pe kabhi "AniList is catching its breath" dikh jata hai. Fallback theek hai par user ko error lagta hai. Long-term: Prisma me zyada AniList data pre-cache karo (cron) taaki rate-limit se page blank na ho.
   - Evidence: `GET https://zyverse.in/anime/4181` → rate-limit fallback.
6. **robots.txt vs metadata mismatch** — `/posts/`, `/reels/`, `/creators/`, `/moments/`, `/polls/`, `/forum/` robots.txt me disallow hain, par unke metadata me `index: true`. Koi output nahi hai (disallow jeet jata hai) par confusing hai. Agli round: inhe bhi `noindex` karo ya disallow hatao.
7. **Bing indexing** — GSC + Bing Webmaster Tools dono me sitemap submit karo (Bing India me thoda traffic deta hai).
8. **Google News** — `/news/desk/*` ke liye Google News sitemap + Publisher Center application.

---

## 4. Har Hafta Routine (20 min)

### Monday — GSC
1. GSC → **Pages** → "Crawled/discovered - not indexed" count note karo.
2. GSC → **Performance** → sort by impressions. Top 10 pages → ya unme double down ya fix.
3. Naye pages ke liye URL Inspection → "Request indexing" (din me 15-25, zyada nahi).
4. Sitemap dobara submit (deploy ke baad).

### Mid-week — Distribution
- `distribution-kit.md` se is hafte ka 1 Reddit + 1 Telegram + 1 Reel chala do.
- `?utm_source=` ke saath link, taaki GA4 me channel pata chale.

### Friday — Analytics
- GA4 → Reports → Acquisition → kaunsa channel kitna traffic de raha hai.
- Top pages dekho. Jo page bounce kar raha hai uski copy fix karo.

### Weekly — Hindi dub freshness
- `/hindi-dub-schedule` har hafte update (data aaye toh).
- Update hote hi GSC me us URL ko re-index request + social share.

---

## 5. KPIs (track karo)

| KPI | Baseline | 30-day target | 90-day target |
|-----|----------|---------------|---------------|
| Organic impressions/day | | 500 | 5,000 |
| Organic clicks/day | | 20 | 200 |
| Indexed pages | | stable/badhe | +50% |
| Reddit/Telegram referrals/week | | 500 | 2,000 |
| Reels views/week | | 1,000 | 10,000 |
| Unique users/day (GA4) | | 150 | 1,000 |

> Success = **indexed pages up + traffic up**, features ki list nahi.

---

## 6. Guardrails (mat karna)

- ❌ Naye feature pages banane se pehle unke liye 3-4 unique sentences + 1 FAQ likho. Warna crawl budget waste.
- ❌ "millions"/"#1" type unverified claims. Google trust aur users dono ke liye kharab.
- ❌ noindex page ko sitemap me daalna.
- ❌ ek page ko multiple URLs (canonical issue) — har page ka ek hi canonical.
