# Platform Export Pipeline (Authored Content)

Generates `packages/knowledge-engine/exports/authored-content/*.json` from
the approved Construction Knowledge Engine content in
`packages/knowledge-engine/authored-content/` (read-only — this pipeline
never writes there, and never invents assemblies not already authored and
reviewed there).

This is a separate, TypeScript-authored content lineage from the
pipeline-generated JSON already under `packages/knowledge-engine/knowledge/`
and staged in `packages/knowledge-engine/review/pending/`. Reconciling the
two lineages (including any overlapping trade coverage) is future work, not
done by this pipeline.

## Run it

From the repo root:

```
app/node_modules/.bin/ts-node --project packages/knowledge-engine/pipelines/authored-content-export/tsconfig.json \
  packages/knowledge-engine/pipelines/authored-content-export/generate-platform-exports.ts
```

Re-run any time the authored-content folder's content changes (e.g. after a
new batch is authored and reviewed) to refresh the exports. The script is
read-only with respect to the knowledge source and fully deterministic
other than `generatedAt`/`sourceKnowledgeEngineGitRevision`.

## What it produces

- `packages/knowledge-engine/exports/authored-content/assemblies.json`
- `packages/knowledge-engine/exports/authored-content/cost-items.json`
- `packages/knowledge-engine/exports/authored-content/relationships.json`
- `packages/knowledge-engine/exports/authored-content/trades.json`
- `packages/knowledge-engine/exports/authored-content/manifest.json`

See `packages/knowledge-engine/docs/authored-content/platform-field-mapping.md`
for exactly how each output field traces back to `KnowledgeAssembly`, and
`packages/knowledge-engine/docs/authored-content/platform-import-contract.md`
for how a consumer should use them.

## Why a dedicated `tsconfig.json` here

This pipeline lives outside `app/`'s own `tsconfig.json` `include` list and
deliberately does not modify that file. `tsconfig.json` here is a
standalone, `transpileOnly` config scoped to this script plus the
authored-content folder it imports from (which has zero external
dependencies — no Prisma, no Express — so no other app-level type context
is needed).
