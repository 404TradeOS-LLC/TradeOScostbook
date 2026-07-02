import { prisma } from "../../db/client";
import { ApiError } from "../../backend/middleware/errorHandler";
import { renderContractPdf } from "./pdf";
import { ContractDTO, ContractDocument, CreateContractInput, SignContractInput } from "./types";

const DEFAULT_TERMS =
  "This contract incorporates the accepted proposal in full. Work will proceed as scoped, with any changes " +
  "documented and priced via a separate change order. Payment terms follow the invoicing schedule agreed upon acceptance.";

export class ContractsService {
  async create(input: CreateContractInput): Promise<ContractDTO> {
    const proposal = await prisma.proposal.findFirst({
      where: { id: input.proposalId, project: input.orgId ? { orgId: input.orgId } : undefined },
    });
    if (!proposal) throw new ApiError(404, `Proposal ${input.proposalId} not found`);
    if (proposal.status !== "accepted") throw new ApiError(409, `Proposal ${input.proposalId} must be accepted before a contract can be created`);

    const row = await prisma.contract.create({
      data: {
        projectId: proposal.projectId,
        proposalId: proposal.id,
        termsText: input.termsText ?? proposal.termsAndConditions ?? DEFAULT_TERMS,
      },
    });
    return toDTO(row);
  }

  async listByProject(projectId: string, orgId?: string): Promise<ContractDTO[]> {
    const rows = await prisma.contract.findMany({
      where: { projectId, project: orgId ? { orgId } : undefined },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toDTO);
  }

  async getById(id: string, orgId?: string): Promise<ContractDTO> {
    const row = await this.findOrThrow(id, orgId);
    return toDTO(row);
  }

  async sign(id: string, input: SignContractInput): Promise<ContractDTO> {
    const row = await this.findOrThrow(id, input.orgId);
    if (row.status !== "pending_signature") throw new ApiError(409, `Contract ${id} cannot be signed from status ${row.status}`);
    const updated = await prisma.contract.update({
      where: { id },
      data: {
        status: "signed",
        signerName: input.signerName,
        signerEmail: input.signerEmail,
        signatureDataUrl: input.signatureDataUrl,
        signatureIp: input.signatureIp,
        signedAt: new Date(),
      },
    });
    return toDTO(updated);
  }

  async void(id: string, orgId?: string): Promise<ContractDTO> {
    const row = await this.findOrThrow(id, orgId);
    if (row.status === "signed") throw new ApiError(409, `Contract ${id} has already been signed and cannot be voided`);
    const updated = await prisma.contract.update({ where: { id }, data: { status: "voided" } });
    return toDTO(updated);
  }

  async getPdf(id: string, orgId?: string): Promise<ContractDocument> {
    const row = await prisma.contract.findFirst({
      where: { id, project: orgId ? { orgId } : undefined },
      include: { project: { include: { customer: true } } },
    });
    if (!row) throw new ApiError(404, `Contract ${id} not found`);

    const buffer = await renderContractPdf(row, { companyName: "Your Company Name" });
    return {
      buffer,
      filename: `contract-${row.project.name.replace(/\s+/g, "-").toLowerCase()}.pdf`,
      contentType: "application/pdf",
    };
  }

  private async findOrThrow(id: string, orgId?: string) {
    const row = await prisma.contract.findFirst({ where: { id, project: orgId ? { orgId } : undefined } });
    if (!row) throw new ApiError(404, `Contract ${id} not found`);
    return row;
  }
}

function toDTO(row: {
  id: string;
  projectId: string;
  proposalId: string;
  status: string;
  termsText: string;
  signerName: string | null;
  signerEmail: string | null;
  signatureDataUrl: string | null;
  signatureIp: string | null;
  signedAt: Date | null;
  createdAt: Date;
}): ContractDTO {
  return {
    id: row.id,
    projectId: row.projectId,
    proposalId: row.proposalId,
    status: row.status,
    termsText: row.termsText,
    signerName: row.signerName,
    signerEmail: row.signerEmail,
    signatureDataUrl: row.signatureDataUrl,
    signatureIp: row.signatureIp,
    signedAt: row.signedAt,
    createdAt: row.createdAt,
  };
}
