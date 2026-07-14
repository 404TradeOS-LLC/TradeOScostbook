# Platform Import Contract

What the TradeOS application should consume from `packages/knowledge-engine/exports/authored-content/`, in
what order, and what it should validate before trusting any of it. This is
a contract for a future consumer — no importer exists in `app/` yet (see
`packages/knowledge-engine/docs/authored-content/platform-runtime-bridge-plan.md` for the plan to build one).

## Before anything else: read `manifest.json`

Every consumer should load `packages/knowledge-engine/exports/authored-content/manifest.json` first and check
three things before touching any other file:

1. `schemaVersions.platformExportContractVersion` matches a version this
   consumer knows how to read (this document describes `"1.0.0"`).
2. `importReadiness.score` and `importReadiness.recommendation` — as of
   this export, the score is in the 30s-40s range and the recommendation is
   explicitly **not ready for automated/unattended import**. A consumer
   that skips this check and writes straight to Prisma is going against the
   export's own stated guidance.
3. `knownLimitations` — read every entry. In particular, the unresolved
   dependency target list and the "no `costItem`-kind hooks exist yet"
   limitation should shape what a first import attempt even tries to do.

## Which files to consume

| File | Consume for |
|---|---|
| `manifest.json` | Gating/readiness check (above). Always read first. |
| `trades.json` | Populating a trade/category picker before drilling into individual assemblies — cheaper than scanning all of `assemblies.json` for this. |
| `assemblies.json` | The actual content — narrative fields, classification, inputs, safety/risk/compliance text, `proposalIntelligence`, production notes. This is the file an "install this template" or "AI intake context" feature would read from. |
| `cost-items.json` | The deduplicated pricing-hook catalog — the checklist of what a real per-org catalog would eventually need (`refSlug` -> real `CostItem`/`Material`/`LaborRate`/`Equipment`/`Subcontractor`/`Assembly`). Not consumed for pricing today since nothing here is priced. |
| `relationships.json` | Building a "related work" / bundling suggestion feature (`assemblyDependencies`), or auditing which pricing hooks a given assembly needs (`assemblyPricingHookReferences`) without re-scanning `assemblies.json`. |

## How IDs are preserved

`KnowledgeAssembly.id` (e.g.
`tree-service.removal.small-tree-open-access`) is the one stable identifier
threaded through every export file — it appears verbatim in
`assemblies.json` records, `relationships.json`'s `fromAssemblyId` /
`toAssemblyId` / `assemblyPricingHookReferences[].assemblyId`, and
`cost-items.json`'s `referencedByAssemblyIds`. A consumer can safely use
this id as a stable cross-file join key and, per
`packages/knowledge-engine/docs/authored-content/prisma-gap-analysis.md`, as the value for `Assembly.code` if and when
a knowledge assembly is materialized into a real org's catalog (subject to
that org not already having a `code` collision — not possible today since
every knowledge id is globally unique).

`pricingHooks[].refSlug` (e.g. `tree-service.certified-climber`) is the
second identifier a consumer must track, but it is explicitly **not** a
Prisma id — see `packages/knowledge-engine/docs/authored-content/platform-field-mapping.md`'s `cost-items.json`
section. Treat it as a lookup key into a future org-scoped
find-or-create step, never as something to write directly into a foreign
key column.

## Import order

If a consumer does proceed past the readiness gate (e.g. for a supervised,
human-reviewed import rather than an automated one), the dependency
direction is:

1. **`trades.json`** — establishes which trades/categories exist before
   anything references them.
2. **`assemblies.json`** — the assembly records themselves. Import order
   within this file does not matter on its own (records don't reference
   each other via foreign key at this stage), but see validation order
   below for why dependency edges change this in practice.
3. **`relationships.json`** — only after all referenced assemblies from
   step 2 exist, since `assemblyDependencies` edges point at other
   assembly ids that must already be resolvable.
4. **`cost-items.json`** — last, since resolving a `pricingHooks` entry to
   a real catalog row is the piece of work most likely to require human
   judgment (which existing `Material`/`LaborRate`/`Equipment`/
   `Subcontractor` row does `tree-service.certified-climber` actually map
   to in *this* org's catalog, if any) and should not block the rest of the
   import.

## Validation order

Run these checks in this order and stop at the first failure category
(don't attempt partial repair automatically):

1. **Schema/version check** — `manifest.json`'s
   `schemaVersions.platformExportContractVersion` and
   `sourceKnowledgeAssemblySchemaVersion` (from `assemblies.json`) are both
   versions this importer understands.
2. **Uniqueness** — every `assemblies.json[].id` is unique (already
   guaranteed by the source registry, but a defensive importer should not
   assume that forever).
3. **Referential integrity of dependency edges** — for every
   `relationships.json -> assemblyDependencies` edge, decide what to do
   with `targetExistsInExport: false` edges *before* import: either (a)
   import anyway and leave a dangling reference for a later batch to
   resolve (recommended — this is exactly what
   `packages/knowledge-engine/docs/authored-content/tree-service-progress.md` already tracks as
   planned future batches, not a defect), or (b) strip unresolved edges at
   import time and re-add them once the target assembly exists. Do not
   silently drop the whole source assembly because one of its dependency
   edges is unresolved.
4. **Pricing hook resolution** — for every `cost-items.json` entry, a human
   reviewer (not an automated matcher) confirms whether an existing
   `Material`/`LaborRate`/`Equipment`/`Subcontractor`/`CostItem` row in the
   target org already represents this `refSlug`, or whether a new one
   should be created. This is the step `importReadiness.components
   .pricingHookResolutionPct: 0` is flagging as entirely unstarted — treat
   every hook as unresolved until a human says otherwise.
5. **Content completeness** — spot-check that narrative fields
   (`description`, `proposalIntelligence.*`, `productionNotes`, etc.)
   render sensibly wherever they'll be surfaced (estimate builder, AI
   intake prompt, a future template browser) — the export's own
   `contentCompletenessPct` is 100% today, but that only confirms fields
   are non-empty, not that they read well in a specific UI context.

## Which fields map to existing vs. future Prisma models

Full detail lives in `packages/knowledge-engine/docs/authored-content/prisma-gap-analysis.md`. Summary: 5 of 31
`KnowledgeAssembly` field-groups (`id`/`slug` -> `Assembly.code`, `name`,
`unitOfMeasure`, `description`) map onto existing columns with zero schema
change. The rest need either a new generic JSON metadata column (17
field-groups — cheap, unlocks storage but not querying) or dedicated new
schema work (7 field-groups — `constructionPhase`, `csiDivision`,
`requiredInputs`/`optionalInputs`, `dependencies`, `proposalIntelligence`,
`pricingHooks`). 2 field-groups (`version`, `aiNotes`) are deferred with no
consumer yet.

## What can be stored in JSON metadata for now

Anything in the gap analysis's "JSON metadata (now)" bucket can be
losslessly parked, unqueried, in a single new `metadata Json?` column added
to `Assembly` — **if and when** that column is added (it does not exist
today, and adding it is Prisma-schema work explicitly out of scope for this
task). Until that column exists, the only safe place for this content is
**outside Prisma entirely** — as the standalone `packages/knowledge-engine/exports/authored-content/*.json`
files themselves, read by the application at runtime as a bundled reference
dataset rather than persisted per-org. See
`packages/knowledge-engine/docs/authored-content/platform-runtime-bridge-plan.md`'s "Phase A" for why this is the
recommended starting point rather than rushing to a schema change.
