export interface GenerateProposalInput {
  estimateId: string;
  orgId?: string;
  companyName?: string;
  showLineItemDetail?: boolean;
  termsAndConditions?: string;
}

export interface ProposalDocument {
  buffer: Buffer;
  filename: string;
  contentType: string;
}
