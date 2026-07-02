import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AIAnswerCardProps {
  answer: string;
  meta?: string | null;
  className?: string;
}

export function AIAnswerCard({ answer, meta, className }: AIAnswerCardProps) {
  return (
    <Card className={cn("border-border/70 bg-background/80", className)}>
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Suggested answer</div>
        <p className="mt-2 text-sm text-foreground">{answer}</p>
        {meta ? <p className="mt-3 text-xs text-muted-foreground">{meta}</p> : null}
      </CardContent>
    </Card>
  );
}

