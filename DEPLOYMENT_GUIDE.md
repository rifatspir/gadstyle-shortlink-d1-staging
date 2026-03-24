# Deployment Guide

This file mirrors the final chat instructions so the project stays self-contained.

## Neon
1. Create a Neon project.
2. Copy pooled connection string into `DATABASE_URL`.
3. Copy direct connection string into `DIRECT_URL`.

## Vercel
1. Import the GitHub repository.
2. Add all environment variables.
3. Deploy.
4. Add `app.gadstyle.com` in Project Settings → Domains.
5. Point DNS as Vercel instructs.

## First login
1. Open `/login`.
2. Use `ADMIN_USERNAME` and the original password matching your bcrypt hash.
