import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Project } from "@/lib/api";

interface ProposalProjectCardProps {
  project: Project;
}

export function ProposalProjectCard({ project }: ProposalProjectCardProps) {
  return (
    <Card className="border-border/70">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-blue-950" aria-hidden="true" />
          <CardTitle>Project</CardTitle>
        </div>
        <StatusBadge status={project.status} />
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Name</dt>
            <dd className="mt-1 font-medium text-foreground">{project.name}</dd>
          </div>
          {project.jobType && (
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Job type</dt>
              <dd className="mt-1">{project.jobType}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Site address</dt>
            <dd className="mt-1">{project.siteAddress ?? "No address saved"}</dd>
          </div>
          {project.simpleScope && (
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Scope summary</dt>
              <dd className="mt-1 whitespace-pre-wrap text-muted-foreground">{project.simpleScope}</dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}
