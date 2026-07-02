# TradeOS Cost Book

A cloud-based estimating and pricing system for trade contractors (general construction, remodeling, decks, roofing, concrete, excavation, landscaping, fencing, plumbing, HVAC, electrical).

## Planning Documents

- [`docs/TradeOS-CostBook-Architecture.docx`](docs/TradeOS-CostBook-Architecture.docx) — full architecture, formulas, database design, V1 category content, pricing-update strategy, roadmap, and competitive analysis.
- [`docs/TradeOS-CostBook-Wireframe-Module-Spec.docx`](docs/TradeOS-CostBook-Wireframe-Module-Spec.docx) — MVP wiretree/sitemap, page-by-page UI annotations, primary user flows, and a detailed spec for all 12 system modules.

## Code

The MVP backend (Phase 1) is implemented in [`app/`](app/) — see [`app/README.md`](app/README.md) for setup, migrations, seeding, and how to run the core estimate → proposal loop end-to-end. It is a Node.js/TypeScript/Express API backed by PostgreSQL/Supabase via Prisma, implementing the Cost Database, Labor Database, Material Database, Equipment Database, Assemblies Database, Estimate Engine, Proposal Generator, and Admin Dashboard modules. A lightweight internal admin page for membership history is also available at `/admin/member-history`.

A Next.js front-end has started in [`web/`](web/) — see [`web/README.md`](web/README.md) for setup. It implements Phase 1 (auth shell: sign-up/sign-in, a protected dashboard, and a typed API client) of [`docs/frontend-platform-completion-plan.md`](docs/frontend-platform-completion-plan.md).

## Structure

```
.github/workflows/deploy-migrations.yml   CI/CD entry point for production migration rollout
docs/                                 Planning, architecture, wireframe & module spec documents, front-end completion plan
app/                                  MVP backend — Express API, Prisma schema, module services, tests
  backend/                             Routes, controllers, middleware, auth
  db/                                  Prisma client singleton, seed script
  modules/                            One folder per core module (types.ts + service.ts)
  prisma/schema.prisma                 ORM schema
  prisma/migrations/                   Tracked migration history (source of truth for schema + RLS)
  scripts/deploy-migrations.sh         Production migration rollout automation
  tests/                                Jest test suite
web/                                  Next.js (App Router) front-end — auth shell, typed API client, TanStack Query
```

## Status

Backend (Phase 0/1 of the original MVP roadmap) is implemented: bearer-token auth (including real email/password sign-up/sign-in), organization membership checks, request-scoped database sessions, forced PostgreSQL RLS policies, and Proposal/Invoice/Contract entities with status lifecycles. A Next.js front-end shell now exists in `web/` covering auth end-to-end. See `docs/frontend-platform-completion-plan.md` for the remaining front-end/CRM/AI roadmap and `app/README.md` for backend deployment details.
