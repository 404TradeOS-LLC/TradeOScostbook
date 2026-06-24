import { Prisma } from "@prisma/client";
import { getRequestDatabaseClient, runWithDatabaseSession } from "../db/requestSession";

describe("request database session", () => {
  it("sets transaction-local auth values and exposes the transaction client", async () => {
    const transaction = { $queryRaw: jest.fn().mockResolvedValue([]) };
    const client = {
      $transaction: jest.fn(async (callback: (tx: typeof transaction) => Promise<string>) => callback(transaction)),
    };

    const result = await runWithDatabaseSession(
      client as never,
      { userId: "user-1", orgId: "org-1", role: "admin" },
      async () => {
        expect(getRequestDatabaseClient()).toBe(transaction);
        return "complete";
      }
    );

    expect(result).toBe("complete");
    expect(transaction.$queryRaw).toHaveBeenCalledTimes(1);
    expect(transaction.$queryRaw.mock.calls[0][0]).toBeInstanceOf(Object);
    expect(transaction.$queryRaw.mock.calls[0][0]).toMatchObject({
      values: ["user-1", "org-1", "admin", "http"],
    } satisfies Partial<Prisma.Sql>);
    expect(getRequestDatabaseClient()).toBeUndefined();
  });

  it("uses a bounded default transaction timeout", async () => {
    const transaction = { $queryRaw: jest.fn().mockResolvedValue([]) };
    const client = {
      $transaction: jest.fn(async (callback: (tx: typeof transaction) => Promise<void>) => callback(transaction)),
    };

    await runWithDatabaseSession(
      client as never,
      { userId: "user-1", orgId: "org-1", role: "viewer" },
      async () => undefined
    );

    expect(client.$transaction).toHaveBeenCalledWith(expect.any(Function), { timeout: 60_000 });
  });
});
