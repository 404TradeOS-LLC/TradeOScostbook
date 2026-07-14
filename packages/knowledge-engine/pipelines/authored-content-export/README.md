# Platform Export Pipeline

Generates `exports/platform/*.json` from the approved Construction
Knowledge Engine content in
`app/modules/assemblies-database/knowledge/` (read-only — this pipeline
never writes there, and never invents assemblies not already authored and
reviewed there).

## Run it

From the repo root:

```
app/node_modules/.bin/ts-node --project pipelines/export/tsconfig.json \
  pipelines/export/generate-platform-exports.ts
```

Re-run any time the knowledge folder's content changes (e.g. after a new
batch is authored and reviewed) to refresh the exports. The script is
read-only with respect to the knowledge source and fully deterministic
other than `generatedAt`/`sourceKnowledgeEngineGitRevision`.

## What it produces

- `exports/platform/assemblies.json`
- `exports/platform/cost-items.json`
- `exports/platform/relationships.json`
- `exports/platform/trades.json`
- `exports/platform/manifest.json`

See `docs/platform-field-mapping.md` for exactly how each output field
traces back to `KnowledgeAssembly`, and `docs/platform-import-contract.md`
for how a consumer should use them.

## Why a dedicated `tsconfig.json` here

This pipeline lives outside `app/`'s own `tsconfig.json` `include` list and
deliberately does not modify that file. `pipelines/export/tsconfig.json` is
a standalone, `transpileOnly` config scoped to this script plus the
knowledge folder it imports from (which has zero external dependencies —
no Prisma, no Express — so no other app-level type context is needed).
