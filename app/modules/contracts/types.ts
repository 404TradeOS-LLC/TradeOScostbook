export interface CreateContractInput {
  orgId?: string;
  proposalId: string;
  termsText?: string;
}

export interface SignContractInput {
  orgId?: string;
  signerName: string;
  signerEmail?: string;
  signatureDataUrl?: string;
  signatureIp?: string;
}

export interface ContractDTO {
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
}

export interface ContractDocument {
  buffer: Buffer;
  filename: string;
  contentType: string;
}
