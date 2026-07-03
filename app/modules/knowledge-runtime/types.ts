/**
 * Knowledge Runtime Bridge — shared types.
 *
 * These types describe the *shape* this module speaks in, on both sides
 * of the bridge:
 *   - "Knowledge-side" types describe content coming from the Construction
 *     Knowledge Engine (a versioned, trade-scoped content layer that is
 *     being built independently — see app/modules/knowledge-runtime/README.md).
 *   - "Runtime-side" types describe the org-scoped, priced catalog this
 *     app already has (Assembly/CostItem, via the existing
 *     assemblies-database and cost-database modules).
 *
 * Nothing in this file performs I/O. See README.md for what is and is not
 * implemented yet.
 */

/** Opaque identifier for a knowledge-side record (e.g. "tree-service.removal.large-tree"). */
export type KnowledgeSlug = string;

/** Opaque identifier for a runtime, org-scoped Prisma row (Assembly.id / CostItem.id). */
export type RuntimeId = string;

export type ConstructionPhase =
  | "pre-construction"
  | "site-prep"
  | "rough"
  | "finish"
  | "post-construction"
  | "maintenance"
  | "emergency-response";

/**
 * A minimal, read-only projection of a Construction Knowledge Engine
 * assembly record. This is intentionally a *subset* of that engine's full
 * authoring schema (narrative fields like risk factors, permit awareness,
 * production notes, etc. are omitted here) — the bridge only needs enough
 * to search, match, and summarize scope, not to author content.
 */
export interface KnowledgeAssemblySummary {
  slug: KnowledgeSlug;
  version: number;
  trade: string;
  category: string;
  subcategory: string;
  name: string;
  unitOfMeasure: string;
  description: string;
  customerDescription: string;
  constructionPhase: ConstructionPhase;
  projectTypes: string[];
  requiredInputKeys: string[];
  optionalInputKeys: string[];
  /** Other knowledge slugs this one commonly depends on or pairs with. */
  dependencies: KnowledgeSlug[];
}

/** A minimal, read-only projection of a runtime CostItemDTO relevant to matching/pricing. */
export interface RuntimeCostItemSummary {
  id: RuntimeId;
  orgId: string | null;
  code: string;
  name: string;
  unitOfMeasure: string;
  isActive: boolean;
}

/** A minimal, read-only projection of a runtime AssemblyDTO relevant to matching/pricing. */
export interface RuntimeAssemblySummary {
  id: RuntimeId;
  orgId: string | null;
  code: string;
  name: string;
  unitOfMeasure: string;
  isTemplate: boolean;
  isActive: boolean;
}

/** A single search hit against knowledge-side assembly content, with a relevance score. */
export interface AssemblyMatch {
  assembly: KnowledgeAssemblySummary;
  /** 0 (no relevance) to 1 (exact match). Scoring strategy is an implementation detail. */
  score: number;
  matchedOn: string[];
}

/** A single search hit against the runtime, org-scoped priced cost-item catalog. */
export interface CostItemMatch {
  costItem: RuntimeCostItemSummary;
  score: number;
  matchedOn: string[];
}

/** Free-text search input shared by assembly and cost-item search. */
export interface KnowledgeSearchQuery {
  orgId: string;
  text: string;
  trade?: string;
  limit?: number;
}

/**
 * The result of attempting to line up a knowledge-side assembly's
 * `pricingHooks` against an org's actual priced catalog (CostItem/Material/
 * LaborRate/Equipment/Assembly rows). Each hook either resolves to an
 * existing runtime record, or does not — this type carries both outcomes
 * so a caller can decide what to do about gaps (e.g. prompt the estimator
 * to price a missing item) rather than that decision being made here.
 */
export interface ScopeMatchResult {
  knowledgeSlug: KnowledgeSlug;
  orgId: string;
  resolvedCostItems: RuntimeCostItemSummary[];
  resolvedAssemblies: RuntimeAssemblySummary[];
  /** Pricing hooks from the knowledge record with no corresponding runtime record found. */
  unresolvedHookRefSlugs: string[];
}

/**
 * Context assembled for an estimator (human or AI) building an estimate:
 * candidate knowledge assemblies plus what of that scope is already priced
 * in the org's catalog, and what is not.
 */
export interface EstimateContext {
  orgId: string;
  projectId: string;
  candidateAssemblies: AssemblyMatch[];
  scopeMatches: ScopeMatchResult[];
  /** Knowledge input keys (required or optional) not yet supplied by the caller. */
  missingInputKeys: string[];
}

/**
 * Context assembled for proposal drafting: narrative content
 * (scope-of-work / assumptions / exclusions / warranty) pulled from
 * matched knowledge assemblies, keyed by knowledge slug so a caller can
 * trace which assembly contributed which narrative block.
 */
export interface ProposalNarrativeBlock {
  knowledgeSlug: KnowledgeSlug;
  scopeOfWork: string[];
  assumptions: string[];
  exclusions: string[];
  warranty: string;
}

export interface ProposalContext {
  orgId: string;
  projectId: string;
  estimateId: string;
  narrativeBlocks: ProposalNarrativeBlock[];
}
