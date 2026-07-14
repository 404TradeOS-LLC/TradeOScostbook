# Construction Knowledge Engine — Assembly Content Layer

This folder holds the rich, trade-by-trade assembly content described in
`packages/knowledge-engine/prompts/agents/agent-costbook-architect-typescript-authoring.md`.
It is intentionally **separate** from the runtime, org-scoped, priced catalog
(`Assembly` / `AssemblyItem` / `CostItem` / `Material` / `LaborRate` /
`Equipment` in `app/prisma/schema.prisma`).

## Location and status (read this first)

This content originated as a standalone TypeScript authoring pass and
initially lived under `app/modules/assemblies-database/knowledge/`. It has
been relocated here, under `packages/knowledge-engine/`, for two reasons:

1. **It isn't runtime module code.** It has no `orgId`, is not read by any
   request path, and doesn't touch the `assemblies-database` module's
   actual runtime files (`service.ts`/`types.ts`). Living inside that
   module's folder incorrectly implied runtime-module ownership and
   triggered `docs/DOC_OWNERSHIP.yml`'s cost-book rule (which requires
   `docs/modules/cost-book.md`/`docs/API_REFERENCE.md`/`docs/CURRENT_STATE.md`
   updates for any change under `app/modules/assemblies-database/**`) even
   though nothing here affects cost-book runtime behavior.
2. **`packages/knowledge-engine/` is the established home for all
   knowledge-engine content** — see its top-level `docs/README.md`. Nothing
   in `docs/DOC_OWNERSHIP.yml` governs paths under `packages/`, so this
   content-authoring layer belongs alongside the engine's other content,
   not inside the live application tree.

**Important: this is a second, independent tree-service authoring pass.**
`packages/knowledge-engine/knowledge/knowledge/assemblies/tree-service/` and
`packages/knowledge-engine/review/pending/tree_service_batch_1.json` already
contain a *different* tree-service dataset (UUID ids, a flatter
array-of-strings schema, apparently pipeline/AI-generated) covering
overlapping ground (removal tiers, stump grinding, hazard trees, emergency
storm cleanup). Neither dataset is wired into the live
`packages/knowledge-engine/exports/json/costbook.json` that
`app/modules/knowledge-runtime` actually consumes today — both are inert.
**Reconciling the two tree-service datasets (dedup, pick-one-or-merge, or
keep both with a documented precedence rule) is separate future work, not
done as part of this relocation.**

## Why a separate layer instead of new Prisma columns

The Cost Book Architect prompt explicitly forbids modifying the Prisma
schema. Independent of that constraint, the runtime `Assembly` model is
deliberately thin (`id, orgId, code, name, unitOfMeasure, description,
isTemplate, isActive`) — it exists to compose priced `CostItem`/child-`Assembly`
rows into a sellable unit, not to carry narrative content. Bolting 25+ new
fields (scope of work, risk factors, permit awareness, AI notes, ...) onto a
row that Estimate Builder reads on every quote would also make every org's
copy of a shared "Tree Service knowledge base" diverge the moment one org
edits it — there is no cross-tenant template mechanism today (a `NULL`
`org_id` row is invisible under forced RLS to every tenant; see
`docs/rolling-todo.md`).

So this content lives as **versioned, typed, trade-scoped data** here, not as
tenant data in Postgres. It has no `orgId` and is not read by any request
path today.

## Schema

See `types.ts` for the full `KnowledgeAssembly` interface. In short, each
record captures identity (id/slug/version/trade/category/subcategory/name),
narrative content (description/customerDescription/contractorNotes/
typicalUseCase), classification (projectTypes/constructionPhase/csiDivision),
required/optional inputs an intake flow would collect, material/labor/
equipment *categories* (not priced line items), safety/risk/permit/
inspection/code awareness, dependencies on other assemblies, waste/disposal
notes, "proposal intelligence" (scope of work / assumptions / exclusions /
warranty — mirroring the field names already used on the real `Proposal`
model, so a future sync step can map 1:1), production notes, and AI notes.

## Pricing hooks are placeholders, not foreign keys

Each record's `pricingHooks` array names the *kind* of priced-catalog row a
future sync step should find-or-create (a `CostItem`, `Material`,
`LaborRate`, `Equipment`, or child `Assembly`) and a human-readable
`refSlug` — e.g. `{ kind: "laborRate", refSlug: "tree-service.climber", ... }`.
Nothing here is a real Prisma ID. Wiring a `refSlug` to an actual per-org
`LaborRate.id` (or creating one) is future work for a sync/import job that
does not exist yet — deliberately out of scope for this content-authoring
pass, since it would require touching the runtime seed/import path. See
`packages/knowledge-engine/exports/authored-content/manifest.json`'s
`importReadiness` block for the current resolution status (0% resolved as
of this writing).

## Layout

```
packages/knowledge-engine/authored-content/
  types.ts                 KnowledgeAssembly and supporting types
  registry.ts               listTrades()/listByTrade()/getById() over all trades
  trades/
    tree-service/
      batch-01.ts            assemblies 1-10 (Tree Removal fundamentals)
      index.ts                concatenates all batches for the trade
```

## Adding a batch

1. Add `trades/<trade-slug>/batch-NN.ts` exporting a `KnowledgeAssembly[]`
   of exactly 10 records (id format: `<trade-slug>.<category-slug>.<name-slug>`).
2. Re-export it from `trades/<trade-slug>/index.ts`.
3. Review the *whole trade so far* for duplicates, naming drift, and
   consistency in required inputs / assumptions / exclusions / production
   notes before starting the next batch — do not proceed on a batch that
   isn't internally consistent with what came before it.
4. Record batch completion in
   `packages/knowledge-engine/docs/authored-content/<trade-slug>-progress.md`.
