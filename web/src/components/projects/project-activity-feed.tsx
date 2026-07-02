import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

interface ProjectActivityFeedProps {
  items: Array<{ id: string; title: string; description: string }>;
}

export function ProjectActivityFeed({ items }: ProjectActivityFeedProps) {
  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <EmptyState title="No activity yet." description="Project activity will appear here as intake, proposals, and files are updated." />
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="text-sm font-medium text-foreground">{item.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

