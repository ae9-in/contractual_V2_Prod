# Contractual

Two-sided freelance marketplace (Next.js App Router). **Public:** `/`, `/browse`, `/gig/[id]`, `/freelancer/[id]`. **Dashboards (auth required):** `/freelancer/*`, `/business/*`, `/admin/*`. Legacy `/gigs` and `/dashboard/*` URLs redirect to the new paths.

## Prerequisites

- Node.js 20+
- pnpm (recommended)

## Setup

```bash
pnpm install
cp .env.example .env.local
# Ensure .env has DATABASE_URL and AUTH_SECRET (see .env.example)
pnpm db:migrate   # or: npx prisma migrate dev
npx tsx prisma/seed.ts
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo auth (after seed)

| Role        | Email                          | Password     |
|------------|---------------------------------|--------------|
| Freelancer | `freelancer@demo.contractual`   | `password123` |
| Business   | `business@demo.contractual`     | `password123` |
| Admin      | `admin@demo.contractual`        | `password123` |

Protected routes use middleware: you must sign in to access `/freelancer`, `/business`, or `/admin` dashboards. Google OAuth is optional (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`).

## API (mock / integration)

- `POST /api/auth/register` — email/password signup (Zod-validated).
- `GET /api/me` — current session + home route by role.
- `POST /api/stripe/mock-checkout` — mock payment intent JSON (no real Stripe call).
- `GET /api/messages/poll` — mock realtime events (replace with Pusher/Socket.io).

## Data

- **UI demos:** `lib/mock-data.ts` (gigs, freelancers, charts).
- **Database:** Prisma + SQLite by default (`prisma/dev.db`). Switch `DATABASE_URL` to PostgreSQL for production.

```bash
pnpm db:studio
```

## Stack

Next.js 16, React 19, **NextAuth.js v5** (credentials + optional Google), Prisma 5, TanStack Query, Zustand (UI store), Tailwind v4, Framer Motion, shadcn/ui, Recharts, Sonner.

## Fonts

Playfair Display, DM Sans, JetBrains Mono — `app/layout.tsx`.
