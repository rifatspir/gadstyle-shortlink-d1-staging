# Phase 3 Hardening Guide

## Goal
Keep the live Vercel shortlink frontend locked to:
- Vercel frontend -> Cloudflare Worker API -> Cloudflare D1

## Keep unchanged
- public routes stay exactly:
  - `/p/{id}`
  - `/c/{id}`
  - `/b/{id}`
  - `/s/{code}`
- Flutter deeplink handling stays unchanged
- Worker URL remains the active API backend

## Production env
Set these on the live Vercel shortlink project:
- `APP_BASE_URL`
- `SESSION_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH`
- `SHORTLINK_API_BASE_URL=https://gadstyle-shortlink-worker.gadstyle.workers.dev`

## Deploy order
1. Upload this zip to the live shortlink frontend repo/project
2. Confirm `SHORTLINK_API_BASE_URL` is set on the live Vercel project
3. Redeploy production
4. Test live routes

## Live test checklist
1. `/admin` loads
2. Create one new shortlink
3. `/s/{code}` resolves
4. `/p/{id}` resolves
5. `/c/{id}` resolves
6. `/b/{id}` resolves
7. Website fallback goes to the correct Gadstyle website URL
