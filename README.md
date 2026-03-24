# Gadstyle Shortlink Service

Next.js shortlink frontend for Gadstyle.

## Stable production routing contract
- `/p/{id}`
- `/c/{id}`
- `/b/{id}`
- `/s/{code}`

Routing stays ID-based. No slug-based dependency is introduced.

## Phase 5 production cutover
This build is the production cutover package for:
- Vercel frontend -> Cloudflare Worker API -> Cloudflare D1

## Required env
- `APP_BASE_URL`
- `SESSION_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH` or `ADMIN_PASSWORD`
- `SHORTLINK_API_BASE_URL`

## Rollback-safe env guidance
Keep the existing Neon/Postgres env variables during the first production rollout so rollback remains simple.
This build can now boot in Worker+D1 mode as long as `SHORTLINK_API_BASE_URL` is set, even if `DATABASE_URL` is later removed.

## Production cutover test checklist
1. Login at `/admin`
2. Create a new product shortlink
3. Confirm the new row appears in admin
4. Open `/s/{code}`
5. Open `/p/{id}`
6. Open `/c/{id}`
7. Open `/b/{id}`
8. Confirm website fallback opens the correct `www.gadstyle.com` URL

## Rollback
If you do not like the D1 setup, restore the old production env / project path and redeploy.
