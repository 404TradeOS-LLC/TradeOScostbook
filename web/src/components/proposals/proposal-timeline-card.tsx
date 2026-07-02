import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProposalTimelineCardProps {
  timeline: string | null;
}

export function ProposalTimelineCard({ timeline }: ProposalTimelineCardProps) {
  return (
    <Card className="border-border/70">
      <CardHeader className="flex flex-row items-center gap-2">
        <span className="size-2 rounded-full bg-orange-500" aria-hidden="true" />
        <CardTitle>Estimated timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {timeline ? (
          <p className="text-lg font-medium text-foreground">{timeline}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No timeline has been set for this proposal yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
