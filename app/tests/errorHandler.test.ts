import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { ApiError, errorHandler } from "../api/middleware/errorHandler";

function mockResponse() {
  const res = { status: jest.fn(), json: jest.fn() } as unknown as Response;
  (res.status as jest.Mock).mockReturnValue(res);
  return res;
}

function prismaError(code: string, meta?: Record<string, unknown>) {
  return new Prisma.PrismaClientKnownRequestError("Prisma error", { code, clientVersion: "5.22.0", meta });
}

describe("errorHandler", () => {
  it("maps ApiError to its own status code", () => {
    const res = mockResponse();
    errorHandler(new ApiError(403, "Admin access required"), {} as Request, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Admin access required" });
  });

  it("maps ZodError to 400 with issue details", () => {
    const res = mockResponse();
    const zodError = z.object({ name: z.string() }).safeParse({}).error as z.ZodError;
    errorHandler(zodError, {} as Request, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Validation failed", details: zodError.issues });
  });

  it("maps a unique constraint violation (P2002) to 409", () => {
    const res = mockResponse();
    errorHandler(prismaError("P2002", { target: ["org_id", "code"] }), {} as Request, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "A record with this value already exists",
      details: { target: ["org_id", "code"] },
    });
  });

  it("maps a foreign key constraint violation (P2003) to 409", () => {
    const res = mockResponse();
    errorHandler(prismaError("P2003", { field_name: "supplier_price_updates_supplier_id_fkey" }), {} as Request, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "This operation is blocked by a related record (foreign key constraint)",
      details: { field_name: "supplier_price_updates_supplier_id_fkey" },
    });
  });

  it("maps a record-not-found error (P2025) to 404", () => {
    const res = mockResponse();
    errorHandler(prismaError("P2025"), {} as Request, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Record not found" });
  });

  it("falls back to a generic 500 for unmapped Prisma error codes", () => {
    const res = mockResponse();
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    errorHandler(prismaError("P2034"), {} as Request, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    consoleSpy.mockRestore();
  });

  it("falls back to a generic 500 for unrecognized errors", () => {
    const res = mockResponse();
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    errorHandler(new Error("something unexpected"), {} as Request, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    consoleSpy.mockRestore();
  });
});
