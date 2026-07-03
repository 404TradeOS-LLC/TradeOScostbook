# Prisma Gap Analysis — Construction Knowledge Engine vs. `app/prisma/schema.prisma`

Compares every field on `KnowledgeAssembly`
(`app/modules/assemblies-database/knowledge/types.ts`) against the runtime
schema (`app/prisma/schema.prisma`) as of the Knowledge Engine's current
branch point (git revision `823304c`, see `exports/platform/manifest.json ->
sourceKnowledgeEngineGitRevision`). This is analysis only — no schema file
was touched to produce it.

## Method

Each of `KnowledgeAssembly`'s 31 field-groups is placed in exactly one
bucket:

- **Already-supported** — maps onto an existing Prisma column today with no
  schema change, only application-level mapping logic.
- **JSON metadata (now)** — no dedicated column exists, but the value is a
  simple string/string-array that could be losslessly parked in one new
  generic `metadata Json?` column (a single schema change unlocks all of
  these at once) rather than needing its own typed column.
- **New Prisma columns/tables** — needs dedicated relational structure
  (an enum for filtering, a join table for a graph, a real foreign key)
  because JSON-blob storage would prevent the runtime from actually *doing*
  anything with the field (querying, filtering, joining, enforcing FK
  integrity).
- **Defer** — acknowledged but not worth deciding either way yet; no current
  consumer needs it.

This same bucket count drives the `prismaSchemaAlignmentPct` sub-score in
`exports/platform/manifest.json` (5 of 31 fields already supported = 16.1%).

## Already-supported (5 of 31)

| KnowledgeAssembly field | Runtime target | Notes |
|---|---|---|
| `id` | `Assembly.code` | Not identical semantics — `Assembly.code` is `@@unique([orgId, code])`, org-scoped; the knowledge `id` (e.g. `tree-service.removal.small-tree-open-access`) is globally unique across the whole registry. Using the knowledge `id` verbatim as `code` when an org installs a template works today with zero schema change, as long as an org never imports two knowledge assemblies with colliding codes (not possible today — one registry, all ids unique). |
| `slug` | *(derived, no column needed)* | `slug` is just the last path segment of `id`. Never needs its own storage. |
| `name` | `Assembly.name` | Direct. |
| `unitOfMeasure` | `Assembly.unitOfMeasure` | Direct — both use the same short-code convention (`EA`, `HR`). |
| `description` | `Assembly.description` | Direct, using the knowledge engine's internal `description` (not `customerDescription` — see below). |

## Can live in JSON metadata for now (17 of 31)

None of these have a dedicated column today. All are simple strings or
string arrays that a single new `metadata Json?` column on `Assembly` (or an
equivalent sidecar table) could hold verbatim without any further schema
work, **if** the goal is just to preserve/display the content. They only
need to graduate to the "new columns/tables" bucket once something needs to
query, filter, or join on them specifically.

- `trade` — no `Trade` concept on `Assembly` at all today (see "New Prisma
  columns/tables" below for why this is really a defer-then-promote case,
  not a permanent JSON-only field).
- `category`, `subcategory` — real `Category`/`Subcategory` models exist,
  but they hang off `CostItem` via `Division -> Category -> Subcategory`,
  not off `Assembly`. Free-text storage is a stopgap, not a good permanent
  home.
- `customerDescription` — no second description column on `Assembly` today.
- `contractorNotes` — `CostItem.notes` exists as a precedent field shape;
  `Assembly` has no equivalent.
- `typicalUseCase`
- `projectTypes` — no `projectType` concept exists anywhere in the schema,
  including on `Project` itself.
- `materialCategories`, `laborCategories`, `equipmentCategories` — these are
  category *labels* ("Chainsaw (fell/limb/buck)"), not references to real
  `Material`/`LaborRate`/`Equipment` rows. They read like display text, not
  data an estimator would query.
- `safetyRequirements`, `riskFactors`, `permitAwareness`,
  `inspectionAwareness`, `codeConsiderations` — all free-text guidance,
  currently useful only for human/AI reading, not for structured queries.
- `wasteDisposal`
- `productionNotes`

## Needs new Prisma columns or tables (7 of 31)

