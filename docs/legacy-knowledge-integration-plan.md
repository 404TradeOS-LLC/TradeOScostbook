# Legacy Knowledge Engine Integration Plan

**Status:** Planning + typed bridge only. No real data has been imported and no
existing TradeOS module has been modified. This sprint's deliverables are this
document, `docs/knowledge-engine-import-checklist.md`, and two new type-only
files under `app/modules/knowledge-runtime/`.

**Scope constraint:** work for this sprint was restricted to
`app/modules/knowledge-runtime/`, `app/modules/cost-database/`,
`app/modules/assemblies-database/`, and `docs/`. Frontend UI, auth, the Prisma
schema, the proposal engine, project-intake, production data, and the
Knowledge Engine's own source were explicitly out of bounds. Nothing outside
`docs/` and the new `knowledge-runtime` module was changed.

## 1. What "legacy Knowledge Engine" means here

No reference to a Knowledge Engine exists anywhere in this repository today —
not in `docs/`, not in `app/modules/`, not in the Prisma schema. A repo-wide
search for "knowledge" turned up nothing prior to this sprint's own new files.
This plan therefore treats the Knowledge Engine as an **external legacy
system** whose export shape is not yet confirmed, and designs a bridge layer
around the five categories of data the mission brief names: cost items,
assemblies, relationships, trades/taxonomy, and metadata.

