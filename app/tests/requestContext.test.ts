import { requireOrgAccess } from "../backend/requestContext";

describe("requestContext org guards", () => {
  it("rejects cross-organization member management", () => {
    const req = {
      auth: {
        userId: "user-1",
        orgId: "org-1",
        role: "owner",
      },
    };

    expect(() => requireOrgAccess(req as never, "org-2")).toThrow("Cross-organization access is not allowed");
  });

  it("allows access within the authenticated organization", () => {
    const req = {
      auth: {
        userId: "user-1",
        orgId: "org-1",
        role: "admin",
      },
    };

    expect(requireOrgAccess(req as never, "org-1")).toMatchObject({
      userId: "user-1",
      orgId: "org-1",
      role: "admin",
    });
  });
});
