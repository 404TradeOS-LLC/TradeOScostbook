/**
 * Knowledge Runtime Bridge — pure mapping functions.
 *
 * Converts between this module's own bridge types (types.ts) and the
 * summary shapes repositories/search adapters return. Deliberately pure
 * (no I/O, no side effects) so these can be unit tested without mocking
 * anything once real adapters exist.
 */

import {
  AssemblyMatch,
  KnowledgeAssemblySummary,
  ProposalNarrativeBlock,
  RuntimeAssemblySummary,
  RuntimeCostItemSummary,
  ScopeMatchResult,
} from "./types";

/**
 * Builds the narrative block a proposal-context consumer needs from a
 * matched knowledge assembly. Placeholder: the Construction Knowledge
 * Engine's `ProposalIntelligence` fields (scopeOfWork/assumptions/
 * exclusions/warranty) are not part of KnowledgeAssemblySummary yet — this
 * returns empty narrative content until that projection is widened.
 */
export function toProposalNarrativeBlock(assembly: KnowledgeAssemblySummary): ProposalNarrativeBlock {
  return {
    knowledgeSlug: assembly.slug,
    scopeOfWork: [],
    assumptions: [],
    exclusions: [],
    warranty: "",
  };
}

/** Extracts the runtime cost items resolved for a given assembly match's scope. */
export function toResolvedCostItems(scopeMatch: ScopeMatchResult): RuntimeCostItemSummary[] {
  return scopeMatch.resolvedCostItems;
}

/** Extracts the runtime assemblies resolved for a given assembly match's scope. */
export function toResolvedAssemblies(scopeMatch: ScopeMatchResult): RuntimeAssemblySummary[] {
  return scopeMatch.resolvedAssemblies;
}

/** Sorts assembly matches by descending relevance score (highest first). */
export function sortByScoreDescending(matches: AssemblyMatch[]): AssemblyMatch[] {
  return [...matches].sort((a, b) => b.score - a.score);
}
