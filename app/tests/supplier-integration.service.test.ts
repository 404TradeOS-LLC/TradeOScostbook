const mockPrisma = {
  material: { findFirst: jest.fn() },
  supplier: { findFirst: jest.fn() },
  supplierPriceUpdate: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
};

const transaction = {
  supplierPriceUpdate: { findFirst: jest.fn(), update: jest.fn() },
  material: { findFirst: jest.fn(), update: jest.fn() },
  materialPriceAudit: { create: jest.fn() },
};
const basePrisma = {
  $transaction: jest.fn((operation: (client: typeof transaction) => unknown) => operation(transaction)),
};

jest.mock("../db/client", () => ({ prisma: mockPrisma, basePrisma }));

import { SupplierIntegrationService } from "../modules/supplier-integration/service";

describe("SupplierIntegrationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("enqueue", () => {
    it("snapshots the material's current price when enqueueing a proposal", async () => {
      mockPrisma.material.findFirst.mockResolvedValue({ id: "material-1", orgId: "org-1", unitCost: 150 });
      mockPrisma.supplier.findFirst.mockResolvedValue({ id: "supplier-1", orgId: "org-1" });
      mockPrisma.supplierPriceUpdate.create.mockResolvedValue({
        id: "queue-1",
        orgId: "org-1",
        supplierId: "supplier-1",
        materialId: "material-1",
        currentUnitCost: 150,
        proposedUnitCost: 165,
        status: "pending",
        source: "supplier-feed",
        requestedByJob: null,
        reviewedByUserId: null,
        reviewedAt: null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      });

      const result = await new SupplierIntegrationService().enqueue({
        orgId: "org-1",
        supplierId: "supplier-1",
        materialId: "material-1",
        proposedUnitCost: 165,
      });

      expect(mockPrisma.supplierPriceUpdate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ currentUnitCost: 150, proposedUnitCost: 165 }),
      });
      expect(result).toMatchObject({ status: "pending", currentUnitCost: 150, proposedUnitCost: 165 });
    });

    it("rejects a material that does not belong to the organization", async () => {
      mockPrisma.material.findFirst.mockResolvedValue(null);

      await expect(
        new SupplierIntegrationService().enqueue({
          orgId: "org-1",
          supplierId: "supplier-1",
          materialId: "material-other-org",
          proposedUnitCost: 165,
        })
      ).rejects.toThrow("not found");
    });
  });

  describe("approve", () => {
    it("applies the proposed price, writes a price audit, and marks the queue row approved", async () => {
      transaction.supplierPriceUpdate.findFirst.mockResolvedValue({
        id: "queue-1",
        orgId: "org-1",
        materialId: "material-1",
        proposedUnitCost: 165,
        status: "pending",
        source: "supplier-feed",
      });
      transaction.material.findFirst.mockResolvedValue({
        id: "material-1",
        orgId: "org-1",
        name: "Ready Mix Concrete",
        unitCost: 150,
      });
      transaction.supplierPriceUpdate.update.mockResolvedValue({
        id: "queue-1",
        orgId: "org-1",
        supplierId: "supplier-1",
        materialId: "material-1",
        currentUnitCost: 150,
        proposedUnitCost: 165,
        status: "approved",
        source: "supplier-feed",
        requestedByJob: null,
        reviewedByUserId: "admin-1",
        reviewedAt: new Date("2026-01-02T00:00:00.000Z"),
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      });

      const result = await new SupplierIntegrationService().approve("queue-1", "org-1", {
        userId: "admin-1",
        orgId: "org-1",
        role: "admin",
      });

      expect(transaction.material.update).toHaveBeenCalledWith({
        where: { id: "material-1" },
        data: expect.objectContaining({ unitCost: 165 }),
      });
      expect(transaction.materialPriceAudit.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          orgId: "org-1",
          materialId: "material-1",
          oldUnitCost: 150,
          newUnitCost: 165,
          source: "supplier-feed",
          actorUserId: "admin-1",
          actorRole: "admin",
        }),
      });
      expect(transaction.supplierPriceUpdate.update).toHaveBeenCalledWith({
        where: { id: "queue-1" },
        data: expect.objectContaining({ status: "approved", reviewedByUserId: "admin-1" }),
      });
      expect(result.status).toBe("approved");
    });

    it("rejects approving a queue row that is no longer pending", async () => {
      transaction.supplierPriceUpdate.findFirst.mockResolvedValue({ id: "queue-1", orgId: "org-1", status: "rejected" });

      await expect(
        new SupplierIntegrationService().approve("queue-1", "org-1", { userId: "admin-1", orgId: "org-1", role: "admin" })
      ).rejects.toThrow("already rejected");
      expect(transaction.material.update).not.toHaveBeenCalled();
    });
  });

  describe("reject", () => {
    it("marks a pending queue row rejected without touching the material", async () => {
      transaction.supplierPriceUpdate.findFirst.mockResolvedValue({ id: "queue-1", orgId: "org-1", status: "pending" });
      transaction.supplierPriceUpdate.update.mockResolvedValue({
        id: "queue-1",
        orgId: "org-1",
        supplierId: "supplier-1",
        materialId: "material-1",
        currentUnitCost: 150,
        proposedUnitCost: 165,
        status: "rejected",
        source: "supplier-feed",
        requestedByJob: null,
        reviewedByUserId: "admin-1",
        reviewedAt: new Date("2026-01-02T00:00:00.000Z"),
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      });

      const result = await new SupplierIntegrationService().reject("queue-1", "org-1", {
        userId: "admin-1",
        orgId: "org-1",
        role: "admin",
      });

      expect(transaction.material.update).not.toHaveBeenCalled();
      expect(result.status).toBe("rejected");
    });
  });

  describe("syncFromFeed", () => {
    it("enqueues only materials whose quoted price differs and that aren't already pending", async () => {
      const fetchFeed = jest.fn().mockResolvedValue([
        { materialId: "material-changed", proposedUnitCost: 200 },
        { materialId: "material-unchanged", proposedUnitCost: 150 },
        { materialId: "material-already-pending", proposedUnitCost: 99 },
      ]);

      mockPrisma.material.findFirst.mockImplementation(({ where }: { where: { id: string } }) => {
        if (where.id === "material-changed") return Promise.resolve({ id: "material-changed", orgId: "org-1", unitCost: 150 });
        if (where.id === "material-unchanged") return Promise.resolve({ id: "material-unchanged", orgId: "org-1", unitCost: 150 });
        if (where.id === "material-already-pending") return Promise.resolve({ id: "material-already-pending", orgId: "org-1", unitCost: 50 });
        return Promise.resolve(null);
      });
      mockPrisma.supplierPriceUpdate.findFirst.mockImplementation(({ where }: { where: { materialId: string } }) =>
        Promise.resolve(where.materialId === "material-already-pending" ? { id: "existing-pending" } : null)
      );
      mockPrisma.supplier.findFirst.mockResolvedValue({ id: "supplier-1", orgId: "org-1" });
      mockPrisma.supplierPriceUpdate.create.mockResolvedValue({
        id: "queue-new",
        orgId: "org-1",
        supplierId: "supplier-1",
        materialId: "material-changed",
        currentUnitCost: 150,
        proposedUnitCost: 200,
        status: "pending",
        source: "supplier-feed",
        requestedByJob: null,
        reviewedByUserId: null,
        reviewedAt: null,
        createdAt: new Date(),
      });

      const result = await new SupplierIntegrationService(fetchFeed).syncFromFeed({
        orgId: "org-1",
        supplierId: "supplier-1",
      });

      expect(result).toEqual({ proposed: 1, skipped: 2 });
      expect(mockPrisma.supplierPriceUpdate.create).toHaveBeenCalledTimes(1);
    });
  });
});
