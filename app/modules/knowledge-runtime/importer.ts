// Legacy Knowledge Engine bridge — importer stub.
//
// Scope for this sprint (see docs/legacy-knowledge-integration-plan.md):
// planning + typed bridge only. This module validates the internal
// consistency of a KnowledgeEngineExportBundle and produces a dry-run plan
// describing what an import *would* do — it never touches Prisma, never
// calls CostDatabaseService/AssembliesDatabaseService, and never writes to
// the database. Wiring an actual write path is next-sprint work, gated on
// reconciling platformExportTypes.ts against a real legacy export sample.

import {
  KnowledgeEngineAssemblyExport,
  KnowledgeEngineCostItemExport,
  KnowledgeEngineExportBundle,
  KnowledgeEngineRelationshipExport,
  KnowledgeEngineTaxonomyNode,
} from "./platformExportTypes";

export type ImportIssueSeverity = "error" | "warning";

export interface ImportIssue {
  entityKind: "taxonomy" | "cost_item" | "assembly" | "relationship";
  legacyId: string;
  severity: ImportIssueSeverity;
  message: string;
}

export interface ImportPlanSummary {
  taxonomyNodeCount: number;
  costItemCount: number;
  assemblyCount: number;
  relationshipCount: number;
  issues: ImportIssue[];
}

/**
 * Validates a legacy Knowledge Engine export bundle for internal referential
 * integrity (dangling parent/child references, duplicate legacy ids,
 * malformed relationships) and reports what it finds. Does not touch the
 * database and does not attempt to resolve legacy ids against existing
 * TradeOS rows — that mapping step is explicitly out of scope this sprint.
 */
export class KnowledgeEngineImporter {
  planImport(bundle: KnowledgeEngineExportBundle): ImportPlanSummary {
    const issues: ImportIssue[] = [
      ...this.validateTaxonomy(bundle.taxonomy),
      ...this.validateCostItems(bundle.costItems, bundle.taxonomy),
      ...this.validateAssemblies(bundle.assemblies),
      ...this.validateRelationships(bundle.relationships, bundle.costItems, bundle.assemblies),
    ];

    return {
      taxonomyNodeCount: bundle.taxonomy.length,
      costItemCount: bundle.costItems.length,
      assemblyCount: bundle.assemblies.length,
      relationshipCount: bundle.relationships.length,
      issues,
    };
  }

  private validateTaxonomy(taxonomy: KnowledgeEngineTaxonomyNode[]): ImportIssue[] {
    const issues: ImportIssue[] = [];
    const seen = new Set<string>();
    const idsById = new Set(taxonomy.map((node) => node.legacyId));

    for (const node of taxonomy) {
      if (seen.has(node.legacyId)) {
        issues.push({
          entityKind: "taxonomy",
          legacyId: node.legacyId,
          severity: "error",
          message: `Duplicate taxonomy legacyId "${node.legacyId}"`,
        });
      }
      seen.add(node.legacyId);

      if (node.parentLegacyId && !idsById.has(node.parentLegacyId)) {
        issues.push({
          entityKind: "taxonomy",
          legacyId: node.legacyId,
          severity: "error",
          message: `parentLegacyId "${node.parentLegacyId}" does not exist in this bundle`,
        });
      }
    }

    return issues;
  }

  private validateCostItems(
    costItems: KnowledgeEngineCostItemExport[],
    taxonomy: KnowledgeEngineTaxonomyNode[],
  ): ImportIssue[] {
    const issues: ImportIssue[] = [];
    const seen = new Set<string>();
    const subcategoryIds = new Set(taxonomy.filter((node) => node.level === "subcategory").map((node) => node.legacyId));

    for (const item of costItems) {
      if (seen.has(item.legacyId)) {
        issues.push({
          entityKind: "cost_item",
          legacyId: item.legacyId,
          severity: "error",
          message: `Duplicate cost item legacyId "${item.legacyId}"`,
        });
      }
      seen.add(item.legacyId);

      if (!subcategoryIds.has(item.taxonomyLegacyId)) {
        issues.push({
          entityKind: "cost_item",
          legacyId: item.legacyId,
          severity: "error",
          message: `taxonomyLegacyId "${item.taxonomyLegacyId}" is not a known subcategory in this bundle`,
        });
      }

      if (!item.unitOfMeasure) {
        issues.push({
          entityKind: "cost_item",
          legacyId: item.legacyId,
          severity: "error",
          message: "unitOfMeasure is required",
        });
      }
    }

    return issues;
  }

