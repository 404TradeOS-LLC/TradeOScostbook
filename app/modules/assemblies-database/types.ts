export interface CreateAssemblyInput {
  orgId?: string;
  code: string;
  name: string;
  unitOfMeasure: string;
  description?: string;
  isTemplate?: boolean;
}

export type UpdateAssemblyInput = Partial<CreateAssemblyInput> & { isActive?: boolean };

export interface AddAssemblyItemInput {
  assemblyId: string;
  orgId?: string;
  costItemId?: string;
  childAssemblyId?: string;
  quantityPerUnit: number;
  sortOrder?: number;
}

export interface AssemblyDTO {
  id: string;
  orgId: string | null;
  code: string;
  name: string;
  unitOfMeasure: string;
  description: string | null;
  isTemplate: boolean;
  isActive: boolean;
}

export interface AssemblyUnitCostResult {
  unitCost: number;
  componentCount: number;
}
