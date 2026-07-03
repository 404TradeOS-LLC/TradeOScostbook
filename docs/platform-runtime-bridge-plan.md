# Platform Runtime Bridge Plan

How the TradeOS runtime should eventually call the Construction Knowledge
Engine, phased from "no schema change, no write path" to "fully wired
pricing sync." Nothing described here is built yet — this is a plan, not an
implementation. No frontend, backend route, or Prisma schema file was
touched to write it.

## Two ways the runtime could read this content (and which one to use)

The whole `knowledge/` folder (`types.ts`, `registry.ts`,
`trades/tree-service/*.ts`) has **zero external dependencies** — no Prisma
import, no Express import, nothing. That means the backend could read it
two different ways:

1. **Direct in-process import** — `import { listAll } from
   "modules/assemblies-database/knowledge/registry"` straight from a
   controller. Zero latency, always in sync with source, but ties the
   knowledge content's size/growth directly to every backend deploy, and
   bypasses the versioned export contract entirely (no `manifest.json`
   readiness gate, no stable snapshot to point a non-Node consumer at).
2. **Read the generated `exports/platform/*.json` snapshot** — decoupled
   from the source TypeScript, versioned via
   `manifest.json.exportVersion`, cacheable, and usable by any future
   non-Node consumer (a static CDN-hosted copy, a separate content service,
   a mobile client) without needing the TypeScript source at all.

**Recommendation: use the generated export, not the direct import**, via a
small `KnowledgeCatalogBridge` module in the backend. The whole point of
running `pipelines/export/generate-platform-exports.ts` as a real pipeline
step (rather than just importing the registry ad hoc) is to make the
export — not the raw source module — the actual integration boundary. That
keeps "what the runtime is allowed to depend on" identical to "what this
task's import contract already documents," and means the readiness gate in
`manifest.json` is something the runtime can actually check at startup
before trusting the content, the same way any other consumer would.

## What the bridge looks like

A read-only backend module (not built yet) that:

- Loads `exports/platform/manifest.json`, `trades.json`, `assemblies.json`,
  `relationships.json`, and `cost-items.json` at startup (or on a cache-bust
  signal), refusing to serve content if `manifest.json`'s
  `platformExportContractVersion` doesn't match what the bridge expects.
- Exposes read-only lookups mirroring `registry.ts`'s own shape
  (`listTrades()`, `listByTrade(trade)`, `getById(id)`) so callers don't
  need to know whether the bridge is backed by the JSON export or (in a
  later phase) a database-cached copy of it.
- Is explicitly **not** org-scoped and does not go through
  `runWithRequestDatabaseSession`/RLS — this content has no `orgId` (see
  the knowledge folder's own README) and isn't tenant data. It's global
  reference content, closer to a static asset than a database row, until a
  future phase materializes a per-org copy.

## How assemblies and cost items get retrieved through the bridge

- **Assemblies**: `GET`-shaped reads only, e.g. "give me every Tree Service
  assembly in the Pruning category" or "give me assembly
  `tree-service.stump-grinding.standard-stump-grinding` by id" — served
  straight from the bridge's in-memory copy of `assemblies.json`, no
  database round trip.
- **Cost items (pricing hooks)**: read-only today too — "what pricing hooks
  does this assembly need" (`cost-items.json` / `relationships.json
  -> assemblyPricingHookReferences`). The bridge does **not** attempt to
  resolve a `refSlug` to a real `Material`/`LaborRate`/`Equipment`/
  `Subcontractor`/`CostItem` row automatically — see Phase C below for why
  that's deliberately deferred, and `docs/platform-import-contract.md`'s
  validation-order section for why a human belongs in that loop.

## How estimation and proposals will eventually consume this

Two concrete, already-existing integration points in this codebase make the
target shape clear:

- **`app/modules/project-intake/`** already has a hardcoded `Trade` union
  that includes `"Tree Service"` (`types.ts`), a keyword-based classifier
  (`classifier.ts`) that maps free-text scope to a trade + a generic
  `projectType`/`category` pair, and a **per-trade, hand-written**
  `FieldCheck[]` array (`questions.ts`) — e.g. Tree Service's questions
  today are just "tree count," "stump grinding scope," "tree species."
  Compare that to a single Knowledge Engine record like
  `tree-service.removal.medium-tree-open-access`, whose `requiredInputs`
  already captures `dbhInches`, `treeHeightFt`, `canopySpreadFt`, and
  `aerialLiftAccessible` — a materially richer, *per-category* (not just
  per-trade) question set, plus a `proposalIntelligence` block
  (`scopeOfWork`/`assumptions`/`exclusions`/`warranty`) that
  `project-intake`'s own `IntakeProposalDraft` type already has matching
  field names for (`scopeOfWork`/`assumptions`/`exclusions`/`timeline`).
  Once a trade is classified, the bridge is the natural next call:
  "given trade = Tree Service and whatever category signal exists in the
  transcript, fetch the matching `KnowledgeAssembly` (or short-list of
  candidates) and use its `requiredInputs` as this session's follow-up
  questions and its `proposalIntelligence` as the draft's starting point,"
  instead of the current fixed, trade-wide question list.
- **Estimate Builder / Assembly templates** (`Assembly.isTemplate`, added to
  the runtime schema for a different reason — quick-adding common
  assemblies to an estimate) is the natural landing spot for a future
  "install this knowledge assembly into my org's catalog" action: copy
  `name`/`unitOfMeasure`/`description` directly (already-supported fields,
  per `docs/prisma-gap-analysis.md`), set `isTemplate = true`, and leave
  `AssemblyItem` rows to be built manually against the `pricingHooks`
  checklist until Phase C exists.

## Phased plan

- **Phase A — read-only reference bundle (this task).** Generate the
  versioned export, document the contract and field mapping. No runtime
  code changes. Done.
- **Phase B — bridge + intake integration.** Build the
  `KnowledgeCatalogBridge` module and read-only endpoints (e.g. `GET
  /api/v1/knowledge/trades`, `GET /api/v1/knowledge/assemblies/:id`) that
  serve straight from the bundled export. Wire `project-intake`'s
  classifier to call the bridge for a richer per-category question set once
  a trade is known, as a supplement to (not replacement of) its existing
  hand-written `TRADE_FIELDS`. No Prisma schema change required for this
  phase — it's a pure read path.
- **Phase C — pricing hook resolution.** A supervised (human-in-the-loop,
  per the import contract's validation order) sync job that, per org,
  resolves each `pricingHooks` entry to a real `Material`/`LaborRate`/
  `Equipment`/`Subcontractor`/`CostItem` row — find existing or propose
  creating new. This is real Prisma-schema-adjacent work (at minimum, a new
  join/audit table recording each org's `refSlug -> real id` resolutions)
  and should be scoped as its own follow-up task, not folded into this one.
- **Phase D — "install this template" write path.** Materialize a chosen
  `KnowledgeAssembly` into a real org `Assembly` (+ `AssemblyItem` rows
  built from its now-resolved `pricingHooks`, from Phase C). This is the
  only phase that writes org-scoped data derived from the Knowledge Engine,
  and depends entirely on Phase C existing first.

Each phase is additive — Phase B ships useful value (better intake
questions) with zero schema risk, well before Phases C/D's real pricing
integration work needs to be scoped or scheduled.
