/**
 * Knowledge Runtime Bridge — repository placeholders.
 *
 * These classes implement the interfaces from interfaces.ts but perform no
 * I/O: every method throws NotImplementedError. They exist so
 * KnowledgeRuntimeService has a concrete dependency shape to be
 * constructed with today, and so future work can replace one method at a
 * time (e.g. wire AssemblyRepository to app/modules/assemblies-database's
 * Prisma-backed service) without changing the service's constructor
 * signature.
 *
 * Deliberately not implemented here:
 *   - Any Prisma/database access (this module does not touch app/prisma).
 *   - Any dependency on the Construction Knowledge Engine's actual content
 *     module, which is still under construction elsewhere and is not yet
 *     safe to import from here.
 */

import {
  AssemblyRepository,
  CostItemRepository,
  KnowledgeSearch,
} from "./interfaces";
import {
  AssemblyMatch,
  KnowledgeAssemblySummary,
  KnowledgeSearchQuery,
  KnowledgeSlug,
  RuntimeAssemblySummary,
  RuntimeCostItemSummary,
  RuntimeId,
} from "./types";
import { NotImplementedError } from "./errors";

export class NotImplementedAssemblyRepository implements AssemblyRepository {
  findById(_orgId: string, _id: RuntimeId): Promise<RuntimeAssemblySummary | null> {
    throw new NotImplementedError("AssemblyRepository.findById");
  }

  search(_query: KnowledgeSearchQuery): Promise<RuntimeAssemblySummary[]> {
    throw new NotImplementedError("AssemblyRepository.search");
  }
}

export class NotImplementedCostItemRepository implements CostItemRepository {
  findById(_orgId: string, _id: RuntimeId): Promise<RuntimeCostItemSummary | null> {
    throw new NotImplementedError("CostItemRepository.findById");
  }

  search(_query: KnowledgeSearchQuery): Promise<RuntimeCostItemSummary[]> {
    throw new NotImplementedError("CostItemRepository.search");
  }
}

export class NotImplementedKnowledgeSearch implements KnowledgeSearch {
  getBySlug(_slug: KnowledgeSlug): Promise<KnowledgeAssemblySummary | null> {
    throw new NotImplementedError("KnowledgeSearch.getBySlug");
  }

  searchAssemblies(_query: KnowledgeSearchQuery): Promise<AssemblyMatch[]> {
    throw new NotImplementedError("KnowledgeSearch.searchAssemblies");
  }
}
