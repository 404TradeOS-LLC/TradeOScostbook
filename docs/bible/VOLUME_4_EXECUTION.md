---
status: current
owner: platform
last_verified: 2026-07-16
source_of_truth: true
---

# TradeOS Bible — Volume 4: Execution

## Purpose

This volume turns strategy into a repeatable engineering operating system for the founder, Claude, Codex, and future contributors.

## Canonical work queue

`docs/SPRINT_BACKLOG.md` is the executable queue. Broad roadmap priorities do not override the numbered sprint order unless a verified blocker or founder decision requires reprioritization.

## Sprint rules

- one sprint per branch;
- one sprint per pull request;
- no second sprint begins before the first branch is handed off;
- only merged evidence marks a sprint `DONE`;
- open PR overlap prevents a sprint from being `READY`;
- blocked infrastructure or unresolved product decisions prevent readiness;
- every sprint includes scope, forbidden paths, tests, acceptance criteria, docs, and stop conditions.

## Agent startup

Every agent must:

1. fetch origin;
2. verify path, branch, clean state, remote, and upstream;
3. read the Bible, Command Center, Current State, Sprint Backlog, Session Handoff, and Next Sprint Protocol;
4. inspect live PRs and recent merges;
5. select the lowest-numbered eligible `READY` sprint;
6. create an isolated worktree and branch;
7. state mission, scope, validation, and stop conditions before editing.

## Agent completion

Every agent must:

1. inspect the full diff against current `origin/main`;
2. run all sprint-required validation;
3. update affected source-of-truth docs;
4. update sprint status and completion evidence;
5. replace the session handoff with concise current state;
6. commit and push intentionally;
7. open or update one draft PR;
8. report exact next safe action.

## Parallel-work rules

Parallel work is allowed only when path ownership and dependencies do not overlap. Agents must treat another active worktree or open PR as occupied territory unless the mission explicitly coordinates with it.

## Founder workflow

The founder should be able to issue:

> Run the next TradeOS sprint.

The agent must then mechanically select work using `docs/agent-prompts/NEXT_SPRINT_PROTOCOL.md`. A custom founder prompt is unnecessary when an eligible `READY` sprint exists.

## Status vocabulary

- `DONE`
- `IN_REVIEW`
- `READY`
- `BLOCKED`
- `PLANNED`
- `DEFERRED`
- `CANCELLED`

## Quality gates

A sprint cannot be called complete when:

- required checks fail;
- browser verification is claimed but not performed;
- external infrastructure remains unverified without being documented;
- runtime behavior changed without required docs;
- unexpected files entered the diff;
- acceptance criteria lack evidence.

## Related sources

- `docs/SPRINT_BACKLOG.md`
- `docs/agent-prompts/NEXT_SPRINT_PROTOCOL.md`
- `docs/ENGINEERING_COMMAND_CENTER.md`
- `docs/SESSION_HANDOFF.md`
- `AGENTS.md`
