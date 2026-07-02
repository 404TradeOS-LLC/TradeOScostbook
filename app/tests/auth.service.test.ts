process.env.AUTH_JWT_SECRET = "test-secret";

const mockTransactionClient = {
  $queryRaw: jest.fn(),
  appUser: {
    findUnique: jest.fn(),
  },
  organizationMembership: {
    findFirst: jest.fn(),
  },
  organization: {
    findUnique: jest.fn(),
  },
};

const mockBasePrisma = {
  $transaction: jest.fn((callback: (tx: typeof mockTransactionClient) => unknown) => callback(mockTransactionClient)),
};

const mockProvision = jest.fn();

jest.mock("../db/client", () => ({ basePrisma: mockBasePrisma }));
jest.mock("../modules/organization-provisioning/service", () => ({
  OrganizationProvisioningService: jest.fn().mockImplementation(() => ({ provision: mockProvision })),
}));

import { hashPassword } from "../backend/auth/password";
import { AuthService } from "../modules/auth/service";

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBasePrisma.$transaction.mockImplementation((callback: (tx: typeof mockTransactionClient) => unknown) =>
      callback(mockTransactionClient)
    );
  });

  it("signs up a new organization and returns a usable session", async () => {
    mockProvision.mockResolvedValue({
      organization: { id: "org-1", name: "Acme Co", regionCode: null },
      owner: { userId: "user-1", membershipId: "membership-1", authSubject: "local:abc", email: "owner@example.com", role: "owner", status: "active" },
    });

    const service = new AuthService();
    const result = await service.signup({
      organizationName: "Acme Co",
      email: "Owner@Example.com",
      password: "super-secret-1",
      fullName: "Owner Person",
    });

    expect(result.organization).toEqual({ id: "org-1", name: "Acme Co" });
    expect(result.role).toBe("owner");
    expect(typeof result.token).toBe("string");
    expect(result.token.split(".")).toHaveLength(3);

    const provisionCall = mockProvision.mock.calls[0][0];
    expect(provisionCall.owner.email).toBe("Owner@Example.com");
    expect(typeof provisionCall.owner.passwordHash).toBe("string");
    expect(provisionCall.owner.passwordHash).not.toBe("super-secret-1");
  });

  it("logs in a user with the correct password and an active membership", async () => {
    const passwordHash = await hashPassword("correct-password");
    mockTransactionClient.appUser.findUnique.mockResolvedValue({
      id: "user-1",
      authSubject: "local:abc",
      email: "owner@example.com",
      fullName: "Owner Person",
      isActive: true,
      passwordHash,
    });
    mockTransactionClient.organizationMembership.findFirst.mockResolvedValue({ orgId: "org-1", role: "owner" });
    mockTransactionClient.organization.findUnique.mockResolvedValue({ id: "org-1", name: "Acme Co" });

    const service = new AuthService();
    const result = await service.login({ email: "owner@example.com", password: "correct-password" });

    expect(result.user.email).toBe("owner@example.com");
    expect(result.organization).toEqual({ id: "org-1", name: "Acme Co" });
    expect(result.role).toBe("owner");
  });

  it("rejects login with an incorrect password", async () => {
    const passwordHash = await hashPassword("correct-password");
    mockTransactionClient.appUser.findUnique.mockResolvedValue({
      id: "user-1",
      authSubject: "local:abc",
      email: "owner@example.com",
      fullName: null,
      isActive: true,
      passwordHash,
    });

    const service = new AuthService();
    await expect(service.login({ email: "owner@example.com", password: "wrong-password" })).rejects.toThrow("Invalid email or password");
  });

  it("rejects login for an unknown email without revealing that distinction", async () => {
    mockTransactionClient.appUser.findUnique.mockResolvedValue(null);

    const service = new AuthService();
    await expect(service.login({ email: "nobody@example.com", password: "anything" })).rejects.toThrow("Invalid email or password");
  });

  it("rejects login when the user has no active organization membership", async () => {
    const passwordHash = await hashPassword("correct-password");
    mockTransactionClient.appUser.findUnique.mockResolvedValue({
      id: "user-1",
      authSubject: "local:abc",
      email: "owner@example.com",
      fullName: null,
      isActive: true,
      passwordHash,
    });
    mockTransactionClient.organizationMembership.findFirst.mockResolvedValue(null);

    const service = new AuthService();
    await expect(service.login({ email: "owner@example.com", password: "correct-password" })).rejects.toThrow("Invalid email or password");
  });
});
