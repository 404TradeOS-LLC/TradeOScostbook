/**
 * Knowledge Engine -> platform export pipeline.
 *
 * Reads the approved, versioned assembly content from
 * app/modules/assemblies-database/knowledge/ (read-only; this script never
 * writes there, and never invents new assemblies) and emits platform-ready
 * JSON snapshots into exports/platform/.
 *
 * Usage (from repo root):
 *   app/node_modules/.bin/ts-node --project pipelines/export/tsconfig.json \
 *     pipelines/export/generate-platform-exports.ts
 *
 * See docs/platform-import-contract.md for how TradeOS should consume the
 * output, and docs/prisma-gap-analysis.md for where the sub-score constants
 * below (schemaAlignmentPct) come from.
 */
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import {
  listAll,
  listTrades,
  listByTrade,
} from "../../app/modules/assemblies-database/knowledge/registry";
import type {
  KnowledgeAssembly,
  AssemblyPricingHook,
} from "../../app/modules/assemblies-database/knowledge/types";

const EXPORT_VERSION = "1.0.0";
const TARGET_ASSEMBLIES_PER_TRADE = 100; // per prompts/agent-costbook-architect.md "LONG-TERM GOAL"
const OUT_DIR = path.resolve(__dirname, "../../exports/platform");
const REPO_ROOT = path.resolve(__dirname, "../..");

