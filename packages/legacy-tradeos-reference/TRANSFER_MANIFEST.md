# Transfer Manifest

This document outlines the contents preserved in the Knowledge Engine transfer folder.

## Core Data and Logic
- **`knowledge/`**: Contains core JSON data files for cost items, assemblies, and associated historical files from legacy Data and knowledge folders.
- **`schemas/`**: All Zod, JSON Schema, and Prisma definitions that rule the validation engine.
- **`scripts/`**: Essential scripts for normalization, deduplication, and sanity checking. Includes the `orchestrator/` sub-folder.
- **`pipelines/`**: Ingestion, processing, generation, and formatting logic. Includes `generation/` and `imports/` sub-folders.
- **`runtime/`**: Persistent and temporary runtime states for local queueing.
- **`review/`**: The workflows and metrics for assessing data quality (knowledge-history, knowledge-quality).
- **`exports/`**: The finalized outputs formatting into SQL, Platform, and JSON targets.
- **`prompts/`**: Instructions for the underlying LLMs used to build the data set.

## Agent System
- **`agent-skills/`**: The `.agent/skills/` definitions and active `agents/` directories carrying our specialized workers.

## Documentation
- **`docs/`**: Standard markdown documentation files, along with `README.md` and `gemini.md` system prompt templates.

## Archived / Excluded Items
- **`legacy-archive/`**: Contains the obsolete SwiftUI applications, experiments, UI studio files, and `scratch/` files.
- **Excluded**: All `node_modules`, `.git` folders, and build caches (`.npm_cache`, `build`, `dist`) were explicitly ignored during this packaging.
