/**
 * Construction Knowledge Engine — assembly record schema.
 *
 * This is a content-authoring schema, deliberately separate from the
 * runtime `Assembly` Prisma model (which only has id/orgId/code/name/
 * unitOfMeasure/description/isTemplate/isActive). See ./README.md for why.
 */

export type ConstructionPhase =
  | "pre-construction"
  | "site-prep"
  | "rough"
  | "finish"
  | "post-construction"
  | "maintenance"
  | "emergency-response";

/** A single required or optional input an estimator/AI intake flow must collect to size this assembly. */
export interface AssemblyInputField {
  /** Stable machine key, e.g. "dbhInches". */
  key: string;
  label: string;
  /** Unit the value is collected in, e.g. "in", "ft", "ea", "yes/no". */
  unit?: string;
  description: string;
}

export type PricingHookKind =
  | "costItem"
  | "material"
  | "laborRate"
  | "equipment"
  | "subcontractor"
  | "childAssembly";

/**
 * A placeholder pointer to a future priced-catalog record. Not a real
 * foreign key — `refSlug` is a human-readable handle a future sync step
 * uses to find-or-create the matching CostItem/Material/LaborRate/
 * Equipment/Assembly row in the org's priced catalog.
 */
export interface AssemblyPricingHook {
  kind: PricingHookKind;
  refSlug: string;
  description: string;
  estimatedUnitOfMeasure?: string;
}

export interface ProposalIntelligence {
  scopeOfWork: string[];
  assumptions: string[];
  exclusions: string[];
  warranty: string;
}

export interface KnowledgeAssembly {
  // Identity
  id: string;
  slug: string;
  version: number;
  trade: string;
  category: string;
  subcategory: string;
  name: string;
  unitOfMeasure: string;

  // Business
  description: string;
  customerDescription: string;
  contractorNotes: string;
  typicalUseCase: string;

  // Classification
  projectTypes: string[];
  constructionPhase: ConstructionPhase;
  csiDivision?: string;

  requiredInputs: AssemblyInputField[];
  optionalInputs: AssemblyInputField[];

  materialCategories: string[];
  laborCategories: string[];
  equipmentCategories: string[];

  safetyRequirements: string[];
  riskFactors: string[];
  permitAwareness: string[];
  inspectionAwareness: string[];
  codeConsiderations: string[];

  /** Other assembly slugs (within this trade or another) this one commonly depends on or pairs with. */
  dependencies: string[];
  wasteDisposal: string[];

  proposalIntelligence: ProposalIntelligence;

  productionNotes: string[];

  /** Placeholders only — see AssemblyPricingHook doc comment. */
  pricingHooks: AssemblyPricingHook[];

  aiNotes: string[];
}
