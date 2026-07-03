/**
 * Knowledge Runtime Bridge — service stubs.
 *
 * KnowledgeRuntimeService is the single entry point future callers (an
 * estimate-context builder, a proposal-drafting flow, an AI intake flow)
 * are expected to depend on. Every method here is a typed stub: signatures
 * are final enough to code against, but no method performs real matching,
 * search, or I/O yet. See README.md for what's intentionally deferred.
 */

import {
  AssemblyRepository,
  CostItemRepository,
  KnowledgeRuntimeDependencies,
  KnowledgeSearch,
} from "./interfaces";
import {
  AssemblyMatch,
  CostItemMatch,
  EstimateContext,
  KnowledgeAssemblySummary,
  KnowledgeSearchQuery,
  KnowledgeSlug,
  ProposalContext,
  RuntimeCostItemSummary,
  RuntimeId,
  ScopeMatchResult,
} from "./types";
import { NotImplementedError } from "./errors";

export class KnowledgeRuntimeService {
  private readonly knowledgeSearch: KnowledgeSearch;
  private readonly assemblyRepository: AssemblyRepository;
  private readonly costItemRepository: CostItemRepository;

  constructor(deps: KnowledgeRuntimeDependencies) {
    this.knowledgeSearch = deps.knowledgeSearch;
    this.assemblyRepository = deps.assemblyRepository;
    this.costItemRepository = deps.costItemRepository;
  }

  /** Search the Construction Knowledge Engine's content for candidate assemblies. */
  async searchAssemblies(_query: KnowledgeSearchQuery): Promise<AssemblyMatch[]> {
    void this.knowledgeSearch;
    throw new NotImplementedError("searchAssemblies");
  }

  /** Search the runtime, org-scoped priced CostItem catalog. */
  async searchCostItems(_query: KnowledgeSearchQuery): Promise<CostItemMatch[]> {
    void this.costItemRepository;
    throw new NotImplementedError("searchCostItems");
  }

  /** Fetch a single knowledge-side assembly record by slug. */
  async getAssembly(_slug: KnowledgeSlug): Promise<KnowledgeAssemblySummary | null> {
    void this.knowledgeSearch;
    throw new NotImplementedError("getAssembly");
  }

  /** Fetch a single runtime, org-scoped CostItem by id. */
  async getCostItem(_orgId: string, _id: RuntimeId): Promise<RuntimeCostItemSummary | null> {
    void this.costItemRepository;
    throw new NotImplementedError("getCostItem");
  }

  /**
   * Line up a knowledge-side assembly's pricing hooks against an org's
   * actual priced catalog, reporting what resolves and what doesn't.
   */
  async matchScope(_orgId: string, _knowledgeSlug: KnowledgeSlug): Promise<ScopeMatchResult> {
    void this.knowledgeSearch;
    void this.assemblyRepository;
    void this.costItemRepository;
    throw new NotImplementedError("matchScope");
  }

  /** Assemble estimate-building context: candidate assemblies plus scope-match results. */
  async buildEstimateContext(_orgId: string, _projectId: string, _searchText: string): Promise<EstimateContext> {
    void this.knowledgeSearch;
    void this.assemblyRepository;
    void this.costItemRepository;
    throw new NotImplementedError("buildEstimateContext");
  }

  /** Assemble proposal-drafting context: narrative content for an estimate's matched assemblies. */
  async buildProposalContext(_orgId: string, _projectId: string, _estimateId: string): Promise<ProposalContext> {
    void this.knowledgeSearch;
    throw new NotImplementedError("buildProposalContext");
  }
}
