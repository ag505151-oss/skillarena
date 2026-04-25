# SkillArena

An all-in-one platform for live coding interviews, real-time hackathons, and AI-powered mock tests.

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion, NextAuth
- **Backend**: Express.js, Prisma ORM, PostgreSQL, Socket.io
- **Integrations**: Judge0 (code execution), Daily.co (video), Stripe (payments), Resend (email), Cloudinary (uploads)
- **Infrastructure**: Vercel (frontend), Railway (backend), Neon (database), Upstash (Redis)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/skillarena.git
cd skillarena

# 2. Install dependencies
./pnpm install --config.store-dir=.pnpm-store-local --config.package-import-method=copy

# 3. Configure environment
cp .env.example .env
# Fill in your values in .env

# 4. Push database schema
DATABASE_URL="your-db-url" ./pnpm --filter @skillarena/db exec prisma db push

# 5. Seed demo data
DATABASE_URL="your-db-url" ./pnpm --filter @skillarena/api exec tsx src/scripts/seed.ts

# 6. Start development servers
./pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:4000

### Demo Accounts

| Role        | Email                          | Password     |
|-------------|-------------------------------|--------------|
| Candidate   | candidate@skillarena.dev      | Password@123 |
| Interviewer | interviewer@skillarena.dev    | Password@123 |
| Admin       | admin@skillarena.dev          | Password@123 |

## Project Structure

```
skillarena/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   └── api/          # Express.js backend
├── packages/
│   ├── db/           # Prisma schema + client
│   ├── types/        # Shared TypeScript types
│   ├── config/       # Shared config
│   └── utils/        # Shared utilities
└── docs/             # Documentation
```

## Deployment

| Service    | Platform  | Config file              |
|------------|-----------|--------------------------|
| Frontend   | Vercel    | `apps/web/vercel.json`   |
| Backend    | Railway   | `apps/api/railway.json`  |
| Database   | Neon      | Prisma schema            |
| Redis      | Upstash   | `REDIS_URL` env var      |

See `docs/DEPLOYMENT.md` for full deployment instructions.

## Environment Variables

Copy `.env.example` to `.env` and fill in all values. See `.env.example` for descriptions.

## License

MIT
