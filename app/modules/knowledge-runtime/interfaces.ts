/**
 * Knowledge Runtime Bridge — repository and search contracts.
 *
 * These interfaces define the *shape* of adapters this module will
 * eventually depend on. No implementation exists yet (see repository.ts):
 * a real implementation will need to read from wherever the Construction
 * Knowledge Engine's content actually lives (in-process module, a future
 * content API, a database table, etc.) and from this app's existing
 * org-scoped Prisma models (Assembly/CostItem), respectively.
 *
 * Keeping these as interfaces — rather than importing a concrete engine or
 * Prisma client here — is deliberate: it lets KnowledgeRuntimeService be
 * written and tested against fakes before either side of the bridge is
 * wired to a real data source.
 */

import {
  AssemblyMatch,
  KnowledgeAssemblySummary,
  KnowledgeSearchQuery,
  KnowledgeSlug,
  RuntimeAssemblySummary,
  RuntimeCostItemSummary,
  RuntimeId,
} from "./types";

/**
 * Read access to the runtime, org-scoped Assembly catalog
 * (app/modules/assemblies-database). Deliberately read-only: this bridge
 * does not create or mutate priced catalog rows.
 */
export interface AssemblyRepository {
  findById(orgId: string, id: RuntimeId): Promise<RuntimeAssemblySummary | null>;
  search(query: KnowledgeSearchQuery): Promise<RuntimeAssemblySummary[]>;
}

/**
 * Read access to the runtime, org-scoped CostItem catalog
 * (app/modules/cost-database). Deliberately read-only, mirroring
 * AssemblyRepository.
 */
export interface CostItemRepository {
  findById(orgId: string, id: RuntimeId): Promise<RuntimeCostItemSummary | null>;
  search(query: KnowledgeSearchQuery): Promise<RuntimeCostItemSummary[]>;
}

/**
 * Read access to the Construction Knowledge Engine's content layer.
 * An eventual implementation is expected to wrap that engine's own
 * registry (e.g. listTrades/listByTrade/getById) and project its records
 * down to KnowledgeAssemblySummary.
 */
export interface KnowledgeSearch {
  getBySlug(slug: KnowledgeSlug): Promise<KnowledgeAssemblySummary | null>;
  searchAssemblies(query: KnowledgeSearchQuery): Promise<AssemblyMatch[]>;
}

/**
 * Everything a KnowledgeRuntimeService instance needs to do its job.
 * Grouping these as one dependency bag keeps the service constructor
 * stable as more adapters are added.
 */
export interface KnowledgeRuntimeDependencies {
  knowledgeSearch: KnowledgeSearch;
  assemblyRepository: AssemblyRepository;
  costItemRepository: CostItemRepository;
}
