# ZyniVerse SEO Action Plan

Goal: traffic + revenue abhi (2-3 months), Google indexing 3-6 mahine mein compound hoga.

## Part 1: Top 30 Low-Competition Keywords

Priority = impact × winnability. Sab keywords English (Google search language).

### FILLER (sabse strong niche — AniFiller jaise chhote sites inhe rank karte hain)

| # | Keyword | Target URL | Priority |
|---|---------|-----------|----------|
| 1 | naruto filler list | /filler/naruto | HIGH |
| 2 | one piece filler episodes | /filler/one-piece | HIGH |
| 3 | bleach filler list | /filler/bleach | HIGH |
| 4 | naruto shippuden filler episodes | /filler/naruto-shippuden | HIGH |
| 5 | black clover filler list | /filler/black-clover | HIGH |
| 6 | boruto filler episodes | /filler/boruto-naruto-next-generations | HIGH |
| 7 | dragon ball z filler | /filler/dragon-ball-z | HIGH |
| 8 | fairy tail filler list | /filler/fairy-tail | HIGH |
| 9 | hunter x hunter filler episodes | /filler/hunter-x-hunter | MED |
| 10 | jujutsu kaisen filler | /anime/1535/filler | MED |
| 11 | attack on titan filler | /filler/attack-on-titan | MED |
| 12 | how long to watch naruto without filler | /tools/filler-time | MED |

### WATCH ORDER (unique content — low competition, high intent)

| # | Keyword | Target URL | Priority |
|---|---------|-----------|----------|
| 13 | rezero watch order | /watch-order/rezero | HIGH |
| 14 | monogatari series watch order | /watch-order/monogatari | HIGH |
| 15 | fate series watch order | /watch-order/fate | HIGH |
| 16 | sword art online watch order | /watch-order/sao | HIGH |
| 17 | jojo watch order | /watch-order/jojo | HIGH |
| 18 | evangelion watch order | /watch-order/evangelion | HIGH |
| 19 | steins gate watch order | /watch-order/steins-gate | HIGH |
| 20 | attack on titan watch order | /watch-order/aot | MED |
| 21 | made in abyss watch order | /watch-order/made-in-abyss | MED |
| 22 | toaru railgun watch order | /watch-order/toaru | MED |

### INDIA NICHE (koi competition nahi — aapka unique advantage)

| # | Keyword | Target URL | Priority |
|---|---------|-----------|----------|
| 23 | indian anime voice actors | /voice-actors/indian | HIGH |
| 24 | hindi dub anime list | /indian-dubs | HIGH |
| 25 | anime conventions india 2026 | /conventions | HIGH |
| 26 | anime expo india | /events | MED |
| 27 | comic con india 2026 anime | /events (new page banake) | MED |

### TOP / SEASONAL / TOOLS (news-relevant, quick wins)

| # | Keyword | Target URL | Priority |
|---|---------|-----------|----------|
| 28 | top 100 anime of all time | /top-anime | MED |
| 29 | [current month] [year] anime premieres | /seasonal | MED |
| 30 | anime binge calculator | /tools/binge-calculator | LOW |

> Naya event aate hi (alert system wahi karega) → turant `/events/[slug]` page + request indexing.
> Blog likhna hai toh wahi 30 keywords ke aas-paas "how to watch X without filler" type posts.

## Part 2: Request-Indexing Checklist (GSC)

Roz 15 min. Do this 1st week ALWAYS:

1. **Sitemap resubmit** → GSC → Sitemaps → zyverse.in/sitemap.xml → Submit (deploy ke baad)
2. **URL Inspection me request bhejo** (max 20-30/day — limit hai):
   - https://zyverse.in
   - /filler/naruto, /filler/one-piece, /filler/bleach, /filler/naruto-shippuden
   - /watch-order/rezero, /watch-order/monogatari, /watch-order/fate
   - /indian-dubs, /voice-actors/indian, /conventions
   - Top 5 blog posts
   - 2 har roz naye pages (blog/navaye events) — GSC → URL Inspection → paste → "Request indexing"
3. **Pages report check** → GSC → Pages → "Crawled - currently not indexed" → kisi interesting page ko "Validate fix" ya request
4. **Performance > Pages** → sort by impressions → jo pages 1-2 impressions de rahe hain unhe request karo
5. Week 2 se alternate din; week 4 se hafte mein 2 baar.

### 2 hafte baad check:
- Indexing report me "Valid" count badh raha hai?
- Agar nahi: content problem hai. Template pages pe 2-3 unique sentences + 1 FAQ add karo (filler pages pe per-anime notes).

## Part 3: Traffic Abhi (Google ke bina — isse ad revenue start hoga)

### Reddit (sabse fast) — copy-paste ready
- **r/anime**: post "I built a free tool that shows which episodes are filler for 180+ anime + a watch-order guide" — link /filler
- **r/animesuggest**: "Need filler-free experience? Made a free filler list + binge time calculator"
- **r/AnimeFiller**: exact audience
- Rule: answer helpful question pehle, post baad. Reddit self-promo 10% max.

### Discord + WhatsApp/Telegram
- Anime Discords ke #resources me list karao
- Indian anime groups me /indian-dubs, /voice-actors/indian share karo

### Events (alert system ke sath)
- Event announce hote hi page + community share. "Comic Con Hyderabad" walon ko turant share karo.

### Revenue short-term
- **Amazon affiliate**: /merch, /figures, /light-novels pe affiliate links pehle se hain — Reddit/Discord traffic inhe click karega = paisa bina Google ke
- **Premium**: community features sell karo
- **AdSense apply** jab 15-20k pageviews/month pe pahuncho (abhi pehle traffic)

## Part 4: File Changes Is Round
- `src/app/api/cron/event-alerts/route.ts` — naya (events pe users ko notify)
- `vercel.json` — daily 05:00 UTC cron (10:30 IST)
- `src/components/NotificationList.tsx` — EVENT tab + icon
- `src/app/sitemap.ts` — dedupe + /search hatao
- `/search`, `/tags`, `/a-z`, `/genre/[name]` — noindex
