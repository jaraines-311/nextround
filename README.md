# NextRound — AI-Powered Interview Preparation Platform

NextRound is a production-quality SaaS application that acts like a flight simulator for job interviews. It generates adaptive AI interview questions, supports voice and text modes, tracks AI Credit usage, and delivers detailed coaching feedback after every session.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Zustand, React Hook Form, Zod |
| Backend | NestJS, TypeScript, Prisma ORM, PostgreSQL |
| Database | Supabase PostgreSQL (or local Docker) |
| Payments | Stripe (subscriptions, one-time credit purchases) |
| AI | OpenAI GPT-4o or Anthropic Claude (configurable) |
| Storage | Supabase Storage |
| Monitoring | Sentry (frontend + backend) |
| Analytics | PostHog |
| Deployment | Vercel (frontend) · Render/Fly.io/Railway (backend) |

---

## Local Development (Docker Compose)

### 1. Clone the repo

```bash
git clone <your-repo-url> nextround
cd nextround
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your values. At minimum for local dev you need:
- `JWT_SECRET` — any random string
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` (optional — mock AI is used if absent)
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` (optional for billing features)

### 3. Start with Docker Compose

```bash
docker-compose up --build
```

This starts:
- PostgreSQL on port 5432
- NestJS backend on port 4000
- Next.js frontend on port 3000

### 4. Run database migrations and seed

```bash
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npm run prisma:seed
```

Seed creates:
- **Admin:** `admin@nextround.ai` / `Admin123!`
- **Demo:** `demo@nextround.ai` / `Demo123!`

---

## Manual Development Setup (without Docker)

### Backend

```bash
cd backend
npm install
cp ../env.example .env  # fill in DATABASE_URL etc.
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run start:dev
```

Backend runs at: `http://localhost:4000`  
Swagger docs: `http://localhost:4000/api/docs`

### Frontend

```bash
cd frontend
npm install
# Create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## Deployment

### Frontend → Vercel

1. Push your code to GitHub
2. Import the repo in Vercel
3. Set **Root Directory** to `frontend`
4. Add environment variables (see `.env.example` frontend section)
5. Deploy — Vercel creates preview deployments on every PR automatically

### Backend → Render / Fly.io / Railway

#### Render (recommended)

1. Create a new **Web Service** in Render
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. **Build command:** `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
5. **Start command:** `npm run start:prod`
6. Add all environment variables from `.env.example` (backend section)

#### Fly.io

```bash
cd backend
fly launch
fly secrets set DATABASE_URL=... JWT_SECRET=... # etc.
fly deploy
```

### Database → Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy the **Connection String** → set as `DATABASE_URL` in your backend env
3. Run migrations: `npx prisma migrate deploy`
4. Create a storage bucket named `nextround-resumes`

---

## Stripe Configuration

### 1. Create products and prices

In the Stripe dashboard, create:
- **Pro** subscription product — $9.99/month → copy price ID to `STRIPE_PRO_PRICE_ID`
- **Premium** subscription product — $19.99/month → copy to `STRIPE_PREMIUM_PRICE_ID`
- **1,000 Credits** one-time product — $4.99 → `STRIPE_CREDITS_1000_PRICE_ID`
- **5,000 Credits** one-time product — $19.99 → `STRIPE_CREDITS_5000_PRICE_ID`
- **10,000 Credits** one-time product — $34.99 → `STRIPE_CREDITS_10000_PRICE_ID`

### 2. Configure webhooks

In Stripe dashboard → Developers → Webhooks → Add endpoint:
- URL: `https://your-backend-url.com/api/v1/webhooks/stripe`
- Events to listen for:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `checkout.session.completed`
  - `invoice.payment_succeeded`
- Copy the signing secret → `STRIPE_WEBHOOK_SECRET`

### 3. Test webhooks locally

```bash
stripe listen --forward-to localhost:4000/api/v1/webhooks/stripe
```

---

## AI Provider Configuration

