interface SummaryMetricCardProps {
  label: string;
  value: string;
}

export function SummaryMetricCard({ label, value }: SummaryMetricCardProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

