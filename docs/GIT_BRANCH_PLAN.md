# Git Branch & Merge Plan

**Audit date:** 2026-07-03
**Auditor:** Claude (read-only audit — no code, branches, or history were modified to produce this report)

This document is a snapshot of repository state at the time above, plus a recommended, safe merge/push order. It does not perform any git operations itself — every command below is meant to be run by a human, in order, with a chance to review between steps.

---

## 1. Current branch

```
$ git branch --show-current
main
```

`HEAD` is at `e31c1c8` — `chore(knowledge-engine): import legacy costbook data, scripts, and agent pipelines`.

## 2. Is `main` ahead of `origin/main`?

**Yes — by 1 commit.**

```
$ git status
On branch main
Your branch is ahead of 'origin/main' by 1 commit.
```

```
$ git log origin/main..main --oneline
e31c1c8 chore(knowledge-engine): import legacy costbook data, scripts, and agent pipelines
```

`e31c1c8` (the knowledge-engine import) exists locally on `main` but has **not been pushed to `origin/main`**.

## 3. Uncommitted state in this working copy

This is substantial — there is real, undocumented in-progress work sitting in the working tree on top of `main`. None of it is on any branch yet.

**Modified (tracked, unstaged) — ~50 files**, spanning:
- Backend: `app/backend/controllers/{changeOrders,projects,proposals}.controller.ts`, `app/backend/routes/{projects,proposals}.routes.ts`, `app/backend/server.ts`, `app/modules/change-orders/{service,types}.ts`, `app/modules/proposals/service.ts`, `app/prisma/schema.prisma`, `app/package.json`, plus two test files
- Frontend: ~35 files under `web/src/**` (dashboard, customers, projects, proposals/contracts/invoices pages, shared components, `web/src/lib/api.ts`, `web/package.json` / `package-lock.json`)
- Docs: `claude.md`, `docs/AI_ESTIMATING_ARCHITECTURE.md`, `docs/frontend-platform-completion-plan.md`, `web/README.md`

**Untracked (new, not yet added) — new modules, migration, and docs:**
- `app/backend/controllers/{aiEstimateAssist,knowledgeRuntime,projectTasks}.controller.ts` + matching routes
- New backend modules: `app/modules/ai-estimate-assist/`, `app/modules/knowledge-runtime/`, `app/modules/project-tasks/`, `app/modules/trainingless-estimate-demo/`
- New migration: `app/prisma/migrations/20260703110000_add_project_workspace_operations/`
- New tests: `ai-estimate-assist`, `knowledge-runtime` (controller/loader/matcher/service), `project-tasks`, `trainingless-estimate-demo`
- New docs: `docs/DOCUMENT_WORKFLOW.md`, `docs/EXECUTIVE_REPOSITORY_AUDIT.md`, `docs/KNOWLEDGE_ENGINE_RUNTIME_INTEGRATION.md`, `docs/NEXT_STEPS.md`, `docs/PROJECT_LIFECYCLE.md`, `docs/PROJECT_STATUS.md`, `docs/SYSTEM_ARCHITECTURE.md`, `docs/TRAININGLESS_AI_ESTIMATING_DEMO.md`, `docs/TRAININGLESS_AI_REAL_KNOWLEDGE_WIRING.md`
- New top-level `AGENTS.md`
- New package: `packages/knowledge-engine/knowledge-engine/` (nested — worth a sanity check that this nesting is intentional)
- New frontend surface: `web/src/app/(app)/portal/`, the estimate `assist/` route, `web/src/components/{contracts,customers,estimate-assist,trainingless-demo}/`, several new `web/src/components/projects/*` files, `web/src/components/shared/{activity-timeline,notification-center,table-section}.tsx`, `web/src/lib/document-workflow.ts`

**Risk:** this uncommitted work is not backed up anywhere (no branch, no remote, no commit). It should be committed to its own branch before any branch-juggling, rebasing, or `git clean`/`reset` activity happens elsewhere in the repo, so it can't be lost.

## 4. Local worktree branches vs. `origin`

`git branch -vv` shows 21 local worktree branches (each under `.claude/worktrees/`, one per parallel agent session). Cross-referencing against `origin`:

**Stale/no-op branches** — 0 commits ahead of `origin/main`, i.e. identical to `origin/main` at `330c980`, no unique work:
`worktree-analytics-architecture-doc`, `worktree-codebase-index`, `worktree-cosmic-launching-journal`, `worktree-devops-audit`, `worktree-docs-reorg`, `worktree-knowledge-runtime-qa`, `worktree-lively-prancing-pumpkin`, `worktree-parsed-sprouting-cook`, `worktree-sprint11-continuation`