### OpenAI (default)

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o  # optional, defaults to gpt-4o
```

### Anthropic

```bash
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022  # optional
```

### Mock (no API key needed)

If neither key is configured, the platform automatically uses mock AI responses. This lets you develop locally without any AI costs.

---

## AI Credits System

NextRound uses an internal credit system so users never see token counts.

| Feature | Default Cost |
|---|---|
| Voice interview (per turn) | 50 credits |
| Feedback report | 100 credits |
| Question generation | 20 credits |
| Resume analysis | 75 credits |
| Job description analysis | 50 credits |

### Plan allocations

| Plan | Monthly Credits | Max Balance |
|---|---|---|
| Free | 1,500 (one-time signup) | N/A |
| Pro ($9.99/mo) | 5,000 | 10,000 |
| Premium ($19.99/mo) | 15,000 | 30,000 |

Unused subscription credits roll over up to `MAX_CREDIT_MULTIPLIER` × monthly allocation.  
Purchased credits never expire and are not subject to rollover limits.

---

## Monitoring

### Sentry

1. Create a project at [sentry.io](https://sentry.io)
2. Add `SENTRY_DSN_BACKEND` to backend env
3. Add `NEXT_PUBLIC_SENTRY_DSN` to frontend env

### PostHog

1. Create a project at [posthog.com](https://posthog.com)
2. Add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` to frontend env

---

## Admin Access

The admin account (set by `ADMIN_EMAIL`) gets:
- Unlimited AI credits
- Access to `/admin/analytics` dashboard
- Ability to adjust user credit balances

**Free Forever accounts** (users who sign up with `FREE_FOREVER_ACCESS_CODE`):
- Premium feature access
- Unlimited AI credits
- No Stripe subscription required

---

## Project Structure

```
nextround/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # All database models
│   │   └── seed.ts             # Admin + demo seed data
│   └── src/
│       ├── modules/
│       │   ├── auth/           # JWT auth, registration, password reset
│       │   ├── users/          # User management
│       │   ├── candidate-profile/  # Candidate profile CRUD
│       │   ├── resume/         # Resume upload + AI parsing
│       │   ├── jobs/           # Job description + AI parsing
│       │   ├── interviews/     # Interview sessions + adaptive questioning
│       │   ├── feedback/       # AI-generated feedback reports
│       │   ├── ai/             # Provider abstraction (OpenAI/Anthropic/Mock)
│       │   ├── billing/        # Stripe integration + webhooks
│       │   ├── credits/        # AI Credit accounting
│       │   └── analytics/      # Admin analytics dashboard
│       ├── common/             # Guards, decorators, filters
│       ├── config/             # Configuration
│       └── prisma/             # Prisma service
├── frontend/
│   └── src/
│       ├── app/                # Next.js App Router pages
│       ├── components/         # Shared UI components
│       └── lib/
│           ├── api/            # API client + typed endpoints
│           └── store/          # Zustand auth store
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## API Documentation

Swagger UI is available at: `http://localhost:4000/api/docs`

All endpoints are prefixed with `/api/v1`. Authentication uses Bearer JWT tokens.

---

## Database Models

| Model | Description |
|---|---|
| `User` | Core user with role and billing override |
| `CandidateProfile` | Skills, experience, target roles |
| `Resume` | Stored resumes with AI-parsed skills |
| `Job` | Job descriptions with parsed metadata |
| `InterviewSession` | Interview session with mode and type |
| `InterviewTurn` | Individual Q&A turns within a session |
| `FeedbackReport` | AI-generated scores and coaching |
| `Subscription` | Stripe subscription state |
| `CreditBalance` | Current credit balances |
| `CreditTransaction` | Full audit trail of credit movements |
| `CreditGrant` | Monthly/initial credit grants |
| `CreditPurchase` | One-time credit purchase records |
| `UsageEvent` | Per-feature AI usage tracking |
| `PromptTemplate` | Editable prompt templates |

---

## Supported Interview Types

- Recruiter Screen
- Hiring Manager Interview
- Technical Interview
- Behavioral Interview

## Supported Industries

- Software Engineering ✅ (optimized)
- Data Engineering ✅ (optimized)
- Product Management
- Sales
- Marketing
- Customer Success
- Other
