# thAir-AI Production Deployment

## Prerequisites

- [GitHub account](https://github.com)
- [Vercel account](https://vercel.com)
- [Supabase project](https://supabase.com) (PostgreSQL + Auth + pgvector)
- [Stripe account](https://stripe.com) (for billing)
- [OpenAI API key](https://platform.openai.com)

## 1. Provision Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Enable the `pgvector` extension in the SQL Editor
3. Run the migrations in order:

```bash
# Via Supabase SQL Editor or psql
psql -f apps/web/supabase/migrations/001_initial.sql
psql -f apps/web/supabase/migrations/002_rag_vector_search.sql
```

4. Copy your Project URL and `anon public` key
5. Copy your `service_role` key (for server-side only, never expose to browser)

## 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp apps/web/.env.example apps/web/.env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXTAUTH_URL` | Your app URL (e.g. https://thair-ai.vercel.app) |
| `NEXTAUTH_SECRET` | Random string (run `openssl rand -base64 32`) |
| `OPENAI_API_KEY` | OpenAI API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_PRO` | Stripe price ID for Pro plan |
| `STRIPE_PRICE_ENTERPRISE` | Stripe price ID for Enterprise |

**Never commit `.env` files.**

## 3. Deploy to Vercel

### Option A: GitHub Integration (Recommended)

1. Push this repository to GitHub
2. In Vercel, click "Add New Project" → Import your `thAir-ai` repo
3. Set the Root Directory to `apps/web`
4. Add all environment variables from `.env.example`
5. Click Deploy

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

## 4. Configure Stripe Webhook

1. In your Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
3. Select events: `checkout.session.completed`
4. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

## 5. Production Verification Checklist

- [ ] Production build succeeds (`next build`)
- [ ] User can register and log in
- [ ] User can create an AI Agent
- [ ] User can chat with an Agent (streaming works)
- [ ] Conversation history persists
- [ ] Knowledge document upload works
- [ ] RAG retrieval returns relevant chunks
- [ ] Usage and token consumption are recorded
- [ ] Agent configurations persist
- [ ] Users cannot access another organization's private data (RLS)
- [ ] Environment variables are configured correctly
- [ ] `.env` is not committed to git

## 6. Local Development

```bash
# Infrastructure
docker-compose -f docker/docker-compose.yml up -d

# Web app
cd apps/web
cp .env.example .env
# Fill in Supabase + OpenAI keys
npm install
npm run dev
```

Visit http://localhost:3000

## 7. Architecture Summary

| Layer | Component | Technology |
|-------|-----------|------------|
| L1 User Experience | Web App | Next.js 14, Tailwind, shadcn/ui |
| L2 AI Platform | Agent Builder, API Gateway | Next.js Route Handlers |
| L3 Intelligence | LLM Gateway, RAG | OpenAI API, pgvector |
| L4 Data & Integration | PostgreSQL, Vector Storage | Supabase, pgvector |
| L5 Infrastructure | Auth, Hosting | Supabase Auth, Vercel |

## Security Notes

- Supabase Row Level Security (RLS) enforces organization-level isolation
- API keys are stored server-side only (never exposed to browser)
- Stripe webhook signatures are verified
- File uploads are validated by type
- Error messages never expose internal details
