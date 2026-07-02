import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatProposalCurrency } from "./proposal-format";

interface InvestmentSummaryCardProps {
  priceLow: number | null;
  priceHigh: number | null;
  finalPrice: number | null;
}

export function InvestmentSummaryCard({ priceLow, priceHigh, finalPrice }: InvestmentSummaryCardProps) {
  const hasRange = priceLow !== null || priceHigh !== null;

  return (
    <Card className="overflow-hidden border-border/70 py-0">
      <div className="h-1.5 w-full bg-orange-500" aria-hidden="true" />
      <CardHeader className="pt-4">
        <CardTitle>Investment summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pb-5">
        {finalPrice !== null ? (
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total investment</div>
            <div className="mt-1 text-3xl font-semibold text-blue-950">{formatProposalCurrency(finalPrice)}</div>
          </div>
        ) : hasRange ? (
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Estimated range</div>
            <div className="mt-1 text-2xl font-semibold text-blue-950">
              {formatProposalCurrency(priceLow)} &ndash; {formatProposalCurrency(priceHigh)}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Pricing has not been set for this proposal yet.</p>
        )}

        {finalPrice !== null && hasRange && (
          <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-4 text-sm">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Low</div>
              <div className="mt-1 font-medium">{formatProposalCurrency(priceLow)}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">High</div>
              <div className="mt-1 font-medium">{formatProposalCurrency(priceHigh)}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
