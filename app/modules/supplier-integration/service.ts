import { prisma, basePrisma } from "../../db/client";
import { ApiError } from "../../backend/middleware/errorHandler";
import { AuthContext } from "../../backend/auth/context";
import { runInDatabaseTransaction } from "../../db/requestSession";
import {
  EnqueuePriceUpdateInput,
  ListQueueFilters,
  SupplierFeedFetcher,
  SupplierPriceUpdateDTO,
  SyncFromFeedInput,
  SyncFromFeedResult,
} from "./types";

// No live supplier feed exists yet (MVP scope) — this stub always reports
// nothing to propose. A real implementation (REST pull, webhook consumer,
// file drop parser) can be injected via the constructor without touching
// the queue/review/worker plumbing below.
async function stubFetchSupplierFeed(): Promise<never[]> {
  return [];
}

// Supplier Integrations module: queued-review staging for supplier-fed price
// proposals (see modules/material-database/service.ts's prior placeholder
// comment). A sync job enqueues proposals here instead of writing straight
// to materials; an admin/owner reviews and approves/rejects each one.
export class SupplierIntegrationService {
  constructor(private readonly fetchFeed: SupplierFeedFetcher = stubFetchSupplierFeed) {}

  async listQueue(orgId: string, filters: ListQueueFilters = {}): Promise<SupplierPriceUpdateDTO[]> {
    const rows = await prisma.supplierPriceUpdate.findMany({
      where: {
        orgId,
        status: filters.status,
        supplierId: filters.supplierId,
        materialId: filters.materialId,
      },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toDTO);
  }

  async enqueue(input: EnqueuePriceUpdateInput): Promise<SupplierPriceUpdateDTO> {
    const material = await prisma.material.findFirst({ where: { id: input.materialId, orgId: input.orgId } });
    if (!material) throw new ApiError(404, `Material ${input.materialId} not found`);
    const supplier = await prisma.supplier.findFirst({ where: { id: input.supplierId, orgId: input.orgId } });
    if (!supplier) throw new ApiError(404, `Supplier ${input.supplierId} not found`);

    const row = await prisma.supplierPriceUpdate.create({
      data: {
        orgId: input.orgId,
        supplierId: input.supplierId,
        materialId: input.materialId,
        currentUnitCost: material.unitCost,
        proposedUnitCost: input.proposedUnitCost,
        source: input.source ?? "supplier-feed",
        requestedByJob: input.requestedByJob,
      },
    });
    return toDTO(row);
  }

  async approve(id: string, orgId: string, actor: AuthContext): Promise<SupplierPriceUpdateDTO> {
    return runInDatabaseTransaction(basePrisma, async (transaction) => {
      const queued = await transaction.supplierPriceUpdate.findFirst({ where: { id, orgId } });
      if (!queued) throw new ApiError(404, `Supplier price update ${id} not found`);
      if (queued.status !== "pending") throw new ApiError(409, `Supplier price update ${id} is already ${queued.status}`);

      const material = await transaction.material.findFirst({ where: { id: queued.materialId, orgId } });
      if (!material) throw new ApiError(404, `Material ${queued.materialId} not found`);

      await transaction.material.update({
        where: { id: material.id },
        data: { unitCost: queued.proposedUnitCost, lastPriceUpdate: new Date() },
      });
      await transaction.materialPriceAudit.create({
        data: {
          orgId,
          materialId: material.id,
          materialName: material.name,
          oldUnitCost: material.unitCost,
          newUnitCost: queued.proposedUnitCost,
          source: queued.source,
          actorUserId: actor.userId,
          actorRole: actor.role,
        },
      });
      const reviewed = await transaction.supplierPriceUpdate.update({
        where: { id },
        data: { status: "approved", reviewedByUserId: actor.userId, reviewedAt: new Date() },
      });
      return toDTO(reviewed);
    });
  }

  async reject(id: string, orgId: string, actor: AuthContext): Promise<SupplierPriceUpdateDTO> {
    return runInDatabaseTransaction(basePrisma, async (transaction) => {
      const queued = await transaction.supplierPriceUpdate.findFirst({ where: { id, orgId } });
      if (!queued) throw new ApiError(404, `Supplier price update ${id} not found`);
      if (queued.status !== "pending") throw new ApiError(409, `Supplier price update ${id} is already ${queued.status}`);

      const reviewed = await transaction.supplierPriceUpdate.update({
        where: { id },
        data: { status: "rejected", reviewedByUserId: actor.userId, reviewedAt: new Date() },
      });
      return toDTO(reviewed);
    });
  }

  // Fetches quotes from the (currently stubbed) supplier feed and enqueues
  // one proposal per material whose quoted price actually differs from the
  // current price and isn't already awaiting review. Intended to run inside
  // runWithBackgroundDatabaseSession, not as part of a normal HTTP request.
  async syncFromFeed(input: SyncFromFeedInput): Promise<SyncFromFeedResult> {
    const quotes = await this.fetchFeed(input.supplierId);
    let proposed = 0;
    let skipped = 0;

    for (const quote of quotes) {
      const material = await prisma.material.findFirst({ where: { id: quote.materialId, orgId: input.orgId } });
      if (!material || Number(material.unitCost) === quote.proposedUnitCost) {
        skipped += 1;
        continue;
      }

      const alreadyPending = await prisma.supplierPriceUpdate.findFirst({
        where: { orgId: input.orgId, materialId: quote.materialId, supplierId: input.supplierId, status: "pending" },
      });
      if (alreadyPending) {
        skipped += 1;
        continue;
      }

      await this.enqueue({
        orgId: input.orgId,
        supplierId: input.supplierId,
        materialId: quote.materialId,
        proposedUnitCost: quote.proposedUnitCost,
        source: "supplier-feed",
        requestedByJob: input.requestedByJob,
      });
      proposed += 1;
    }

    return { proposed, skipped };
  }
}

function toDTO(row: {
  id: string;
  orgId: string;
  supplierId: string;
  materialId: string;
  currentUnitCost: unknown;
  proposedUnitCost: unknown;
  status: string;
  source: string;
  requestedByJob: string | null;
  reviewedByUserId: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
}): SupplierPriceUpdateDTO {
  return {
    id: row.id,
    orgId: row.orgId,
    supplierId: row.supplierId,
    materialId: row.materialId,
    currentUnitCost: Number(row.currentUnitCost),
    proposedUnitCost: Number(row.proposedUnitCost),
    status: row.status as SupplierPriceUpdateDTO["status"],
    source: row.source,
    requestedByJob: row.requestedByJob,
    reviewedByUserId: row.reviewedByUserId,
    reviewedAt: row.reviewedAt,
    createdAt: row.createdAt,
  };
}
