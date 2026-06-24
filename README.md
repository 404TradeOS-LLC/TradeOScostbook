# TradeOS Cost Book

A cloud-based estimating and pricing system for trade contractors (general construction, remodeling, decks, roofing, concrete, excavation, landscaping, fencing, plumbing, HVAC, electrical).

## Planning Documents

- [`docs/TradeOS-CostBook-Architecture.docx`](docs/TradeOS-CostBook-Architecture.docx) — full architecture, formulas, database design, V1 category content, pricing-update strategy, roadmap, and competitive analysis.
- [`docs/TradeOS-CostBook-Wireframe-Module-Spec.docx`](docs/TradeOS-CostBook-Wireframe-Module-Spec.docx) — MVP wiretree/sitemap, page-by-page UI annotations, primary user flows, and a detailed spec for all 12 system modules.

## Code

The MVP backend (Phase 1) is implemented in [`app/`](app/) — see [`app/README.md`](app/README.md) for setup, migrations, seeding, and how to run the core estimate → proposal loop end-to-end. It is a Node.js/TypeScript/Express API backed by PostgreSQL/Supabase via Prisma, implementing the Cost Database, Labor Database, Material Database, Equipment Database, Assemblies Database, Estimate Engine, Proposal Generator, and Admin Dashboard modules. A lightweight internal admin page for membership history is also available at `/admin/member-history`.

No frontend exists yet — the MVP roadmap defers the React/TypeScript UI until the backend and core logic are validated (see `app/README.md`'s "Not Yet Implemented" section).

## Structure

```
.github/workflows/deploy-migrations.yml   CI/CD entry point for production migration rollout
docs/                                 Planning, architecture, wireframe & module spec documents
app/                                  MVP backend — Express API, Prisma schema, module services, tests
  api/                                 Routes, controllers, middleware
  db/                                  Prisma client singleton, seed script
  modules/                            One folder per core module (types.ts + service.ts)
  prisma/schema.prisma                 ORM schema
  prisma/migrations/                   Tracked migration history (source of truth for schema + RLS)
  scripts/deploy-migrations.sh         Production migration rollout automation
  tests/                                Jest test suite
```

## Status

Phase 1 (MVP) backend implemented — no full frontend yet. Bearer-token auth, organization membership checks, request-scoped database sessions, and forced PostgreSQL RLS policies are now in place as the Phase 2 foundation. See the architecture doc for the roadmap and `app/README.md` for deployment details and remaining work.
