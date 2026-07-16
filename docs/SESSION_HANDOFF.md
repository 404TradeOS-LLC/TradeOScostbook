---
status: current
owner: platform
last_verified: 2026-07-16
source_of_truth: true
related_code:
  - docs/TRADEOS_BIBLE.md
  - docs/SPRINT_BACKLOG.md
  - docs/ENGINEERING_COMMAND_CENTER.md
  - docs/agent-prompts/NEXT_SPRINT_PROTOCOL.md
---

# TradeOS Session Handoff

## Current Mission

Harden and land the TradeOS Bible foundation, then execute the documentation repair plan from the read-only repository audit without deleting or consolidating evidence prematurely.

## Live Pull Request State

- PR #31 — `docs/tradeos-bible-foundation` into `main`
  - status: open draft
  - role: Bible foundation, seven volumes, 50-sprint backlog, and next-sprint protocol
  - current head after repair work: verify live GitHub before editing
- PR #32 — `docs/tradeos-bible-volume-3-engineering` into `docs/tradeos-bible-foundation`
  - status: open draft
  - scope: Volume 3 only
  - blocker: the base branch advanced after PR creation; refresh against the current PR #31 head before merge
- PR #30 — `fix/brand-studio-asset-upload-persistence` into `main`
  - status: open and mergeable at last verification
  - scope: Settings Console brand-asset persistence, public-bucket guard, validation, tests, and documentation
- PRs #27, #28, and #29 are merged and must not be recreated.

## Completed This Repair Pass

- completed and committed Volume 6 founder doctrine
- created and committed Volume 7 Knowledge Runtime doctrine
- updated the Bible index to reflect all seven volumes
- clarified the source-of-truth layers: doctrine, implementation state, sprint state, roadmap, handoff, technical contracts, ADRs, research, and archive
- adopted the documentation-audit principle that accepted ADRs remain active supporting references rather than generic archive material
- preserved the package knowledge corpus for a separate audit instead of deleting suspected duplicates

## Immediate Risks

- PR #31 is not merged, so the Bible is proposed canonical doctrine until it lands on `main`.
- PR #32 is stacked on an older PR #31 base and is currently not mergeable.
- `docs/SPRINT_BACKLOG.md` still needs a final live-state correction pass, including S003 readiness.
- `docs/ENGINEERING_COMMAND_CENTER.md` contains stale ruleset and recently-landed-work claims that require live verification before correction.
- entry-point docs and legacy generator scripts remain untouched pending the foundation merge and preservation plan.
- `packages/knowledge-engine/**` contains thousands of documents and requires its own segmented audit.

## Next Eligible Sprint

None should begin from the general backlog until the Bible foundation stack is reconciled.

## Why No Sprint Is Eligible Yet

S001 remains in review. S003 changes governance and should not run as an independent `READY` sprint while the foundation branch still contains stale governance statements and an unresolved stacked PR. Runtime feature sprints must not use the unmerged Bible branch as if it were `main` truth.

## Dependencies

1. refresh PR #32 onto the current PR #31 head or incorporate its single-file Volume 3 change safely;
2. repair the backlog and Command Center live-state claims;
3. run docs validation on the complete stacked result;
4. merge PR #31 only after the final diff and checks are reviewed;
5. begin non-destructive documentation cleanup from current `main` afterward.

## Overlapping PRs Checked

- PR #30 occupies Settings/Brand Studio web and related current-state documentation scope.
- PR #31 occupies the Bible foundation and sprint-system docs.
- PR #32 occupies `docs/bible/VOLUME_3_ENGINEERING.md` only.

## Exact Next Safe Action

Refresh PR #32 against the current `docs/tradeos-bible-foundation` head without modifying other Bible volumes, then verify the one-file diff and docs checks. Do not start archive, deletion, README consolidation, ruleset changes, or the package knowledge-corpus cleanup yet.

## Startup Prompt

Read `AGENTS.md`, `docs/TRADEOS_BIBLE.md`, `docs/CURRENT_STATE.md`, `docs/SPRINT_BACKLOG.md`, `docs/SESSION_HANDOFF.md`, and `docs/agent-prompts/NEXT_SPRINT_PROTOCOL.md`. Inspect live PRs #30, #31, and #32. Reconcile PR #32 with the current PR #31 head, keep the diff limited to `docs/bible/VOLUME_3_ENGINEERING.md`, run required docs validation, and stop on unexpected branch movement or scope overlap.
