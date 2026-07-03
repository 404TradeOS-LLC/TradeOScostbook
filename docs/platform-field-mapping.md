# Platform Field Mapping

How each field in `exports/platform/*.json` traces back to
`KnowledgeAssembly` (`app/modules/assemblies-database/knowledge/types.ts`)
and forward into TradeOS. Read `docs/prisma-gap-analysis.md` first for the
supported / JSON-metadata / new-schema / defer categorization this doc
builds on; read `docs/platform-import-contract.md` for the ordering and
validation rules that consume these mappings.

## `exports/platform/assemblies.json`

One entry per `KnowledgeAssembly`, exported close to verbatim (every source
field preserved) plus one derived field:

| Export field | Source | Notes |
|---|---|---|
| `tradeSlug` | derived from `trade` | kebab-case, e.g. `"Tree Service"` -> `"tree-service"`. Not present on the source record; added so a consumer can route/URL by trade without re-deriving the slug rule. |
| everything else | `KnowledgeAssembly`, unchanged | See the per-field table in `docs/prisma-gap-analysis.md` for where each one maps today. |

`id` is the stable identifier across every export file and across future
imports — see "ID preservation" in `docs/platform-import-contract.md`.

## `exports/platform/cost-items.json`

This is **not** a list of priced `CostItem` rows. It is the deduplicated
catalog of every `pricingHooks` entry across every exported assembly — the
placeholder pointers the knowledge folder's own README describes as "a
placeholder pointer to a future priced-catalog record." The file is named
`cost-items.json` per this task's required output list, but its records
cover all five `pricingHooks` kinds (`costItem`, `material`, `laborRate`,
`equipment`, `subcontractor`, `childAssembly`), not literally just
`costItem`-kind hooks — as of this export there are **zero** `costItem`-kind
hooks in the source data at all (see `manifest.json ->
recordCounts.pricingHooksByKind`). Splitting this into separate
`materials.json`/`labor.json`/`equipment.json` files was considered but
rejected: the task's required file list names exactly one hook-catalog
file, and inventing additional files not in that list would violate "do not
invent new formats." The `kind` field on each record is the discriminator a
future importer uses to route the entry.

| Export field | Source | Notes |
|---|---|---|
| `kind` | `AssemblyPricingHook.kind` | One of `costItem \| material \| laborRate \| equipment \| subcontractor \| childAssembly`. Routes the entry to the matching Prisma model in a future sync job. |
| `refSlug` | `AssemblyPricingHook.refSlug` | Human-readable handle, e.g. `tree-service.certified-climber`. **Not a Prisma id.** Reused verbatim across assemblies that share the same labor/equipment/material — see the dedup note below. |
| `description` | first-seen `AssemblyPricingHook.description` for this `(kind, refSlug)` pair | |
| `descriptionVariants` | present only if descriptions differ across occurrences of the same `(kind, refSlug)` | A non-empty value here is a data-quality flag for the next authoring batch — the knowledge folder's own README says these strings should be "reused verbatim," so any variant list is worth reconciling before the next batch, not silently importing both. |
| `estimatedUnitOfMeasure` | first-seen `AssemblyPricingHook.estimatedUnitOfMeasure` | |
| `occurrences` | derived | How many assembly records reference this exact `(kind, refSlug)`. |
| `referencedByAssemblyIds` | derived | Which assemblies reference it — the same edges also appear in `relationships.json -> assemblyPricingHookReferences`; kept here too so this file is independently useful without a join. |

Forward path into TradeOS (none of this is built yet — see
`docs/platform-runtime-bridge-plan.md`):

| `kind` | Eventual Prisma target |
|---|---|
| `costItem` | `CostItem` |
| `material` | `Material` |
| `laborRate` | `LaborRate` |
| `equipment` | `Equipment` |
| `subcontractor` | `Subcontractor` |
| `childAssembly` | `Assembly` (as a child, via `AssemblyItem.childAssemblyId`) |

## `exports/platform/relationships.json`

| Export field | Source | Notes |
|---|---|---|
| `assemblyDependencies[].fromAssemblyId` / `.toAssemblyId` | `KnowledgeAssembly.dependencies` | One edge per dependency-array entry. |
| `assemblyDependencies[].targetExistsInExport` | derived | `false` when `toAssemblyId` is a forward reference to an assembly not yet authored (tracked today in `docs/knowledge-engine/tree-service-progress.md`'s "Forward-reference IDs" section). As of this export, 4 of 25 edges are unresolved. |
| `assemblyPricingHookReferences[]` | `KnowledgeAssembly.pricingHooks` | Same `(assemblyId, kind, refSlug)` edges as `cost-items.json`'s `referencedByAssemblyIds`, in graph-edge shape instead of grouped-by-hook shape. |
| `unresolvedDependencyTargets` | derived | Deduplicated list of `toAssemblyId` values with no matching record in this export — a punch list for the next authoring batch, not an error. |

## `exports/platform/trades.json`

| Export field | Source | Notes |
|---|---|---|
| `trade` / `tradeSlug` | `KnowledgeAssembly.trade`, derived slug | |
| `assemblyCount` / `targetAssemblyCount` / `completionPct` | derived (count vs. the ~100/trade target in `prompts/agent-costbook-architect.md`) | |
| `categories[].category` / `.subcategories` / `.assemblyCount` | `KnowledgeAssembly.category` / `.subcategory` | Grouped and deduplicated. |
| `csiDivisions` | `KnowledgeAssembly.csiDivision` | Deduplicated, sorted; omits assemblies with no `csiDivision`. |

## `exports/platform/manifest.json`

See `docs/platform-import-contract.md` for how to use `importReadiness` and
`knownLimitations` before attempting any import, and
`docs/prisma-gap-analysis.md` for where the `prismaSchemaAlignmentPct`
sub-score's 5-of-31 count comes from.

## Fields with no export representation at all

Every `KnowledgeAssembly` field is exported somewhere (in `assemblies.json`
if nowhere more specific). Nothing was dropped. What's genuinely missing is
on the *target* side — see `docs/prisma-gap-analysis.md`'s "New Prisma
columns or tables" section for the seven field-groups that don't yet have
anywhere real to land in `app/prisma/schema.prisma`.
