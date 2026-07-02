import { Card, CardContent } from "@/components/ui/card";
import { ProjectQuickActions } from "@/components/projects/project-quick-actions";
import { ProjectMetricsCard } from "@/components/projects/project-metrics-card";
import { CustomerHeaderCard } from "@/components/projects/customer-header-card";
import { ProjectOverviewCard } from "@/components/projects/project-overview-card";
import { ProjectActivityFeed } from "@/components/projects/project-activity-feed";
import { ProjectNotesCard } from "@/components/projects/project-notes-card";
import { RecentDocumentsCard } from "@/components/projects/recent-documents-card";
import type { Customer, Project, SiteVisit, Proposal, Estimate, ProjectFile } from "@/lib/api";
import { ProjectPhotoGallery } from "@/components/projects/project-photo-gallery";

interface ProjectSidebarProps {
  project: Project;
  customer: Customer | null;
  siteVisits: SiteVisit[];
  proposals: Proposal[];
  estimates: Estimate[];
  projectFiles: ProjectFile[];
}

export function ProjectSidebar({ project, customer, siteVisits, proposals, estimates, projectFiles }: ProjectSidebarProps) {
  const latestVisit = siteVisits[0] ?? null;
  const latestProposal = proposals[0] ?? null;

  return (
    <div className="grid gap-6">
      <Card className="border-border/70">
        <CardContent className="pt-6">
          <ProjectQuickActions projectId={project.id} />
        </CardContent>
      </Card>
      <CustomerHeaderCard customer={customer} />
      <ProjectOverviewCard project={project} />
      <ProjectMetricsCard
        metrics={[
          { label: "Estimates", value: String(estimates.length) },
          { label: "Visits", value: String(siteVisits.length) },
          { label: "Proposals", value: String(proposals.length) },
        ]}
      />
      <ProjectActivityFeed
        items={[
          latestVisit ? { id: latestVisit.id, title: "Latest intake", description: latestVisit.notes ?? "Site visit saved." } : undefined,
          latestProposal ? { id: latestProposal.id, title: "Latest proposal", description: `${latestProposal.status} proposal updated.` } : undefined,
        ].filter(Boolean) as Array<{ id: string; title: string; description: string }>}
      />
      <ProjectNotesCard title="Project notes" notes={project.simpleScope} />
      <ProjectPhotoGallery projectFiles={projectFiles} />
      <RecentDocumentsCard
        documents={[
          ...proposals.map((proposal) => ({ id: proposal.id, href: `/projects/${project.id}/proposals/${proposal.id}`, label: proposal.estimateId ? "Estimate-backed proposal" : "Project draft proposal", status: proposal.status })),
          ...projectFiles.slice(0, 3).map((file) => ({ id: file.id, href: file.fileUrl, label: file.fileName })),
        ]}
      />
    </div>
  );
}