These are safe cleanup candidates later (not touched by this plan — no branches are deleted here).

**`worktree-ai-estimating-architecture`** — 1 commit ahead of `origin/main`, but its content (`fe95479`) was already merged to `origin/main` as `3c9c73b` via the now-**merged** PR #10. This branch is superseded/stale.

## 5. Open pull requests (all target `main`, all currently `MERGEABLE`/`CLEAN` against current `main`)

| PR | Branch | Summary | Files | +/- |
|----|--------|---------|-------|-----|
| **#13** | `worktree-floating-greeting-mochi` | Full repo audit docs + **carries the knowledge-engine import (`e31c1c8`) and legacy-reference transfer docs** | docs only (+ inherited data files) | — |
| #12 | `worktree-splendid-questing-pebble` | Repo-wide performance audit report | docs only | — |
| #11 | `worktree-compressed-meandering-whistle` | Contractor experience design doc (no code) | docs only | — |
| #9 | `worktree-noble-stirring-barto` | Refactor: remove dead code, consolidate duplicate `round2`, fix `claude.md` casing | 21 | +119/-393 |
| #8 | `worktree-fuzzy-drifting-twilight` | Security audit doc | 1 | +231/-0 |
| #7 | `worktree-db-architect-audit` | DB audit + applies `pg_trgm` search indexes (real migration) | 3 | +260/-0 |
| #6 | `worktree-linear-giggling-garden` | Knowledge Engine bridge plan + typed import stubs | 4 | +735/-0 |
| #5 | `worktree-v1-release-docs` | v1.0 release checklist/launch plan/known limitations | 3 | +277/-0 |
| #4 | `worktree-knowledge-runtime-bridge` | Scaffolds Construction Knowledge Engine bridge module | 8 | +674/-0 |
| #3 | `worktree-memoized-brewing-acorn` | Tree Service Knowledge Engine data, Batch 01 | 19 | +4805/-0 |
| #1 | `worktree-agent2-proposal-frontend` | Proposal-facing UI components (Agent 2) | 19 | +722/-160 |

Already **merged**: PR #10 (`worktree-ai-estimating-architecture`, → `3c9c73b`).
Already **closed** (not merged): PR #2 (`fix-resolve-auth-context-rls`).

### Does PR #13 contain the knowledge-engine migration?

