# Knowledge Runtime Bridge — Architecture

## Context

TradeOS's main application (`app/`) is an org-scoped, RLS-enforced,
Prisma-backed API. Separately, a **Construction Knowledge Engine** is being
authored: versioned, trade-by-trade content describing what an assembly
actually is (scope of work, required inputs, risk factors, permit/code
awareness, proposal narrative, and placeholder "pricing hooks" pointing at
the *kind* of priced catalog record it would need). That content is
deliberately not tenant data and does not live in this app's database.

Before any feature can connect the two — an Estimate Builder "suggest an
assembly" search, an AI intake flow, automated proposal narrative — there
needs to be a single, typed seam between them. That seam is
`app/modules/knowledge-runtime/`. This document describes its structure
and the patterns future work in this area should follow.

## Module structure

```
app/modules/knowledge-runtime/
  types.ts         Shared domain types (both knowledge-side and runtime-side)
  interfaces.ts    Repository/search contracts (no implementation)
  service.ts       KnowledgeRuntimeService — typed stubs, the intended entry point
  repository.ts    Placeholder ("not implemented") adapters satisfying interfaces.ts
  mapper.ts        Pure conversion functions between this module's own types
  errors.ts        This module's error types
  README.md        Module-level purpose/scope/status
```

Nothing here performs I/O today. `KnowledgeRuntimeService`'s methods all
throw `NotImplementedError`. This is deliberate scaffolding: the goal of
this pass was to settle the *shape* of the bridge, not to build the
matching/search logic behind it.

## Interfaces defined

- **`AssemblyRepository` / `CostItemRepository`** (`interfaces.ts`) — read
  access to this app's existing, org-scoped, Prisma-backed catalogs
  (`app/modules/assemblies-database`, `app/modules/cost-database`).
  Deliberately read-only and deliberately abstract: `KnowledgeRuntimeService`
  depends on these interfaces, never on a Prisma client or a concrete
  service class directly, so it can be unit tested against fakes.
- **`KnowledgeSearch`** (`interfaces.ts`) — read access to the Construction
  Knowledge Engine's content. An eventual implementation wraps that
  engine's own registry (list-by-trade, get-by-slug) and projects its
  records down to `KnowledgeAssemblySummary`.
- **`AssemblyMatch` / `CostItemMatch`** (`types.ts`) — a search hit plus a
  relevance score and the fields it matched on. Used by
  `searchAssemblies`/`searchCostItems`.
- **`ScopeMatchResult`** (`types.ts`) — the result of resolving a knowledge
  assembly's placeholder `pricingHooks` against an org's real catalog:
  which hooks resolved to a runtime `CostItem`/`Assembly`, and which
  `refSlug`s did not (a gap a caller may want to surface to an estimator).
- **`EstimateContext` / `ProposalContext`** (`types.ts`) — the two
  higher-level context bags this bridge is meant to eventually assemble:
  candidate assemblies plus scope-match results for building an estimate,
  and narrative content (scope/assumptions/exclusions/warranty) per
  matched assembly for drafting a proposal.

## How future modules should interact with the knowledge runtime

1. **Only through `KnowledgeRuntimeService`.** A future Estimate Builder
   feature, AI intake flow, or proposal-drafting flow should depend on this
   service's typed methods (`searchAssemblies`, `matchScope`,
   `buildEstimateContext`, etc.), not on the knowledge engine's content
   module or a Prisma client directly. This keeps the translation logic in
   one place and keeps callers testable against the same interfaces this
   module already defines.
2. **Always pass `orgId`.** Every search/match method is org-scoped on the
   runtime side, matching how the rest of this app enforces tenant
   isolation via RLS. A caller should never bypass that by reaching into
   `AssemblyRepository`/`CostItemRepository` directly with an
   un-scoped query.
3. **Treat pricing hooks as advisory, not authoritative.** `ScopeMatchResult`
   distinguishes "resolved" from "unresolved" hooks on purpose — a future
   caller (e.g. an Estimate Builder "quick add" flow) should decide what to
   do with an unresolved hook (prompt the estimator, skip it, flag it for
   review), not assume every hook always resolves.
4. **Extend, don't bypass, the summary types.** If a future feature needs a
   knowledge-engine field not currently in `KnowledgeAssemblySummary` (e.g.
   `riskFactors` for a safety-review feature), widen that type and the
   corresponding `KnowledgeSearch` implementation, rather than having a
   caller import the knowledge engine's full record type directly.

## Assumptions and patterns to follow

- **This module never imports the knowledge engine's content module
  directly yet.** That module is under construction independently and its
  shape may still change; taking a hard dependency on it before it
  stabilizes would create churn in both directions. When it's ready, only
  a `KnowledgeSearch` implementation (in a new file, e.g.
  `repository.ts`'s eventual real counterpart, or a dedicated adapter file)
  should need to import it.
- **This module never imports Prisma or the request-scoped database
  session (`app/db/requestSession.ts`) directly either.** Runtime-side
  reads should go through the existing `assemblies-database`/
  `cost-database` module services (or their own repository-style seams),
  preserving this app's existing RLS/request-session model rather than
  opening a second path to the database.
- **Stub methods throw, they don't return empty/fake data.** A method that
  silently returned `[]` or `null` before real logic exists could be
  mistaken for "searched and found nothing" by a caller. Throwing
  `NotImplementedError` makes the unfinished state impossible to miss.
- **Read-only, for now.** Every interface in this module is a read path.
  If a future feature needs to write back to the knowledge engine (e.g.
  logging which assemblies were actually used) or to the runtime catalog
  (e.g. auto-creating a missing `CostItem` from an unresolved pricing
  hook), that is new scope requiring its own design discussion — not an
  extension to slot quietly into the existing read interfaces.
