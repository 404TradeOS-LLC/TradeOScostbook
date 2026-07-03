# Integration Plan

This document outlines the high-level roadmap for integrating the Knowledge Engine into the core TradeOS application *after* the file transfer is complete.

## Phase 1: Environment & Tooling Setup
- Ensure the `packages/knowledge-engine` has a valid `package.json` if it intends to act as an NPM workspace.
- Map the python and bash dependencies required by the data generation scripts.

## Phase 2: Schema Alignment
- Compare the legacy JSON and Zod schemas located in `packages/knowledge-engine/schemas/` with the active TradeOS Prisma schema.
- Create a Prisma migration plan that bridges the gap between the structured Knowledge Engine outputs and the active database schema without breaking existing routes.

## Phase 3: Exposing the Library
- Wrap the core Knowledge Engine data (the final JSON outputs) into a clean TypeScript service or module.
- Allow the main TradeOS backend (e.g., tRPC or REST routes) to query this service for Costbook items and Assemblies.

## Phase 4: Sync Pipeline
- Rather than executing legacy SQL exports directly, wire the Knowledge Engine's output into a safe seed script or API endpoint.
- Develop a sync mechanism to allow administrators to refresh the database with updated Knowledge Engine data when new agent runs are completed.

## Important Constraints
- **Do not overwrite production Prisma schemas** directly with legacy schemas. Always merge additively.
- **Do not run agent generation scripts in the production runtime**. Generation should be an offline or CI/CD process that publishes static outputs for TradeOS to consume.
