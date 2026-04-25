FROM node:20-alpine AS base
RUN npm install -g pnpm@10.33.2

# ── Install dependencies ──────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
COPY packages/utils/package.json ./packages/utils/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

# ── Build shared packages ─────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
COPY tsconfig.base.json ./
RUN pnpm --filter @skillarena/db build
RUN pnpm --filter @skillarena/types build
RUN pnpm --filter @skillarena/config build || true
RUN pnpm --filter @skillarena/utils build || true
RUN pnpm --filter @skillarena/api build

# ── Production image ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN npm install -g pnpm@10.33.2
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/.npmrc ./
COPY --from=builder /app/packages/ ./packages/
COPY --from=builder /app/apps/api/ ./apps/api/
COPY --from=builder /app/node_modules/ ./node_modules/

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "apps/api/dist/server.js"]
