import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { ProposalPaymentScheduleEntry } from "@/lib/api";

interface PaymentScheduleCardProps {
  schedule: ProposalPaymentScheduleEntry[];
}

export function PaymentScheduleCard({ schedule }: PaymentScheduleCardProps) {
  const totalPercent = schedule.reduce((sum, entry) => sum + (Number(entry.amountPercent) || 0), 0);
  const isBalanced = schedule.length > 0 && Math.abs(totalPercent - 100) < 0.01;

  return (
    <Card className="border-border/70">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-blue-950" aria-hidden="true" />
          <CardTitle>Payment schedule</CardTitle>
        </div>
        {schedule.length > 0 && (
          <Badge
            variant="outline"
            className={cn(
              "font-medium",
              isBalanced ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-orange-200 bg-orange-50 text-orange-700"
            )}
          >
            Total: {totalPercent}%
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {schedule.length === 0 ? (
          <EmptyState title="No payment schedule saved." description="Add milestone payments before sending the proposal." />
        ) : (
          <ol className="space-y-3 text-sm">
            {schedule.map((entry, index) => (
              <li key={`${entry.label}-${index}`} className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-950 text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <div>
                    <div className="font-medium text-foreground">{entry.label || `Payment ${index + 1}`}</div>
                    {entry.notes && <div className="text-muted-foreground">{entry.notes}</div>}
                  </div>
                  <span className="font-semibold text-orange-600">{entry.amountPercent ?? 0}%</span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
