# Gadstyle Shortlink Service

Next.js shortlink frontend for Gadstyle.

## Stable production routing contract
- `/p/{id}`
- `/c/{id}`
- `/b/{id}`
- `/s/{code}`

Routing stays ID-based. No slug-based dependency is introduced.

## Locked production architecture
- Vercel frontend -> Cloudflare Worker API -> Cloudflare D1
- Neon / Postgres / Prisma are not part of the live production shortlink flow.

## Required env
- `APP_BASE_URL`
- `SESSION_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH` or `ADMIN_PASSWORD`
- `SHORTLINK_API_BASE_URL`

## Production checklist
1. Login at `/admin`
2. Create a new product shortlink
3. Confirm the new row appears in admin
4. Open `/s/{code}`
5. Open `/p/{id}`
6. Open `/c/{id}`
7. Open `/b/{id}`
8. Confirm website fallback opens the correct `www.gadstyle.com` URL
