import type { AuthContext } from "../../backend/auth/context";
import { AdminDashboardService } from "../admin-dashboard/service";
import { Prisma } from "@prisma/client";
import { prisma } from "../../db/client";
import { ApiError } from "../../backend/middleware/errorHandler";
import { OrganizationSettingsDTO, OrganizationSettingsSnapshot, SettingsRoleProfileDTO, SettingsTeamMemberDTO, UpdateOrganizationSettingsInput } from "./types";

export class OrganizationSettingsService {
  private readonly adminDashboard = new AdminDashboardService();

  async getSettings(orgId: string, auth: AuthContext): Promise<OrganizationSettingsDTO> {
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        logoUrl: true,
      },
    });
    if (!organization) throw new ApiError(404, `Organization ${orgId} not found`);

    const row = await prisma.organizationSettings.findUnique({
      where: { orgId },
      select: { settingsJson: true, updatedAt: true },
    });

    const parsed: Partial<OrganizationSettingsSnapshot> = isSettingsSnapshot(row?.settingsJson) ? row.settingsJson : {};
    const canManageWorkspace = auth.role === "owner" || auth.role === "admin";
    const teamMembers = canManageWorkspace ? await this.getTeamMembers(orgId) : [];
    const roleProfiles = canManageWorkspace ? buildRoleProfiles(teamMembers) : [];

    return {
      orgId,
      updatedAt: row?.updatedAt ?? null,
      currentRole: auth.role,
      canManageWorkspace,
      teamMembers,
      roleProfiles,
      settings: {
        companyName: parsed?.companyName ?? organization.name,
        address: parsed?.address ?? organization.address ?? "",
        phone: parsed?.phone ?? organization.phone ?? "",
        logoUrl: parsed?.logoUrl ?? organization.logoUrl ?? "",
        ...parsed,
      },
    };
  }

  async updateSettings(orgId: string, input: UpdateOrganizationSettingsInput, auth: AuthContext): Promise<OrganizationSettingsDTO> {
    const organization = await prisma.organization.findUnique({ where: { id: orgId }, select: { id: true } });
    if (!organization) throw new ApiError(404, `Organization ${orgId} not found`);

    const settingsJson = input as unknown as Prisma.InputJsonValue;

    const row = await prisma.$transaction(async (transaction) => {
      await transaction.organization.update({
        where: { id: orgId },
        data: {
          name: input.companyName,
          phone: emptyToNull(input.phone),
          address: emptyToNull(input.address),
          logoUrl: emptyToNull(input.logoUrl),
          defaultLaborRate: toNullableDecimal(input.laborRate),
          defaultMarkupPercent: toNullableDecimal(input.markupPercent),
        },
      });

      return transaction.organizationSettings.upsert({
        where: { orgId },
        update: { settingsJson },
        create: { orgId, settingsJson },
        select: { updatedAt: true, settingsJson: true },
      });
    });

    const teamMembers = await this.getTeamMembers(orgId);

    return {
      orgId,
      updatedAt: row.updatedAt,
      currentRole: auth.role,
      canManageWorkspace: auth.role === "owner" || auth.role === "admin",
      teamMembers,
      roleProfiles: buildRoleProfiles(teamMembers),
      settings: isSettingsSnapshot(row.settingsJson) ? row.settingsJson : input,
    };
  }

  private async getTeamMembers(orgId: string): Promise<SettingsTeamMemberDTO[]> {
    const members = await this.adminDashboard.listOrganizationMembers(orgId);
    return members.map((member) => ({
      membershipId: member.membershipId,
      userId: member.userId,
      fullName: member.fullName,
      email: member.email,
      role: member.role,
      status: member.status,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    }));
  }
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function toNullableDecimal(value: string): Prisma.Decimal | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    throw new ApiError(400, `Expected a numeric value but received "${value}"`);
  }
  return new Prisma.Decimal(parsed);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSettingsSnapshot(value: unknown): value is Partial<OrganizationSettingsSnapshot> {
  return isRecord(value);
}

function buildRoleProfiles(teamMembers: SettingsTeamMemberDTO[]): SettingsRoleProfileDTO[] {
  const roleMeta: Record<string, Pick<SettingsRoleProfileDTO, "title" | "description" | "status">> = {
    owner: {
      title: "Owner",
      description: "Full workspace control including billing, AI controls, and membership administration.",
      status: "system",
    },
    admin: {
      title: "Admin",
      description: "Operations and team administration without ownership transfer rights.",
      status: "system",
    },
    estimator: {
      title: "Estimator",
      description: "Estimating, intake, proposal drafting, and pricing execution.",
      status: "system",
    },
    viewer: {
      title: "Viewer",
      description: "Read-only visibility for leadership, finance, or external stakeholders.",
      status: "system",
    },
  };

  return Object.entries(roleMeta).map(([role, meta]) => ({
    role,
    title: meta.title,
    description: meta.description,
    memberCount: teamMembers.filter((member) => member.role === role && member.status === "active").length,
    status: meta.status,
  }));
}
