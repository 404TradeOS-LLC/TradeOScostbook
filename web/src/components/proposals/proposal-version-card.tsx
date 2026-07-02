import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Proposal } from "@/lib/api";
import { ProposalStatusBadge } from "./proposal-status-badge";
import { formatProposalDate } from "./proposal-format";

interface ProposalVersionCardProps {
  projectId: string;
  proposals: Proposal[];
  currentProposalId: string;
}

export function ProposalVersionCard({ projectId, proposals, currentProposalId }: ProposalVersionCardProps) {
  const ordered = [...proposals].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle>Proposal versions</CardTitle>
      </CardHeader>
      <CardContent>
        {ordered.length <= 1 ? (
          <p className="text-sm text-muted-foreground">This is the only draft for this project so far.</p>
        ) : (
          <ol className="space-y-2">
            {ordered.map((version, index) => {
              const isCurrent = version.id === currentProposalId;
              return (
                <li key={version.id}>
                  <Link
                    href={`/projects/${projectId}/proposals/${version.id}`}
                    aria-current={isCurrent ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-lg border p-3 text-sm transition-colors",
                      isCurrent ? "border-blue-950 bg-blue-950/5" : "border-border/60 hover:bg-muted/40"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-medium text-foreground">Version {index + 1}</span>
                      {isCurrent && (
                        <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">
                          Viewing
                        </Badge>
                      )}
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{formatProposalDate(version.createdAt)}</span>
                      <ProposalStatusBadge status={version.status} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
