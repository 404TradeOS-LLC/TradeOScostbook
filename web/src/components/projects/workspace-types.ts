import type { Customer, Estimate, Project, ProjectFile, Proposal, SiteVisit } from "@/lib/api";

export interface ProjectWorkspaceData {
  project: Project;
  customer: Customer | null;
  estimates: Estimate[];
  siteVisits: SiteVisit[];
  projectFiles: ProjectFile[];
  proposals: Proposal[];
}

