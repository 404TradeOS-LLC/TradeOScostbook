# Knowledge Engine Import Checklist

Companion to `docs/legacy-knowledge-integration-plan.md`. This is the
step-by-step gate a future implementation sprint should run through before,
during, and after any real import against a real TradeOS organization. None
of these steps have been executed yet — this sprint is planning + typed
bridge only, no real data has moved.

## Before writing any import code against real data

- [ ] A real Knowledge Engine export sample has been obtained and diffed
      field-by-field against `app/modules/knowledge-runtime/platformExportTypes.ts`.
      Update the types (and this checklist) if the real shape differs —
      don't bend real data to fit a guessed type.
- [ ] The trade/taxonomy reconciliation decision (see the integration plan,
      Section 4 item 1) has an owner and a written decision: does legacy
      "trade" map to Division/Category, to a new taxonomy level, or to
      project-intake's existing `Trade` union?
- [ ] Confirmed which TradeOS organization (`orgId`) the import targets.
      There is no valid "import with no org" or "import into every org"
      path under forced RLS — every legacy record needs exactly one target
      org before any write.
- [ ] Confirmed whether this is a one-time migration or needs to become a
      repeatable sync. A repeatable sync needs the legacy-id
      cross-reference mechanism (integration plan Section 4 item 3) *before*
      the first import, not retrofitted after.
- [ ] Decided the metadata policy: which legacy fields get a real Prisma
      column, which stay as opaque JSON metadata, and which get dropped
      entirely. Get this in writing per-field, not left implicit.
- [ ] The Prisma migration adding any new columns (metadata JSON,
      legacy-id cross-reference) has been written, reviewed, and follows the
      existing additive-only, forced-RLS pattern used by every prior
      migration in this codebase — this is a schema change and is out of
      scope for `app/modules/knowledge-runtime/` alone to make.

## Validating a bundle before import (what `importer.ts` covers today)

`KnowledgeEngineImporter.planImport` in
`app/modules/knowledge-runtime/importer.ts` already checks these
mechanically — treat a non-empty `issues` array as a hard stop, not a
warning to import around, until a human has reviewed it:

- [ ] No duplicate `legacyId` within taxonomy nodes, cost items, or
      assemblies.
- [ ] Every taxonomy node's `parentLegacyId` (if set) resolves to another
      node in the same bundle.
- [ ] Every cost item's `taxonomyLegacyId` resolves to a taxonomy node with
      `level: "subcategory"` in the same bundle.
- [ ] Every cost item and assembly has a non-empty `unitOfMeasure`.
- [ ] Every relationship's `parentAssemblyLegacyId` resolves to a known
      assembly.
- [ ] Every relationship has exactly one of `childCostItemLegacyId` /
      `childAssemblyLegacyId` set, and it resolves to a known cost item or
      assembly respectively.
- [ ] No relationship has an assembly as its own child
      (`parentAssemblyLegacyId === childAssemblyLegacyId`).
- [ ] Every relationship's `quantityPerUnit` is a positive number (flagged
      as a warning, not an error, since a zero/negative quantity may be
      legitimate legacy data worth a human look rather than an automatic
      reject).

## What `importer.ts` deliberately does NOT check yet (because it doesn't write)

These only matter once a real write path exists (integration plan Section 9,
steps 4–5) — don't assume today's `planImport` covers them:

- [ ] Whether a legacy record has already been imported previously (no
      cross-reference table exists yet to check against).
- [ ] Whether a legacy code collides with an existing TradeOS cost
      item/assembly/division code in the target org (this will currently
      surface as a database-level `409` via `mapPrismaKnownRequestError` if
      reached, not a pre-write validation error).
- [ ] Whether the legacy `laborRateLegacyId`/`materialLegacyId`/
      `equipmentLegacyId` references on a cost item resolve to anything —
      those referenced entities aren't part of `KnowledgeEngineExportBundle`
      at all yet (see integration plan Section 6, open questions).
- [ ] Cross-bundle referential integrity (e.g., against a *previous* import
      run's bundle) — validation today is only within a single bundle.

## Before running a real write path against production data

(Applies once Section 9 of the integration plan is implemented — recorded
here now so it isn't forgotten later.)

- [ ] Dry run completed against a disposable/staging database first,
      following this repo's existing `npm run test:integration` disposable
      Postgres pattern — never a first-time run against the live Supabase
      database.
- [ ] Import runs inside a single transaction per import batch, so a
      failure partway through doesn't leave a half-imported cost book.
- [ ] A rollback/undo path exists (via the legacy-id cross-reference table)
      before the first real-org import, not designed after the fact.
- [ ] Composed pricing was spot-checked after import:
      `CostDatabaseService.getUnitCost`/`AssembliesDatabaseService.getAssemblyUnitCost`
      on a sample of imported cost items/assemblies produce sane numbers —
      never trust a legacy "precomputed price" field as the source of truth
      post-import.
- [ ] RLS org-scoping was verified live (not just unit-tested) for the
      imported rows, the same way `tests/rls.integration.ts` verifies every
      other tenant-scoped table — a cross-org read of freshly imported data
      should return nothing.
- [ ] Import volume and duration were sanity-checked against the target
      org's actual legacy data size before committing to a single-run
      import strategy vs. a batched/paginated one.

## Explicitly out of scope, don't let a future sprint quietly expand into these

- [ ] Frontend/UI for triggering or reviewing an import (mission scope: no
      UI work this sprint or implied by it).
- [ ] Any change to auth, the proposal engine, or project-intake as a side
      effect of "while I'm in there" — those are explicitly walled off.
- [ ] Modifying the Knowledge Engine's own source to make export easier —
      the bridge adapts to whatever the legacy system already exports, not
      the other way around.
