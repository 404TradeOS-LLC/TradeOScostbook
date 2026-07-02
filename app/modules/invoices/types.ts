export interface InvoiceLineItemInput {
  description: string;
  quantity: number;
  unitOfMeasure: string;
  unitCost: number;
}

export interface CreateInvoiceInput {
  orgId?: string;
  projectId: string;
  estimateId?: string;
  proposalId?: string;
  type?: "full" | "progress";
  percentComplete?: number;
  dueDate?: string;
  lineItems?: InvoiceLineItemInput[];
}

export interface InvoiceLineItemDTO {
  id: string;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  unitCost: number;
  lineCost: number;
  sortOrder: number;
}

export interface InvoiceDTO {
  id: string;
  projectId: string;
  estimateId: string | null;
  proposalId: string | null;
  invoiceNumber: number;
  type: string;
  status: string;
  percentComplete: number | null;
  amount: number;
  dueDate: Date | null;
  sentAt: Date | null;
  paidAt: Date | null;
  createdAt: Date;
}

export interface InvoiceDocument {
  buffer: Buffer;
  filename: string;
  contentType: string;
}
