import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { basePrisma } from "../../db/client";
import { ApiError } from "../../backend/middleware/errorHandler";
import { signAuthToken } from "../../backend/auth/jwt";
import { hashPassword, verifyPassword } from "../../backend/auth/password";
import { OrganizationProvisioningService } from "../organization-provisioning/service";
import { AuthSessionResult, LoginInput, SignupInput, SupabaseBootstrapInput } from "./types";

// Generic message for every login failure path (unknown email, wrong
// password, inactive user, no active membership) so the endpoint can't be
// used to enumerate which emails are registered.
const INVALID_CREDENTIALS = "Invalid email or password";

export class AuthService {
  private readonly provisioning = new OrganizationProvisioningService();

  async signup(input: SignupInput): Promise<AuthSessionResult> {
    const secret = requireSecret();
    const passwordHash = await hashPassword(input.password);
    const authSubject = `local:${randomUUID()}`;

    const result = await this.provisioning.provision({
      organizationName: input.organizationName,
      regionCode: input.regionCode,
      owner: {
        authSubject,
        email: input.email,
        fullName: input.fullName,
        passwordHash,
      },
    });

    const token = signAuthToken(
      { sub: result.owner.authSubject, email: result.owner.email, orgId: result.organization.id, role: result.owner.role },
      secret
    );

    return {
      token,
      user: { id: result.owner.userId, email: result.owner.email, fullName: input.fullName ?? null },
      organization: { id: result.organization.id, name: result.organization.name },
      role: result.owner.role,
    };
  }

  async login(input: LoginInput): Promise<AuthSessionResult> {
    const secret = requireSecret();
    const normalizedEmail = input.email.toLowerCase();

    // No identity is known yet (no auth_subject, no org), so the lookups
    // below can't rely on the ordinary RLS policies (those are keyed off an
    // already-resolved session). This mirrors resolveAuthContext's bootstrap
    // pattern: a transaction-local flag temporarily widens visibility just
    // enough to find this one user and their own membership, scoped tighter
    // at each step as more of their identity becomes known.
    const result = await basePrisma.$transaction(async (transaction) => {
      await transaction.$queryRaw(Prisma.sql`select set_config('app.login_lookup', 'true', true)`);

      const user = await transaction.appUser.findUnique({ where: { email: normalizedEmail } });
      if (!user || !user.isActive || !user.passwordHash) throw new ApiError(401, INVALID_CREDENTIALS);

      const valid = await verifyPassword(input.password, user.passwordHash);
      if (!valid) throw new ApiError(401, INVALID_CREDENTIALS);

      await transaction.$queryRaw(Prisma.sql`select set_config('app.user_id', ${user.id}, true)`);

      const membership = await transaction.organizationMembership.findFirst({
        where: { userId: user.id, status: "active" },
        orderBy: { createdAt: "asc" },
      });
      if (!membership) throw new ApiError(401, INVALID_CREDENTIALS);

      await transaction.$queryRaw(Prisma.sql`select set_config('app.org_id', ${membership.orgId}, true)`);

      const organization = await transaction.organization.findUnique({ where: { id: membership.orgId } });
      if (!organization) throw new ApiError(401, INVALID_CREDENTIALS);

      return { user, membership, organization };
    });

    const token = signAuthToken(
      { sub: result.user.authSubject, email: result.user.email, orgId: result.membership.orgId, role: result.membership.role },
      secret
    );

    return {
      token,
      user: { id: result.user.id, email: result.user.email, fullName: result.user.fullName },
      organization: { id: result.organization.id, name: result.organization.name },
      role: result.membership.role,
    };
  }

  async bootstrapSupabaseIdentity(input: SupabaseBootstrapInput) {
    const normalizedEmail = input.email.toLowerCase();

    const existingUser = await basePrisma.appUser.findFirst({
      where: {
        OR: [{ authSubject: input.authSubject }, { email: normalizedEmail }],
      },
      include: {
        memberships: {
          where: { status: "active" },
          orderBy: { createdAt: "asc" },
          include: { organization: true },
        },
      },
    });

    if (existingUser) {
      const membership = existingUser.memberships[0];
      if (!membership) throw new ApiError(409, "User exists but has no active organization membership");
      return {
        user: { id: existingUser.id, email: existingUser.email, fullName: existingUser.fullName },
        organization: { id: membership.organization.id, name: membership.organization.name },
        role: membership.role,
      };
    }

    const provisioned = await this.provisioning.provision({
      organizationName: input.organizationName,
      regionCode: input.regionCode,
      owner: {
        authSubject: input.authSubject,
        email: normalizedEmail,
        fullName: input.fullName,
      },
    });

    return {
      user: {
        id: provisioned.owner.userId,
        email: provisioned.owner.email,
        fullName: input.fullName ?? null,
      },
      organization: {
        id: provisioned.organization.id,
        name: provisioned.organization.name,
      },
      role: provisioned.owner.role,
    };
  }
}

function requireSecret(): string {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) throw new ApiError(500, "AUTH_JWT_SECRET is not configured");
  return secret;
}
