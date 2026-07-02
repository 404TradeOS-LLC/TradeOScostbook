import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timeline } from "@/components/shared/timeline";
import type { Project } from "@/lib/api";

interface ProjectStatusTimelineProps {
  project: Project;
  hasIntake: boolean;
  hasProposal: boolean;
}

export function ProjectStatusTimeline({ project, hasIntake, hasProposal }: ProjectStatusTimelineProps) {
  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle>Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <Timeline
          items={[
            { label: "Customer", value: project.customerId ? "Linked customer" : "Needs customer", active: Boolean(project.customerId) },
            { label: "Scope", value: project.simpleScope ? "Scope captured" : "Needs scope", active: Boolean(project.simpleScope) },
            { label: "Intake", value: hasIntake ? "Site visit saved" : "Capture intake", active: hasIntake },
            { label: "Proposal", value: hasProposal ? "Proposal draft exists" : "Generate proposal", active: hasProposal },
          ]}
        />
      </CardContent>
    </Card>
  );
}