  private validateAssemblies(assemblies: KnowledgeEngineAssemblyExport[]): ImportIssue[] {
    const issues: ImportIssue[] = [];
    const seen = new Set<string>();

    for (const assembly of assemblies) {
      if (seen.has(assembly.legacyId)) {
        issues.push({
          entityKind: "assembly",
          legacyId: assembly.legacyId,
          severity: "error",
          message: `Duplicate assembly legacyId "${assembly.legacyId}"`,
        });
      }
      seen.add(assembly.legacyId);

      if (!assembly.unitOfMeasure) {
        issues.push({
          entityKind: "assembly",
          legacyId: assembly.legacyId,
          severity: "error",
          message: "unitOfMeasure is required",
        });
      }
    }

    return issues;
  }

  private validateRelationships(
    relationships: KnowledgeEngineRelationshipExport[],
    costItems: KnowledgeEngineCostItemExport[],
    assemblies: KnowledgeEngineAssemblyExport[],
  ): ImportIssue[] {
    const issues: ImportIssue[] = [];
    const costItemIds = new Set(costItems.map((item) => item.legacyId));
    const assemblyIds = new Set(assemblies.map((assembly) => assembly.legacyId));

    relationships.forEach((rel, index) => {
      const label = `relationship[${index}] (parent ${rel.parentAssemblyLegacyId})`;

      if (!assemblyIds.has(rel.parentAssemblyLegacyId)) {
        issues.push({
          entityKind: "relationship",
          legacyId: rel.parentAssemblyLegacyId,
          severity: "error",
          message: `${label}: parentAssemblyLegacyId does not reference a known assembly`,
        });
      }

      const hasChildCostItem = Boolean(rel.childCostItemLegacyId);
      const hasChildAssembly = Boolean(rel.childAssemblyLegacyId);

      if (hasChildCostItem === hasChildAssembly) {
        issues.push({
          entityKind: "relationship",
          legacyId: rel.parentAssemblyLegacyId,
          severity: "error",
          message: `${label}: exactly one of childCostItemLegacyId or childAssemblyLegacyId is required`,
        });
      } else if (hasChildCostItem && !costItemIds.has(rel.childCostItemLegacyId as string)) {
        issues.push({
          entityKind: "relationship",
          legacyId: rel.parentAssemblyLegacyId,
          severity: "error",
          message: `${label}: childCostItemLegacyId "${rel.childCostItemLegacyId}" does not reference a known cost item`,
        });
      } else if (hasChildAssembly && !assemblyIds.has(rel.childAssemblyLegacyId as string)) {
        issues.push({
          entityKind: "relationship",
          legacyId: rel.parentAssemblyLegacyId,
          severity: "error",
          message: `${label}: childAssemblyLegacyId "${rel.childAssemblyLegacyId}" does not reference a known assembly`,
        });
      }

      if (rel.kind === "assembly_contains_assembly" && rel.parentAssemblyLegacyId === rel.childAssemblyLegacyId) {
        issues.push({
          entityKind: "relationship",
          legacyId: rel.parentAssemblyLegacyId,
          severity: "error",
          message: `${label}: an assembly cannot contain itself`,
        });
      }

      if (!(rel.quantityPerUnit > 0)) {
        issues.push({
          entityKind: "relationship",
          legacyId: rel.parentAssemblyLegacyId,
          severity: "warning",
          message: `${label}: quantityPerUnit should be a positive number, got ${rel.quantityPerUnit}`,
        });
      }
    });

    return issues;
  }
}
