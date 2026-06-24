export interface ProvisionOrganizationInput {
  organizationName: string;
  regionCode?: string;
  owner: {
    authSubject: string;
    email: string;
    fullName?: string;
  };
}

export interface ProvisionOrganizationResult {
  organization: {
    id: string;
    name: string;
    regionCode: string | null;
  };
  owner: {
    userId: string;
    membershipId: string;
    email: string;
    role: "owner";
    status: "active";
  };
}
