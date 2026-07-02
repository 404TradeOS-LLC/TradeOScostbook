import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Proposal } from "@/lib/api";
import { formatProposalDate } from "./proposal-format";

interface ProposalAcceptanceCardProps {
  proposal: Proposal;
}

export function ProposalAcceptanceCard({ proposal }: ProposalAcceptanceCardProps) {
  const { status, respondedAt } = proposal;

  const tone =
    status === "accepted"
      ? "border-emerald-200 bg-emerald-50"
      : status === "rejected"
        ? "border-rose-200 bg-rose-50"
        : "border-border/70 bg-muted/20";

  return (
    <Card className={cn("border", tone)}>
      <CardHeader>
        <CardTitle>Client decision</CardTitle>
      </CardHeader>
      <CardContent>
        {status === "accepted" && (
          <div className="space-y-1">
            <p className="font-medium text-emerald-800">Accepted by the customer</p>
            <p className="text-sm text-emerald-700">{formatProposalDate(respondedAt)}</p>
          </div>
        )}
        {status === "rejected" && (
          <div className="space-y-1">
            <p className="font-medium text-rose-800">Declined by the customer</p>
            <p className="text-sm text-rose-700">{formatProposalDate(respondedAt)}</p>
          </div>
        )}
        {(status === "draft" || status === "sent" || status === "viewed") && (
          <p className="text-sm text-muted-foreground">
            {status === "draft"
              ? "This proposal has not been sent yet."
              : status === "sent"
                ? "Awaiting the customer's decision."
                : "The customer has viewed this proposal. Awaiting their decision."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
