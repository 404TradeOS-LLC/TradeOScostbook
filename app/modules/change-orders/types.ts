export interface CreateChangeOrderInput {
  orgId?: string;
  projectId: string;
  estimateId?: string;
  description: string;
}

export interface UpdateChangeOrderInput {
  orgId?: string;
  description?: string;
}

export interface AddChangeOrderLineItemInput {
  orgId?: string;
  changeOrderId: string;
  costItemId?: string;
  description?: string;
  quantity: number;
  unitCost?: number;
}

export interface ChangeOrderDTO {
  id: string;
  projectId: string;
  estimateId: string | null;
  coNumber: number;
  description: string;
  status: string;
  amount: number;
}

export interface ChangeOrderLineItemDTO {
  id: string;
  changeOrderId: string;
  costItemId: string | null;
  description: string;
  quantity: number;
  unitCost: number;
  lineCost: number;
  sortOrder: number;
}

