# Tree Service — Knowledge Engine Progress

Tracks batch-by-batch progress toward ~100 production-quality Tree Service
assemblies, per `prompts/agent-costbook-architect.md`. Content lives in
`app/modules/assemblies-database/knowledge/trades/tree-service/`.

## Status

- Batches completed: 1 of ~10
- Assemblies completed: 10 of ~100

## Batch 01 (assemblies 1-10) — complete

Focus: foundational, highest-frequency jobs spanning distinct categories
(deliberately not just removal-size tiers), so later batches can go deep on
each category without duplicating what's here.

1. `tree-service.removal.small-tree-open-access` — Tree Removal — Small Tree (Under 12" DBH), Open Access
2. `tree-service.removal.medium-tree-open-access` — Tree Removal — Medium Tree (12"-24" DBH), Open Access
3. `tree-service.removal.large-tree-open-access` — Tree Removal — Large Tree (Over 24" DBH), Open Access
4. `tree-service.removal.technical-rigging-restricted-access` — Tree Removal — Technical Rigging, Restricted Access
5. `tree-service.hazard-removal.dead-standing-hazard-tree` — Hazard Tree Removal — Dead/Diseased Standing Tree
6. `tree-service.removal.crane-assisted-removal` — Crane-Assisted Tree Removal
7. `tree-service.stump-grinding.standard-stump-grinding` — Stump Grinding — Standard
8. `tree-service.pruning.crown-reduction-structural` — Crown Reduction — Structural Pruning
9. `tree-service.pruning.deadwooding-crown-cleaning` — Deadwooding — Crown Cleaning
10. `tree-service.emergency-response.storm-hanger-leaner-removal` — Emergency Response — Storm-Damaged Hanger/Leaner Removal

### Review notes (batch 01 self-review)

- No duplicate scopes: the four removal assemblies are differentiated by a
  genuine driver (size tier for small/medium/large; proximity-to-target risk
  for technical-rigging; equipment method for crane-assisted; condition risk
  for hazard) rather than by size alone, so none of them compete for the same
  job.
- Naming convention locked in for future batches: `id` = `<trade-slug>.<category-slug>.<item-slug>`;
  `name` = `<Category-ish label> — <Descriptor>`; `unitOfMeasure` is `EA` per
  tree/stump except emergency response, which is `HR` (time-and-materials,
  matching how storm work is actually billed in the industry).
- `dependencies` intentionally reference some assembly IDs that don't exist
  yet (e.g. `tree-service.utility-clearance.service-drop-clearance`,
  `tree-service.root-flare-excavation.root-flare-excavation-standard`,
  `tree-service.hauling.debris-haul-standard`) — these are forward pointers
  to categories explicitly listed in the current-trade brief and slated for
  later batches. Not a defect; flagged here so batch 02 review confirms each
  gets created with a matching ID.
- `pricingHooks` `refSlug` values follow a `tree-service.<role-or-item>`
  convention (e.g. `tree-service.certified-climber`,
  `tree-service.brush-chipper`) reused verbatim across assemblies that share
  labor/equipment — e.g. `tree-service.certified-climber` appears in 4 of the
  10 records rather than being redefined per record. Keep reusing these exact
  strings in future batches rather than inventing near-duplicates (e.g. don't
  also add `tree-service.climbing-arborist` as a separate hook for the same
  role).
- Every record's `constructionPhase` is `maintenance` except the emergency
  response assembly (`emergency-response`) — correct, since routine tree work
  isn't tied to a construction project lifecycle the way sitework/finish
  trades are.

### Forward-reference IDs to satisfy in upcoming batches

- `tree-service.hauling.debris-haul-standard` (Hauling category)
- `tree-service.utility-clearance.service-drop-clearance` (Utility Clearance category)
- `tree-service.root-flare-excavation.root-flare-excavation-standard` (Root Flare Excavation category)
- `tree-service.pruning.crown-raising` (Pruning category, crown raising subcategory)

## Recommended next batch (Batch 02)

Cover the forward-referenced categories first to close out batch 01's open
dependency pointers, plus round out Pruning and start Cabling/Bracing:
crown raising, root flare excavation, standard debris hauling, utility-line
clearance pruning, tree cabling, tree bracing, brush chipping as a standalone
line item (distinct from bundled chipping already implied above), lot
clearing (small lot), tree planting (standard install), and a plant-health
diagnostic/treatment visit. That's 10 and would bring the category coverage
from the current-trade brief to fully represented at least once each.
