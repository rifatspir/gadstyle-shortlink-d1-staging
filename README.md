# Gadstyle Shortlink Service

Next.js + Prisma + Neon-powered shortlink service for Gadstyle product, category, and brand sharing.

## Features
- Admin login and dashboard
- Create shortlinks for products, categories/sub-categories, and WoodMart `pa_brand` terms
- Public short URLs at `/s/{code}`
- Direct ID-based routes at `/p/{id}`, `/c/{id}`, and `/b/{id}`
- Click analytics stored in Neon via `ShortLink` and `ClickEvent`
- Safe website fallback using canonical Gadstyle URLs

## Environment
Copy `.env.example` and set:
- `DATABASE_URL`
- `DIRECT_URL`
- `APP_BASE_URL`
- `SESSION_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH` or `ADMIN_PASSWORD`

## Commands
- `npm install`
- `npm run prisma:generate`
- `npm run build`

## Database update for existing stable baseline
This build adds:
- `TargetType.brand`
- `RouteType.direct_brand`

Run your normal Prisma deploy step in production so Neon receives the new enum values:
- `npx prisma migrate deploy`

## Route contract
- `/s/{code}` → shared shortlink
- `/p/{id}` → product by stable product ID
- `/c/{id}` → category or deep nested sub-category by stable term ID
- `/b/{id}` → WoodMart `pa_brand` term by stable term ID


## Public shortlink API

- `POST /api/shortlinks` creates or reuses an active product/category/brand shortlink for Flutter sharing.
- `GET /api/shortlinks/resolve?code=...` resolves a short code into its target metadata.
- Shared routes stay on `app.gadstyle.com`, while website SEO stays on the canonical `www.gadstyle.com` URLs.


## Phase 3 staging env
- Add `SHORTLINK_API_BASE_URL=https://gadstyle-shortlink-worker.gadstyle.workers.dev` on the staging Vercel project to route public resolution/create requests through the Cloudflare Worker + D1 path.
- Keep the existing database variables during this phase because the admin dashboard list/stats still read from the current database.


## Phase 4
- Admin dashboard list/stats now prefer Worker+D1 when SHORTLINK_API_BASE_URL is set.
- Admin create writes directly to Worker+D1 in staging.


## Phase 4 Fix 1
- Accepts real Gadstyle item/category/brand URL formats in admin create form.
- Shows the first real validation error instead of a generic trusted-URL message.
- Keeps Worker + D1 staging path unchanged.