**This is a planning hypothesis, not a confirmed contract.** The types in
`platformExportTypes.ts` are TradeOS's best guess at what a legacy export
bundle would need to contain to map cleanly onto the existing Cost Database /
Assemblies Database schema. Before any real import runs, these types must be
reconciled against an actual export sample from the Knowledge Engine — see
[Open questions](#6-open-questions) below.

## 2. Audit of current TradeOS state

Reviewed to build this plan (read-only, no changes):

- `app/modules/cost-database/{types.ts,service.ts}`
- `app/modules/assemblies-database/{types.ts,service.ts}`
- `app/modules/project-intake/types.ts` (for the existing `Trade` taxonomy precedent)
- `app/prisma/schema.prisma` (models `Division`, `Category`, `Subcategory`, `CostItem`, `Assembly`, `AssemblyItem`, `LaborRate`, `Material`, `Equipment`, `Subcontractor`, `Region`, `Supplier`, `Organization`)
- `docs/frontend-platform-completion-plan.md` (for related-but-distinct AI-assisted-estimating scope, see [Section 7](#7-relationship-to-ai-assisted-estimating))
- `app/modules/knowledge-runtime/` — did not exist prior to this sprint

### 2.1 TradeOS's existing cost/assembly data model

```
Division (org-scoped, nullable orgId for system defaults)
  -> Category
      -> Subcategory
          -> CostItem (references LaborRate?, Material?, Equipment?, Subcontractor?)

Assembly (org-scoped)
  -> AssemblyItem (references exactly one of CostItem or a child Assembly, + quantityPerUnit)
```

Key properties worth preserving in any bridge design:

- **Org scoping is nullable-permissive, not nullable-shared.** `orgId` is
  optional on `Division`/`Region`/`Material`/etc., but forced RLS means a
  `NULL` `org_id` row is invisible to every tenant (`org_id =
  current_app_org_id()` is never true for `NULL`). There is no working
  cross-tenant shared catalog today — this was already discovered and
  documented for `Assembly.isTemplate`. Any Knowledge Engine import must
  target a specific org, not attempt a "shared library" import.
- **Pricing is composed, not duplicated.** A `CostItem`'s unit cost is
  computed on demand from whichever of `laborRateId`/`materialId`/
  `equipmentId` it references (`CostDatabaseService.getUnitCost`), and an
  `Assembly`'s unit cost recursively sums its `AssemblyItem`s
  (`AssembliesDatabaseService.getAssemblyUnitCost`). An import must map
  legacy cost items into references to labor rates/materials/equipment (or
  create them), never write a precomputed price directly onto a `CostItem`
  row — there is no such column.
- **No existing "trade" field on `CostItem` or `Assembly`.** Trade currently
  lives on `LaborRate.trade` and `Subcontractor.trade` (free-text strings)
  and, separately, on `project-intake`'s closed `Trade` union (23 fixed
  values: Deck, Roofing, Bathroom Remodel, ... Demolition). These are three
  independent trade concepts today, not one taxonomy. A legacy "trade"
  export needs an explicit reconciliation decision (see
  [Section 4](#4-what-needs-prisma-changes-later)), not a silent fourth
  taxonomy.
- **No generic metadata/JSON column exists on `CostItem`, `Assembly`, or
  `AssemblyItem`.** The only `Json` columns in the schema today are
  audit/snapshot fields (`OrganizationMembershipAudit.beforeState`/
  `afterState`) and project-intake fields (`measurementsJson`,
  `aiQuestionsJson`, `missingInfoJson`, `intakeResultJson`) — all
  purpose-built for their own module, not a generic extension point. A
  Knowledge Engine metadata bridge cannot silently attach data to existing
  rows without a schema change.

## 3. What can map today (no schema changes required)

These map directly onto existing, unchanged Prisma models and existing
service methods:

| Legacy concept | Maps to | Existing entry point |
|---|---|---|
| Taxonomy node (division/category/subcategory level) | `Division` / `Category` / `Subcategory` | `CostDatabaseService.createDivision/createCategory/createSubcategory` |
| Cost item (code, name, unit, production rate, notes) | `CostItem` | `CostDatabaseService.create` |
| Cost item's labor/material/equipment reference | `CostItem.laborRateId/materialId/equipmentId` | `CostDatabaseService.create`/`.update` (reference only — the referenced `LaborRate`/`Material`/`Equipment` rows must already exist or be created first) |
| Assembly (code, name, unit, description, template flag) | `Assembly` | `AssembliesDatabaseService.create` |
| Assembly-contains-cost-item relationship | `AssemblyItem` with `costItemId` | `AssembliesDatabaseService.addAssemblyItem` |
| Assembly-contains-assembly relationship (nested assemblies) | `AssemblyItem` with `childAssemblyId` | `AssembliesDatabaseService.addAssemblyItem` (already cycle-guarded via `assertNoCycle`) |

This is why `importer.ts` validates exactly these four categories today
(taxonomy, cost items, assemblies, relationships) — they're the only parts of
the bridge that could plausibly become real writes without any other
TradeOS module changing first.

## 4. What needs Prisma changes later

These are real gaps, not just missing glue code — a schema change (out of
scope this sprint) is a prerequisite, not an implementation detail:

1. **Trade/taxonomy reconciliation.** TradeOS has three independent
   trade-shaped fields today (`LaborRate.trade`, `Subcontractor.trade` as
   free text; project-intake's closed 23-value `Trade` union). A Knowledge
   Engine "trade" taxonomy needs a decision: extend project-intake's `Trade`
   union to be the canonical list (risky — that type is explicitly
   off-limits this sprint, being inside `project-intake`), add a genuinely
   new `trade` taxonomy table, or map legacy trades into the existing
   Division/Category hierarchy as just another taxonomy level. This plan
   models it provisionally as a fourth `KnowledgeEngineTaxonomyLevel`
   (`"trade"`) in `platformExportTypes.ts` precisely so this decision isn't
   silently pre-made by the type shape — see
   [Section 6](#6-open-questions).
2. **No metadata column on `CostItem`/`Assembly`/`AssemblyItem`.** If the
   Knowledge Engine export carries fields TradeOS has no relational home for
   (see [Section 5](#5-what-should-stay-as-json-metadata)), persisting them
   requires adding a nullable `Json` column, following the exact precedent
   already set by `OrganizationMembershipAudit.beforeState`/`afterState` and
   project-intake's `*Json` columns — additive, nullable, no forced-RLS
   change needed beyond what those tables already have.
3. **Legacy-id cross-reference table.** Nothing in the current schema
   tracks "this `CostItem.id` came from legacy id X." Without it, a second
   import run (an update sync, not just an initial load) can't tell whether
   a legacy record was already imported versus should be created again. A
   dedicated `knowledge_engine_import_refs` table (or a `legacyId` column
   added to `CostItem`/`Assembly`) is needed before any *repeatable* import
   can exist — a one-shot import could get away without this, but the
   mission brief doesn't scope this as one-shot.
4. **Bulk relationship writes.** `AssembliesDatabaseService.addAssemblyItem`
   does one `assertExists`/`assertNoCycle` walk per call — correct for
   interactive use, but a full legacy assembly tree (hundreds/thousands of
   relationships) run through it one row at a time would be slow and would
   re-walk cycle checks redundantly. Not a schema change, but a real
   implementation gap worth flagging now: a bulk-safe import path will need
   its own cycle-detection pass over the whole relationship set up front,
   not N calls to the existing single-item method.

## 5. What should stay as JSON metadata

Fields the Knowledge Engine may export that don't correspond to any
TradeOS-modeled concept, and shouldn't be force-fit into new relational
columns:

- Legacy internal notes/tags/categorization that don't match TradeOS's own
  taxonomy (e.g., a legacy-specific "difficulty rating" or "region
  applicability" tag with no TradeOS equivalent).
- Provenance/versioning info from the legacy system itself (legacy
  created/modified timestamps, legacy author, legacy revision number) — useful
  for debugging import quality, not useful as first-class TradeOS columns.
- Anything speculative or system-specific enough that adding a real column
  for it now would be guessing at future requirements the mission brief
  explicitly warns against over-designing for.

`platformExportTypes.ts` models this today as an untyped, optional
`metadata?: Record<string, unknown> | null` on both
`KnowledgeEngineCostItemExport` and `KnowledgeEngineAssemblyExport` —
carried through opaquely by the type system, not dropped, but also not
validated or written anywhere yet (see [Section 4, item 2](#4-what-needs-prisma-changes-later)
for the schema change that would be needed to persist it).

## 6. What should NOT be migrated

- **Legacy pricing values.** TradeOS computes unit cost from
  `LaborRate`/`Material`/`Equipment` references, never stores a flat price on
  `CostItem` itself. A legacy export that carries a precomputed "unit price"
  for a cost item should be used only to sanity-check the *composed* TradeOS
  price after import (a QA signal), never written directly into any pricing
  field — doing so would silently break the "pricing is composed, not
  duplicated" invariant the rest of the codebase depends on
  (`getUnitCost`/`getAssemblyUnitCost` recompute live).
- **Legacy user/auth/org data.** Out of scope by mission constraint (auth is
  explicitly off-limits) and also architecturally wrong — TradeOS
  organizations and users are provisioned through
  `OrganizationProvisioningService`/`AuthService`, not a bulk import path,
  and forced RLS depends on that provisioning flow's invariants.
- **Anything from the Knowledge Engine's own source/internal implementation
  details.** The mission brief excludes Knowledge Engine source files
  entirely; this plan only concerns the *export/interchange* boundary, never
  the legacy system's internals.
- **Production data, this sprint.** No real import runs yet regardless of
  category — `importer.ts`'s `KnowledgeEngineImporter.planImport` only
  validates a bundle's internal referential integrity and returns a dry-run
  summary; it does not call Prisma, `CostDatabaseService`, or
  `AssembliesDatabaseService` at all.

## 7. Relationship to AI-assisted estimating

`docs/frontend-platform-completion-plan.md` Section 5 describes a *separate*,
already-planned feature: an LLM maps a contractor's plain-English scope of
work to suggested existing cost item/assembly codes at estimate-build time.
That pipeline **reads** the org's cost book through the existing
`CostDatabaseService`/`AssembliesDatabaseService` — it does not import
anything. This Knowledge Engine bridge is the opposite direction: a one-time
(or periodic) **write** path that populates the cost book from an external
legacy source. The two are complementary and independent: a richer, more
complete cost book from a successful Knowledge Engine import would make the
AI-assisted estimating feature's suggestions better, but neither depends on
the other's implementation.

## 8. Integration risks

1. **Type mismatch risk (highest).** Since no real export sample exists,
   `platformExportTypes.ts` is a hypothesis. The actual legacy shape could
   differ enough (nested vs. flat taxonomy, different relationship
   cardinality, a completely different metadata shape) that the importer's
   validation logic needs to be substantially rewritten once a real sample
   is available, not just extended.
2. **Org-scoping ambiguity.** The Knowledge Engine may have no concept of
   "organization" at all (if it's a single-tenant legacy tool) or may model
   multi-tenancy differently. Every legacy record must be assigned to
   exactly one TradeOS `orgId` before any write — there is no valid
   "import into every org" or "import org-less" path under forced RLS.
3. **Duplicate/conflicting codes.** `Division`/`Category`/`Subcategory`
   enforce `@@unique([parentId, code])`, and `CostItem`/`Assembly` enforce
   `@@unique([orgId, code])`. A legacy export with codes that collide with
   an org's existing cost book (or with each other, if run twice) will fail
   at the database layer with a `P2002` — which, encouragingly, the
   codebase already maps to a clean `409` via `mapPrismaKnownRequestError`
   rather than a raw 500, so at least the failure mode is already handled
   gracefully upstream. The import logic itself still needs an explicit
   dedupe/upsert strategy rather than relying on that mapper as the only
   safety net.
4. **Cycle risk in bulk relationship import.** `assertNoCycle`'s
   per-call graph walk works for interactive single-item adds; a bulk
   import of a full legacy assembly tree needs its own upfront cycle
   analysis (see [Section 4, item 4](#4-what-needs-prisma-changes-later))
   or it risks either being very slow or (if that safeguard is skipped for
   performance) silently allowing a cyclic import that the interactive path
   would have blocked.
5. **Volume/performance.** No batching or transaction strategy is designed
   yet. A large legacy cost book (thousands of cost items, deep assembly
   nesting) imported row-by-row through the existing single-item service
   methods would be slow and non-atomic (a failure partway through leaves a
   half-imported cost book). A real import sprint needs a batched,
   transactional write path — not sketched here since it depends on the
   Prisma changes in Section 4 landing first.
6. **No rollback mechanism.** Without the legacy-id cross-reference table
   from Section 4, there's no clean way to identify and remove "everything
   from import run X" if a bad import needs reverting.

## 9. Next exact implementation sprint

In dependency order:

1. **Obtain a real Knowledge Engine export sample** (even a small one) and
   reconcile it against `platformExportTypes.ts` field-by-field. This
   unblocks everything else and should happen before any further code is
   written — see [Open questions](#6-open-questions) below, which is really
   the sprint-0 task.
2. **Resolve the trade-taxonomy question** (Section 4, item 1) as an
   explicit decision with a person who owns both `project-intake` and this
   bridge, since `project-intake`'s `Trade` union is off-limits to this
   sprint's editor but directly relevant to the decision.
3. **Add the Prisma changes from Section 4** in their own reviewed migration:
   optional metadata `Json` columns and a legacy-id cross-reference
   mechanism, additive only (matches every prior migration's pattern in this
   codebase — forced RLS, no loosening of existing policies).
4. **Extend `importer.ts` with a resolution pass**: given a validated bundle,
   determine which legacy records already have a TradeOS counterpart
   (via the new cross-reference table) versus need to be created, still
   without writing anything — a "plan" that a human or a later write-path
   step can review before committing.
5. **Add the actual write path**, batched and transactional, calling
   `CostDatabaseService`/`AssembliesDatabaseService` (or new bulk-safe
   methods on them, if the per-call performance in Section 4 item 4 proves
   too slow) inside a single org-scoped transaction per import run, with the
   cross-reference table populated as records are created.
6. **Add tests**: unit tests for the importer's validation logic (this
   sprint's `importer.ts` is validation-only and should get coverage even
   before the write path exists), then integration tests for the write path
   once built, following the existing `tests/rls.integration.ts` pattern for
   proving org-scoping actually holds under real RLS.

## 10. Open questions

These need answers from whoever owns the legacy Knowledge Engine before
Section 9's sprint can start for real:

- What does an actual export bundle look like (format, field names, nesting)?
  Is it a single JSON document, a set of CSVs, a database dump, or something
  else?
- Does the Knowledge Engine have any concept of organization/tenant, or is
  it single-tenant data that needs a target org chosen at import time?
- Is trade/taxonomy in the legacy system closer to TradeOS's
  Division/Category/Subcategory tree, closer to project-intake's flat
  23-value `Trade` union, or genuinely a fourth shape?
- Are legacy prices meant to seed TradeOS's `LaborRate`/`Material`/
  `Equipment` records directly, or only to cross-check the composed price
  after cost items are wired up to *existing* TradeOS pricing data?
- Is this a one-time migration or does the Knowledge Engine need to stay a
  live source of truth (i.e., does this need to become a repeatable sync,
  like `modules/supplier-integration/`'s queue-and-review pattern, rather
  than a one-shot import)?
