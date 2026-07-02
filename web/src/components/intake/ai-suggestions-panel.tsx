import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIAnswerCard } from "./ai-answer-card";

interface AISuggestionsPanelProps {
  title: string;
  items: string[];
  emptyTitle: string;
  emptyDescription: string;
}

export function AISuggestionsPanel({ title, items, emptyTitle, emptyDescription }: AISuggestionsPanelProps) {
  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          items.map((item) => <AIAnswerCard key={item} answer={item} />)
        )}
      </CardContent>
    </Card>
  );
}