**Yes.** PR #13's commit list is:
1. `e31c1c8` — `chore(knowledge-engine): import legacy costbook data, scripts, and agent pipelines` (this is `main`'s current, unpushed `HEAD` — see §2)
2. `7491cf7` — `docs: add legacy-tradeos-reference transfer docs`
3. `6112557` — `Merge local main (knowledge-engine import) into worktree branch`
4. `d894c7e` — `docs: full repository audit post-migration`

The PR body confirms this explicitly: *"this branch also carries `e31c1c8` (the knowledge-engine import itself), merged in from local `main` so the audit could see the actual current repo state — that commit had not yet been pushed to origin before this PR."*

**Practical effect:** merging PR #13 will push `e31c1c8` to `origin/main` as a side effect, before anyone runs `git push` from this machine. That's not unsafe, but it means the "push `main`" step and the "merge PR #13" step are not independent — do them in the order below to avoid a confusing divergent-history surprise.

## 6. Conflict risk between the open PRs themselves

All 11 open PRs currently show `MERGEABLE`/`CLEAN` **individually against today's `main`**. That status is computed one PR at a time against the current base — it does **not** mean all 11 can merge back-to-back without incident, because merging PR *N* changes the base that PR *N+1* is tested against. GitHub recomputes each PR's mergeability shortly after any merge into `main`, so mergeability should be re-checked after every single merge in the sequence below, not assumed from this table.

Highest overlap risk, based on file/content overview:
- **#3, #4, #6** all touch the knowledge-engine / knowledge-runtime area and PR #13 also carries knowledge-engine data — merge order matters here.
- **#9** ("remove dead code, consolidate duplicate `round2`") is a refactor with net deletions (`-393`) — highest chance of conflicting with anything else touching the same files. Recommended to merge this **last** among the code-bearing PRs, and to re-diff it against `main` immediately before merging.
- **#1** and **#13/#7** touch different layers (frontend proposal UI vs. docs vs. DB indexes) and are lower risk.
- Docs-only PRs (#5, #8, #11, #12, #13) carry effectively zero conflict risk with each other or with code PRs.

## 7. Recommended safe order

This order minimizes rebasing/conflict risk by doing pure-docs / additive PRs first, isolates the one PR that also pushes `main`'s unpushed commit, and defers the highest-conflict-risk refactor to last, with a re-check before each merge.

1. **Commit the current uncommitted working-tree changes to a new branch first** (see §3 — this is unrelated to any existing PR and should not be lost or mixed into a merge).
2. **Push `main`**, or let PR #13's merge do it (see §5) — pick one path, don't do both independently without re-syncing. Recommended: push `main` explicitly first, so the history is unambiguous before any PR merges.
3. Merge **PR #13** (audit docs + knowledge-engine import/transfer docs) — establishes the knowledge-engine baseline other PRs build on.
4. Merge **PR #5** (v1.0 release docs) — docs only, zero risk.
5. Merge **PR #8** (security audit doc) — docs only, zero risk.
6. Merge **PR #11** (contractor experience design doc) — docs only, zero risk.
7. Merge **PR #12** (performance audit report) — docs only, zero risk.
8. Merge **PR #7** (DB audit + `pg_trgm` indexes) — additive migration, low risk, but re-check mergeability against `main` first since #13 just landed.
9. Merge **PR #6** (Knowledge Engine bridge plan + typed stubs) — re-check against `main` (post #13/#7) before merging.
10. Merge **PR #4** (Knowledge Engine bridge module scaffold) — re-check against `main` (post #6) before merging; likely to be the most sensitive step given overlap with #6.
11. Merge **PR #3** (Tree Service Knowledge Engine data, Batch 01) — large additive data PR, re-check against `main` (post #4/#6) before merging.
12. Merge **PR #1** (Agent 2 proposal UI) — frontend-only, re-check against `main`, lower risk than the knowledge-engine cluster.
13. Merge **PR #9** (dead-code removal/refactor) **last** — re-diff against `main` immediately before merging, since every prior merge is a chance for its deletions to now conflict with something.
14. After all merges, revisit the stale/no-op branches listed in §4 (9 identical-to-`origin/main` branches, plus the superseded `worktree-ai-estimating-architecture`) for deletion — not part of this plan's scope, flagged for a follow-up decision.

## 8. Exact commands for the human to run

**Do not force-push. Do not merge from the CLI in a way that bypasses GitHub review. Do not delete branches.** The commands below stage the state for review; PR merges are listed as `gh pr merge` invocations for visibility but should be reviewed on GitHub (or confirmed interactively) before running.

### Step 1 — save the uncommitted work to its own branch

```bash
git status                      # confirm the same file list seen in §3 before doing anything
git switch -c wip/uncommitted-workspace-ops-2026-07-03
git add -A
git commit -m "wip: snapshot uncommitted workspace/knowledge-runtime/ai-assist work"
git push -u origin wip/uncommitted-workspace-ops-2026-07-03
git switch main                 # return to main, now clean
```

### Step 2 — push `main`'s one unpushed commit

```bash
git log origin/main..main --oneline    # sanity check: should show only e31c1c8
git push origin main
```

### Step 3 — merge PRs in the recommended order, re-checking mergeability before each one

```bash
# repeat this check before every merge below, substituting the PR number:
gh pr view <N> --json mergeable,mergeStateStatus

gh pr merge 13 --merge     # audit docs + knowledge-engine import/transfer docs
gh pr merge 5  --merge     # v1.0 release docs
gh pr merge 8  --merge     # security audit doc
gh pr merge 11 --merge     # contractor experience design doc
gh pr merge 12 --merge     # performance audit report
gh pr merge 7  --merge     # DB audit + pg_trgm indexes
gh pr merge 6  --merge     # Knowledge Engine bridge plan + typed stubs
gh pr merge 4  --merge     # Knowledge Engine bridge module scaffold
gh pr merge 3  --merge     # Tree Service Knowledge Engine data, Batch 01
gh pr merge 1  --merge     # Agent 2 proposal UI
gh pr merge 9  --merge     # dead-code removal/refactor (merge last, re-diff first)
```

(`--merge` is used above to preserve full commit history per PR; substitute `--squash` if the team prefers squash merges — this plan does not assume one over the other.)

### Step 4 (follow-up, not part of this pass) — stale branch cleanup

```bash
# review only — do not run without separate confirmation, this plan does not delete branches:
git branch -vv | grep -E 'worktree-(analytics-architecture-doc|codebase-index|cosmic-launching-journal|devops-audit|docs-reorg|knowledge-runtime-qa|lively-prancing-pumpkin|parsed-sprouting-cook|sprint11-continuation|ai-estimating-architecture)'
```

---

**No git operations were performed by this audit.** All commands above are for the human to run and review, in order, one at a time.
