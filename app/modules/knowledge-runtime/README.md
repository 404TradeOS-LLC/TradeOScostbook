# Knowledge Runtime Bridge

## Purpose

This module is a **bridge layer**, not a data source. It exists to give the
main TradeOS application (this `app/` package — org-scoped, RLS-enforced,
Prisma-backed) a single, typed, testable seam through which it will
eventually consume the **Construction Knowledge Engine**: a separately
authored, versioned, trade-by-trade content layer (assembly scope of work,
required inputs, risk factors, proposal narrative, etc.) that is not tenant
data and does not live in this app's Postgres database.

Nothing in this module talks to a database, an HTTP API, or the knowledge
engine's actual content yet. Every service method is a typed stub. That is
intentional — see "What remains to be implemented" below.

## Why a bridge instead of a direct dependency

The Construction Knowledge Engine's content (see its own `README.md`, once
merged, for the full rationale) is deliberately kept separate from the
runtime `Assembly`/`CostItem` Prisma models: it is unversioned-per-tenant,
narrative-heavy content, not a priced catalog row. That separation means
the main app cannot just `import` the engine's registry and start calling
it — some translation is always required:

- Knowledge-side records are identified by a stable `slug`, not a runtime
  Prisma `id`.
- Knowledge-side records are not org-scoped; runtime records are (and are
  subject to forced Row-Level Security).
- A knowledge assembly's `pricingHooks` are placeholders (a `kind` and a
  human-readable `refSlug`), not real foreign keys — matching them to an
  actual `CostItem`/`Material`/`LaborRate`/`Equipment`/`Assembly` row in a
  given org's catalog is exactly the kind of lookup this bridge exists to
  encapsulate.

Putting that translation in one module means every future caller (an
Estimate Builder "suggest an assembly" feature, an AI intake flow, proposal
narrative generation) depends on one typed contract instead of each
reaching into the knowledge engine's content shape directly.

## How this differs from the Knowledge Engine itself

| | Construction Knowledge Engine | Knowledge Runtime Bridge (this module) |
|---|---|---|
| What it is | Authored content: trade-scoped assembly records (scope, risk, narrative, pricing hooks) | A typed service/repository seam that will read from that content and from this app's runtime data |
| Where it lives | Its own content module (versioned, not org-scoped) | `app/modules/knowledge-runtime/` |
| Does it touch Postgres / Prisma? | No | No, not yet — and only ever read-only against the existing runtime models when implemented |
| Does it know about orgs / RLS? | No | Yes — every search/match method takes an `orgId`, because runtime-side lookups are always org-scoped |
| Is it done? | Being built independently, trade by trade | Scaffolding only: types, interfaces, and stub methods |

## Structure

- `types.ts` — shared domain types this module speaks in: knowledge-side
  summaries (`KnowledgeAssemblySummary`), runtime-side summaries
  (`RuntimeAssemblySummary`, `RuntimeCostItemSummary`), search results
  (`AssemblyMatch`, `CostItemMatch`), scope matching
  (`ScopeMatchResult`), and higher-level context bags
  (`EstimateContext`, `ProposalContext`).
- `interfaces.ts` — repository/search contracts (`AssemblyRepository`,
  `CostItemRepository`, `KnowledgeSearch`) that a future adapter will
  implement. `KnowledgeRuntimeService` depends on these interfaces, not on
  concrete implementations.
- `service.ts` — `KnowledgeRuntimeService`, the single entry point future
  callers should depend on. Every method is a typed stub that throws
  `NotImplementedError`.
- `repository.ts` — placeholder implementations of the `interfaces.ts`
  contracts (`NotImplementedAssemblyRepository`, etc.) so
  `KnowledgeRuntimeService` can be constructed today without a real data
  source wired in.
- `mapper.ts` — pure functions for converting between this module's types
  (e.g. building a `ProposalNarrativeBlock` from a matched assembly).
- `errors.ts` — this module's own error types (`NotImplementedError`,
  `KnowledgeRecordNotFoundError`, `RuntimeRecordNotFoundError`), kept
  separate from the app's HTTP-facing `ApiError` since this module has no
  routes yet.

See `docs/knowledge-runtime-bridge.md` for the broader architecture and
integration guidance for future callers.

## What remains to be implemented

This is scaffolding, not a working feature. In particular:

- **A real `KnowledgeSearch` implementation.** Nothing here imports the
  Construction Knowledge Engine's actual content module yet — it is still
  under construction independently. A real implementation will wrap that
  engine's own registry (e.g. list-by-trade / get-by-slug) and project its
  richer authoring schema down to `KnowledgeAssemblySummary`.
- **Real `AssemblyRepository` / `CostItemRepository` implementations**
  backed by this app's existing, Prisma-backed
  `app/modules/assemblies-database` and `app/modules/cost-database`
  services — read-only, org-scoped, RLS-respecting.
- **Actual search/matching logic** in `KnowledgeRuntimeService` (currently
  every method throws `NotImplementedError`), including how `matchScope`
  resolves a `refSlug` pricing hook to a real runtime record and how
  relevance scoring works for `searchAssemblies`/`searchCostItems`.
- **Wider `KnowledgeAssemblySummary` projection.** The current summary
  omits several fields the full knowledge engine schema has (risk factors,
  permit awareness, production notes, and the full `ProposalIntelligence`
  block) because `buildProposalContext`/`toProposalNarrativeBlock` don't
  need them yet in stub form; widen this once real narrative content needs
  to flow through.
- **No routes or controllers.** This module is not mounted anywhere. HTTP
  exposure (if any) is a separate, later decision.
