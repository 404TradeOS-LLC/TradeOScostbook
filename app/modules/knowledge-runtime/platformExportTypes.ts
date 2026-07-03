// Legacy Knowledge Engine bridge — export contract types.
//
// These interfaces describe our best-effort model of what a legacy
// Knowledge Engine export bundle looks like, shaped around the five things
// docs/legacy-knowledge-integration-plan.md says we need to bridge: cost
// items, assemblies, relationships, trades/taxonomy, and metadata.
//
// No real legacy export sample was available this sprint (the Knowledge
// Engine source itself is out of scope — see mission constraints). Field
// names and shapes here are a planning hypothesis, not a confirmed contract.
// Reconcile against a real export before importer.ts gains a real write
// path; see the "Open questions" section of the integration plan.

export type KnowledgeEngineTaxonomyLevel = "division" | "category" | "subcategory" | "trade";

/**
 * A single node in the legacy taxonomy tree. TradeOS's own hierarchy is
 * Division -> Category -> Subcategory (see CostDatabaseService); "trade" is
 * modeled here as a distinct, flatter taxonomy level because TradeOS already
 * has two independent trade-like concepts (LaborRate.trade,
 * Subcontractor.trade, and project-intake's closed `Trade` union) that a
 * legacy "trade" taxonomy would need to reconcile with, not a third
 * unrelated field.
 */
export interface KnowledgeEngineTaxonomyNode {
  legacyId: string;
  level: KnowledgeEngineTaxonomyLevel;
  code: string;
  name: string;
  /** null for a root node (top-level division or trade). */
  parentLegacyId: string | null;
}

export interface KnowledgeEngineCostItemExport {
  legacyId: string;
  code: string;
  name: string;
  unitOfMeasure: string;
  /** References a KnowledgeEngineTaxonomyNode with level "subcategory". */
  taxonomyLegacyId: string;
  tradeLegacyId?: string | null;
  productionRate?: number | null;
  laborRateLegacyId?: string | null;
  materialLegacyId?: string | null;
  equipmentLegacyId?: string | null;
  notes?: string | null;
  /**
   * Legacy fields with no confirmed home in TradeOS's relational schema yet.
   * Carried through opaquely rather than dropped or guessed at — see the
   * "stays as JSON metadata" section of the integration plan.
   */
  metadata?: Record<string, unknown> | null;
}

export interface KnowledgeEngineAssemblyExport {
  legacyId: string;
  code: string;
  name: string;
  unitOfMeasure: string;
  description?: string | null;
  isTemplate?: boolean;
  metadata?: Record<string, unknown> | null;
}

export type KnowledgeEngineRelationshipKind =
  | "assembly_contains_cost_item"
  | "assembly_contains_assembly";

/**
 * Mirrors TradeOS's own AssemblyItem shape: a parent assembly contains
 * exactly one of a cost item or a child assembly, at some quantity per unit.
 */
export interface KnowledgeEngineRelationshipExport {
  kind: KnowledgeEngineRelationshipKind;
  parentAssemblyLegacyId: string;
  childCostItemLegacyId?: string | null;
  childAssemblyLegacyId?: string | null;
  quantityPerUnit: number;
  sortOrder?: number;
}

/** The full payload one legacy export produces. */
export interface KnowledgeEngineExportBundle {
  exportedAt: string;
  sourceSystem: string;
  taxonomy: KnowledgeEngineTaxonomyNode[];
  costItems: KnowledgeEngineCostItemExport[];
  assemblies: KnowledgeEngineAssemblyExport[];
  relationships: KnowledgeEngineRelationshipExport[];
}
