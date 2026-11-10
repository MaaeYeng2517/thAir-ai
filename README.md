# thAir-AI — AI Ecosystem Platform

Build · Connect · Orchestrate · Intelligence

## Platform Architecture

| Layer | Component | Technology |
|-------|-----------|------------|
| L1 User Experience | Web App · Mobile App · Developer Portal · Admin | Next.js, React |
| L2 AI Platform | Agent Builder · Workflow · Multi-Agent · API Gateway | Next.js, Laravel, FastAPI |
| L3 Intelligence | LLM · RAG · Memory · Context Engineering · MCP | FastAPI, LlamaIndex, LangChain |
| L4 Data & Integration | Vector DB · PostgreSQL · Knowledge Base · External API | Qdrant, PostgreSQL, MinIO |
| L5 Infrastructure | Cloud · Worker · Queue · Storage · Security · Monitoring | Docker, Redis, Temporal, OpenTelemetry |

## Products

- **thAir-AI Studio** — Agent Builder & Design
- **thAir-AI Brain** — Intelligence & Context Engine
- **thAir-AI Knowledge** — RAG & Knowledge Management
- **thAir-AI Connect** — MCP, API & Integrations
- **thAir-AI Flow** — Workflow Automation
- **thAir-AI Team** — Multi-Agent System
- **thAir-AI Monitor** — Observability & Evaluation
- **thAir-AI Cloud** — Hosting & SaaS Infrastructure

## Monorepo Layout

```
thAir-ai/
  apps/
    web/    # Next.js frontend (Studio, Dashboard, Portal, Landing)
    api/    # Laravel 13 backend (Auth, Billing, API Gateway)
    ai/     # Python FastAPI (LLM Gateway, RAG, Agent Runtime)
    landing/# Static marketing landing page
  packages/
    ui/     # Shared React UI components
    types/  # Shared TypeScript types
    config/ # Shared configuration
  docker/
    docker-compose.yml  # Infrastructure services
```

## Getting Started

```bash
# Infrastructure
docker-compose up -d

# Web (Next.js)
cd apps/web && npm install && npm run dev

# API (Laravel)
cd apps/api && composer install && php artisan serve

# AI (FastAPI)
cd apps/ai && pip install -r requirements.txt && uvicorn main:app --reload
```

## Roadmap

1. **Phase 1: Foundation** — Membership, API Gateway, LLM Gateway, Database, Billing
2. **Phase 2: AI Core** — Agent Engine, RAG, Memory, Context Engineering
3. **Phase 3: AI Builder** — Visual Agent Builder, Workflow Engine
4. **Phase 4: AI Ecosystem** — MCP, Multi-Agent, Marketplace, Developer API
5. **Phase 5: Enterprise** — Observability, Security, Tenant Isolation, Scaling, SLA
