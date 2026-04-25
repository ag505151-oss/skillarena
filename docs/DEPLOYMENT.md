# Deployment Guide

## Frontend (Vercel)

- Import repo
- Root directory: `apps/web`
- Build command: `pnpm build`
- Output: `.next`
- Environment variables:
  - `NEXT_PUBLIC_API_BASE_URL`
  - `NEXTAUTH_URL`
  - `NEXTAUTH_SECRET`
  - OAuth client ids/secrets

## Backend (Railway)

- Root directory: `apps/api`
- Build command: `pnpm build`
- Start command: `pnpm start`
- Environment variables:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `FRONTEND_URL`
  - `JUDGE0_API_URL`
  - `JUDGE0_API_KEY`
  - `REDIS_URL` (when enabling BullMQ workers)

## First deploy migration/seed

Run once from CI or shell:

```bash
pnpm --filter @skillarena/db exec prisma db push --accept-data-loss
pnpm --filter @skillarena/api exec tsx src/scripts/seed.ts
```

## Production checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```
