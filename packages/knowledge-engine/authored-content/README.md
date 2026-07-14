# Construction Knowledge Engine — Assembly Content Layer

This folder holds the rich, trade-by-trade assembly content described in
`prompts/agent-costbook-architect.md`. It is intentionally **separate** from
the runtime, org-scoped, priced catalog (`Assembly` / `AssemblyItem` /
`CostItem` / `Material` / `LaborRate` / `Equipment` in `app/prisma/schema.prisma`).

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
pass, since it would require touching the runtime seed/import path.

## Layout

```
knowledge/
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
4. Record batch completion in `docs/knowledge-engine/<trade-slug>-progress.md`.
