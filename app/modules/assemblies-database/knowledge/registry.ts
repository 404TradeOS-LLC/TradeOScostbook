import { KnowledgeAssembly } from "./types";
import { treeServiceAssemblies } from "./trades/tree-service";

// Aggregates every trade's authored knowledge-engine content. Add a new
// `import { xAssemblies } from "./trades/x"` entry here as each new trade starts.
const assembliesByTrade: Record<string, KnowledgeAssembly[]> = {
  "Tree Service": treeServiceAssemblies,
};

export function listTrades(): string[] {
  return Object.keys(assembliesByTrade);
}

export function listByTrade(trade: string): KnowledgeAssembly[] {
  return assembliesByTrade[trade] ?? [];
}

export function listAll(): KnowledgeAssembly[] {
  return Object.values(assembliesByTrade).flat();
}

export function getById(id: string): KnowledgeAssembly | undefined {
  return listAll().find((assembly) => assembly.id === id);
}
