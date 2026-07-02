import { KnowledgeAssembly } from "../../types";
import { batch01 } from "./batch-01";

// Concatenates all authored batches for Tree Service, in batch order.
// Add new `import { batchNN } from "./batch-NN"` + array entries as batches land.
export const treeServiceAssemblies: KnowledgeAssembly[] = [...batch01];