function tradeSlug(trade: string): string {
  return trade
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function writeJson(fileName: string, data: unknown): void {
  const filePath = path.join(OUT_DIR, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`wrote ${path.relative(REPO_ROOT, filePath)}`);
}

function gitRevision(): string {
  try {
    return execSync("git rev-parse HEAD", {
      cwd: REPO_ROOT,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "unknown";
  }
}

function isAssemblyContentComplete(a: KnowledgeAssembly): boolean {
  const nonEmptyString = (s: string) => typeof s === "string" && s.trim().length > 0;
  const nonEmptyArray = (arr: unknown[]) => Array.isArray(arr) && arr.length > 0;
  return (
    nonEmptyString(a.id) &&
    nonEmptyString(a.name) &&
    nonEmptyString(a.description) &&
    nonEmptyString(a.customerDescription) &&
    nonEmptyString(a.contractorNotes) &&
    nonEmptyString(a.typicalUseCase) &&
    nonEmptyArray(a.projectTypes) &&
    nonEmptyArray(a.requiredInputs) &&
    nonEmptyArray(a.materialCategories) &&
    nonEmptyArray(a.laborCategories) &&
    nonEmptyArray(a.equipmentCategories) &&
    nonEmptyArray(a.safetyRequirements) &&
    nonEmptyArray(a.riskFactors) &&
    nonEmptyArray(a.proposalIntelligence.scopeOfWork) &&
    nonEmptyArray(a.proposalIntelligence.assumptions) &&
    nonEmptyArray(a.proposalIntelligence.exclusions) &&
    nonEmptyString(a.proposalIntelligence.warranty) &&
    nonEmptyArray(a.productionNotes) &&
    nonEmptyArray(a.pricingHooks) &&
    nonEmptyArray(a.aiNotes)
  );
}

function main(): void {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const generatedAt = new Date().toISOString();
  const all = listAll();
  const trades = listTrades();

  // ---------- assemblies.json ----------
  writeJson("assemblies.json", {
    exportVersion: EXPORT_VERSION,
    generatedAt,
    sourceKnowledgeAssemblySchemaVersion: 1,
    count: all.length,
    assemblies: all.map((a) => ({ ...a, tradeSlug: tradeSlug(a.trade) })),
  });

  // ---------- cost-items.json (deduplicated pricing-hook catalog) ----------
  type HookCatalogEntry = {
    kind: AssemblyPricingHook["kind"];
    refSlug: string;
    description: string;
    descriptionVariants?: string[];
    estimatedUnitOfMeasure?: string;
    occurrences: number;
    referencedByAssemblyIds: string[];
  };
  const hookCatalog = new Map<string, HookCatalogEntry>();
  for (const assembly of all) {
    for (const hook of assembly.pricingHooks) {
      const key = `${hook.kind}::${hook.refSlug}`;
      let entry = hookCatalog.get(key);
      if (!entry) {
        entry = {
          kind: hook.kind,
          refSlug: hook.refSlug,
          description: hook.description,
          descriptionVariants: [hook.description],
          estimatedUnitOfMeasure: hook.estimatedUnitOfMeasure,
          occurrences: 0,
          referencedByAssemblyIds: [],
        };
        hookCatalog.set(key, entry);
      }
      entry.occurrences += 1;
      entry.referencedByAssemblyIds.push(assembly.id);
      if (entry.descriptionVariants && !entry.descriptionVariants.includes(hook.description)) {
        entry.descriptionVariants.push(hook.description);
      }
    }
  }
  const hookEntries = Array.from(hookCatalog.values())
    .map((entry) => ({
      ...entry,
      descriptionVariants:
        entry.descriptionVariants && entry.descriptionVariants.length > 1
          ? entry.descriptionVariants
          : undefined,
    }))
    .sort((a, b) => (a.kind === b.kind ? a.refSlug.localeCompare(b.refSlug) : a.kind.localeCompare(b.kind)));

  const kindCounts: Record<string, number> = {};
  for (const entry of hookEntries) {
    kindCounts[entry.kind] = (kindCounts[entry.kind] ?? 0) + 1;
  }

  writeJson("cost-items.json", {
    exportVersion: EXPORT_VERSION,
    generatedAt,
    description:
      "Deduplicated catalog of future priced-catalog placeholders (pricingHooks) named across all exported assemblies. Each entry is NOT a priced Prisma record -- refSlug is a human-readable handle a future sync/import step uses to find-or-create the matching CostItem, Material, LaborRate, Equipment, Subcontractor, or child Assembly row in an org's catalog. See docs/platform-field-mapping.md.",
    count: hookEntries.length,
    countByKind: kindCounts,
    items: hookEntries,
  });

  // ---------- relationships.json ----------
  const idSet = new Set(all.map((a) => a.id));
  const assemblyDependencies: Array<{
    fromAssemblyId: string;
    toAssemblyId: string;
    targetExistsInExport: boolean;
  }> = [];
  const unresolvedTargets = new Set<string>();
  for (const assembly of all) {
    for (const dep of assembly.dependencies) {
      const exists = idSet.has(dep);
      assemblyDependencies.push({
        fromAssemblyId: assembly.id,
        toAssemblyId: dep,
        targetExistsInExport: exists,
      });
      if (!exists) unresolvedTargets.add(dep);
    }
  }
  const assemblyPricingHookReferences = all.flatMap((assembly) =>
    assembly.pricingHooks.map((hook) => ({
      assemblyId: assembly.id,
      kind: hook.kind,
      refSlug: hook.refSlug,
    })),
  );

  writeJson("relationships.json", {
    exportVersion: EXPORT_VERSION,
    generatedAt,
    description:
      "Graph edges between exported records: assembly-to-assembly dependencies (KnowledgeAssembly.dependencies) and assembly-to-pricing-hook references (KnowledgeAssembly.pricingHooks). targetExistsInExport is false for forward-referenced assembly ids that are documented as planned but not yet authored -- see docs/knowledge-engine/tree-service-progress.md.",
    assemblyDependencies,
    assemblyPricingHookReferences,
    unresolvedDependencyTargets: Array.from(unresolvedTargets).sort(),
  });

  // ---------- trades.json ----------
  const tradesOut = trades.map((trade) => {
    const assemblies = listByTrade(trade);
    const categoryMap = new Map<string, Set<string>>();
    const csiDivisions = new Set<string>();
    for (const a of assemblies) {
      if (!categoryMap.has(a.category)) categoryMap.set(a.category, new Set());
      categoryMap.get(a.category)!.add(a.subcategory);
      if (a.csiDivision) csiDivisions.add(a.csiDivision);
    }
    const categories = Array.from(categoryMap.entries())
      .map(([category, subcats]) => ({
        category,
        subcategories: Array.from(subcats).sort(),
        assemblyCount: assemblies.filter((a) => a.category === category).length,
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
    return {
      trade,
      tradeSlug: tradeSlug(trade),
      assemblyCount: assemblies.length,
      targetAssemblyCount: TARGET_ASSEMBLIES_PER_TRADE,
      completionPct: Math.round((assemblies.length / TARGET_ASSEMBLIES_PER_TRADE) * 1000) / 10,
      categories,
      csiDivisions: Array.from(csiDivisions).sort(),
    };
  });

  writeJson("trades.json", {
    exportVersion: EXPORT_VERSION,
    generatedAt,
    count: tradesOut.length,
    trades: tradesOut,
  });

  // ---------- manifest.json ----------
  const totalDependencyEdges = assemblyDependencies.length;
  const resolvedDependencyEdges = assemblyDependencies.filter((e) => e.targetExistsInExport).length;
  const dependencyIntegrityPct =
    totalDependencyEdges === 0 ? 100 : Math.round((resolvedDependencyEdges / totalDependencyEdges) * 1000) / 10;

  const completenessChecks = all.map(isAssemblyContentComplete);
  const completenessPct = Math.round((completenessChecks.filter(Boolean).length / all.length) * 1000) / 10;

  const catalogCoveragePct =
    Math.round(
      (tradesOut.reduce((sum, t) => sum + t.assemblyCount / t.targetAssemblyCount, 0) / tradesOut.length) * 1000,
    ) / 10;

  // No pricingHooks are wired to a real catalog id anywhere yet.
  const pricingHookResolvedPct = 0;

  // 5 of 31 KnowledgeAssembly field-groups already map onto an existing
  // Prisma column with zero schema change (id/slug->code, name, unitOfMeasure,
  // description). See docs/prisma-gap-analysis.md "Already-supported" table.
  const schemaAlignmentPct = Math.round((5 / 31) * 1000) / 10;

  const importReadinessScore = Math.round(
    (completenessPct + dependencyIntegrityPct + catalogCoveragePct + pricingHookResolvedPct + schemaAlignmentPct) / 5,
  );

  writeJson("manifest.json", {
    exportVersion: EXPORT_VERSION,
    generatedAt,
    generatedBy: "pipelines/export/generate-platform-exports.ts",
    sourceKnowledgeEngineGitRevision: gitRevision(),
    recordCounts: {
      trades: tradesOut.length,
      assemblies: all.length,
      categories: tradesOut.reduce((sum, t) => sum + t.categories.length, 0),
      subcategories: tradesOut.reduce(
        (sum, t) => sum + t.categories.reduce((s2, c) => s2 + c.subcategories.length, 0),
        0,
      ),
      uniquePricingHooks: hookEntries.length,
      pricingHooksByKind: kindCounts,
      assemblyDependencyEdges: totalDependencyEdges,
      unresolvedDependencyTargets: unresolvedTargets.size,
    },
    tradesIncluded: trades,
    schemaVersions: {
      knowledgeAssemblySchemaVersion: 1,
      platformExportContractVersion: EXPORT_VERSION,
    },
    knownLimitations: [
      "Only one trade (Tree Service) and one batch (10 of ~100 planned assemblies) exist -- this is an early, partial export, not a complete catalog.",
      "pricingHooks are placeholders only (kind + human-readable refSlug); none are wired to a real CostItem/Material/LaborRate/Equipment/Subcontractor/Assembly id in any org's Prisma-backed catalog.",
      `${unresolvedTargets.size} assembly dependency target id(s) are forward references to assemblies not yet authored (tracked in docs/knowledge-engine/tree-service-progress.md): ${
        Array.from(unresolvedTargets).sort().join(", ") || "none"
      }.`,
      "No costItem-kind pricingHooks exist yet in the source data -- every hook so far is laborRate, equipment, material, subcontractor, or childAssembly.",
      "trade/category/subcategory/projectTypes/constructionPhase/requiredInputs/dependencies/proposalIntelligence have no dedicated Prisma columns or tables today; the runtime Assembly model only has id/orgId/code/name/unitOfMeasure/description/isTemplate/isActive. See docs/prisma-gap-analysis.md.",
      "This content has no orgId and is not read by any TradeOS request path today -- it is a standalone versioned layer pending a future sync/import job (see docs/platform-runtime-bridge-plan.md).",
    ],
    importReadiness: {
      score: importReadinessScore,
      scale: "0-100 (higher = closer to safe automated import)",
      components: {
        contentCompletenessPct: completenessPct,
        dependencyGraphIntegrityPct: dependencyIntegrityPct,
        catalogCoveragePct: catalogCoveragePct,
        pricingHookResolutionPct: pricingHookResolvedPct,
        prismaSchemaAlignmentPct: schemaAlignmentPct,
      },
      methodology:
        "Unweighted average of five 0-100 sub-scores: (1) fraction of assemblies with every required narrative/array field populated, (2) fraction of dependency edges whose target id exists in this export, (3) fraction of each trade's ~100-assembly target already authored, (4) fraction of pricingHooks resolved to a real catalog id (0 today), (5) fraction of KnowledgeAssembly field-groups already supported by an existing Prisma column without new schema work (see docs/prisma-gap-analysis.md).",
      recommendation:
        importReadinessScore < 60
          ? "Not ready for automated/unattended import. Suitable today only as a reviewed, manually-curated reference catalog (e.g. for an estimator UI or an AI intake prompt), not as a direct write path into the Prisma-backed catalog."
          : "Reasonable candidate for a supervised import job with human review of each pricing-hook resolution.",
    },
  });
}

main();