- **`constructionPhase`** — a closed enum
  (`pre-construction | site-prep | rough | finish | post-construction |
  maintenance | emergency-response`). Worth a real enum column once
  anything schedules or filters by phase (the mission's "Scheduling"
  capability), rather than string-matching JSON.
- **`csiDivision`** — superficially a string, but the schema already has a
  real `Division -> Category -> Subcategory` hierarchy for exactly this
  purpose (used today by `CostItem`). The correct integration is a
  find-or-create sync against those tables, not a raw string column on
  `Assembly` — otherwise TradeOS ends up with two parallel, unlinked
  classification systems.
- **`requiredInputs` / `optionalInputs`** — structured, typed records
  (`key`/`label`/`unit`/`description`) meant to drive an intake flow. A
  JSON blob can *store* them, but nothing can query "which assemblies need
  a `dbhInches` input" or drive a generic intake-question renderer off a
  blob efficiently. This is also the field most directly relevant to
  `app/modules/project-intake/` — see
  `docs/platform-runtime-bridge-plan.md` for how its existing
  `FieldCheck` shape (`field`/`question`/`reason`/`importance`/
  `isAnswered`) compares.
- **`dependencies`** — a same-trade-or-cross-trade assembly graph. This is
  inherently relational (self-referential many-to-many), the same shape
  `AssemblyItem` already models for real priced sub-assemblies. A JSON
  array of string ids can't enforce referential integrity or support a
  "what does this job also usually need" query at the database level.
- **`proposalIntelligence`** (`scopeOfWork`/`assumptions`/`exclusions`/
  `warranty`) — **important cross-branch note**: this Knowledge Engine
  branch (`worktree-memoized-brewing-acorn`) forked from the main line
  *before* `main` added real `Proposal`/`Invoice`/`Contract` models. On
  `main` today, `Proposal` already has real, live `scopeOfWork`/
  `assumptions`/`exclusions`-shaped fields (per the main branch's session
  log, item 36) — the knowledge-engine README's claim that these field
  names were chosen "mirroring the field names already used on the real
  Proposal model" is **stale relative to this branch's own schema** (which
  has no `Proposal` model at all) but **accurate relative to `main`**.
  Whoever eventually reconciles these branches gets a real, nearly 1:1
  target to map into — call this out explicitly during that merge, don't
  re-derive it.
- **`pricingHooks`** — by design (see the knowledge folder's own README),
  these are placeholders today. Turning them into real data requires a
  sync/import job that resolves each `{kind, refSlug}` to a real
  `CostItem`/`Material`/`LaborRate`/`Equipment`/`Subcontractor`/`Assembly`
  id per org (find-or-create), plus a join table recording the resolution
  (`AssemblyItem` already plays this role for `costItem`/`childAssembly`
  kinds; `material`/`laborRate`/`equipment`/`subcontractor` kinds have no
  direct analog on `Assembly` today since `AssemblyItem` only links to
  `CostItem` or a child `Assembly`, not directly to `Material`/`LaborRate`/
  `Equipment`/`Subcontractor`).

## Deferred (2 of 31)

- **`version`** — a per-record revision counter with no consumer yet (no
  diffing/changelog UI exists for knowledge content). Revisit once a
  second version of any assembly is actually authored.
- **`aiNotes`** — guidance for a future AI consumer that doesn't exist in
  this codebase yet (no LLM-backed intake/estimating call site was found
  anywhere in `app/`). Worth carrying in the export for whenever that
  consumer exists, but not worth a schema decision today.

## Bottom line

Five of the 31 field-groups need no schema change at all. Seventeen more
could be stored, unqueried, in one new `metadata Json?` column as a cheap
interim step. The remaining seven are the ones that actually determine
whether this content can *do* anything beyond being read by a human or an
LLM prompt — `requiredInputs`/`optionalInputs` (drives intake),
`dependencies` (drives upsell/bundling), `pricingHooks` (drives real
pricing), `csiDivision` (drives catalog placement), `constructionPhase`
(drives scheduling), and `proposalIntelligence` (drives document
generation, and is nearly solved already on `main`). None of that schema
work was done as part of this task — it is out of scope by design (see
`prompts/agent-costbook-architect.md`, which forbids touching the Prisma
schema, and this task's own instructions, which forbid it too).
