# Infrastructure Recommendations for 1M Concurrent Users

## Current Limitations

| Component | Current | Required | Gap |
|-----------|---------|----------|-----|
| **Database** | SQLite (file-based) | PostgreSQL (connection-pooled) | SQLite cannot handle concurrent writes; max ~64KB writes per transaction |
| **Rate Limiter** | In-memory Map | Redis (distributed) | In-memory resets on server restart; doesn't scale across instances |
| **Session Store** | JWT-only | Redis + JWT | No session invalidation possible |
| **Caching** | None (except in-memory AniList cache) | Redis + CDN | Every request hits origin; no edge caching |
| **Image Hosting** | External URLs | CDN with optimization | No image optimization/resizing pipeline |
| **Search** | Array.filter() on static data | Meilisearch/Elasticsearch | O(n) search on every request |
| **File Storage** | Local filesystem | S3-compatible object storage | Not scalable across instances |

## Recommended Architecture

```
                         ┌─────────────┐
                         │   CDN/CDN   │  ← Cloudflare, Fastly, or AWS CloudFront
                         │ (static +   │    with cache rules per route
                         │  API cache) │
                         └──────┬──────┘
                                │
                         ┌──────┴──────┐
                         │  Load       │  ← ALB / Nginx / HAProxy
                         │  Balancer   │
                         └──────┬──────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
              ┌─────┴─────┐ ┌──┴───┐ ┌─────┴─────┐
              │ Next.js   │ │Next.js│ │ Next.js   │  ← Horizontal pod
              │ Instance 1│ │  n    │ │ Instance N│    auto-scaling
              └─────┬─────┘ └──┬───┘ └─────┬─────┘
                    │           │           │
                    └───────────┼───────────┘
                                │
                    ┌───────────┴───────────┐
                    │       Redis           │  ← ElastiCache / Upstash
                    │  - Rate limiter       │    (rate limit, session,
                    │  - Session store      │     cache, pub/sub)
                    │  - Cache (API)        │
                    │  - Pub/Sub            │
                    └───────────┬───────────┘
                                │
                    ┌───────────┴───────────┐
                    │     PostgreSQL        │  ← RDS / Aurora Serverless
                    │  - Connection pool    │    with read replicas
                    │  - Read replicas      │
                    └───────────────────────┘
```

## Migration Steps

### Step 1: Database (SQLite → PostgreSQL)
- Replace Prisma provider from `sqlite` to `postgresql`
- Update `DATABASE_URL` in env
- Run `npx prisma migrate dev` to generate migration
- Use `pgBouncer` for connection pooling
- Set up read replicas for list/stats endpoints

### Step 2: Caching (add Redis)
```env
REDIS_URL=redis://...  # Upstash or ElastiCache
```

### Step 3: CDN
- Add Cloudflare or similar in front
- Cache static assets with 1y TTL
- Cache API responses with short TTL (30s–5min depending on endpoint)
- Strip cookies on cached responses

### Step 4: Horizontal Scaling
- Containerize with Docker
- Deploy on Kubernetes or AWS ECS with HPA
- Set min: 3 pods, max: 20 pods
- CPU-based auto-scaling at 70%

## Priority Order
1. **PostgreSQL** — critical; SQLite will fail under any concurrent load
2. **Redis** — enables distributed rate limiting + caching
3. **CDN** — reduces origin load by 80%
4. **Horizontal scaling** — handles traffic spikes
5. **Search index** — Meilisearch per route (doujinshi, conventions, voice-actors)
