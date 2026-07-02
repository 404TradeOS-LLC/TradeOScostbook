import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Proposal } from "@/lib/api";
import { PROPOSAL_STATUS_LABEL } from "./proposal-format";

const STATUS_STYLES: Record<Proposal["status"], string> = {
  draft: "border-slate-200 bg-slate-100 text-slate-700",
  sent: "border-blue-200 bg-blue-50 text-blue-900",
  viewed: "border-orange-200 bg-orange-50 text-orange-700",
  accepted: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

const STATUS_STYLES_INVERTED: Record<Proposal["status"], string> = {
  draft: "border-white/20 bg-white/10 text-white",
  sent: "border-orange-400/40 bg-orange-500/20 text-orange-100",
  viewed: "border-orange-400/40 bg-orange-500/20 text-orange-100",
  accepted: "border-emerald-400/40 bg-emerald-500/20 text-emerald-100",
  rejected: "border-rose-400/40 bg-rose-500/20 text-rose-100",
};

interface ProposalStatusBadgeProps {
  status: Proposal["status"];
  /** Use on dark/navy backgrounds, e.g. inside ProposalHeader. */
  inverted?: boolean;
  className?: string;
}

export function ProposalStatusBadge({ status, inverted = false, className }: ProposalStatusBadgeProps) {
  const styles = inverted ? STATUS_STYLES_INVERTED : STATUS_STYLES;

  return (
    <Badge
      variant="outline"
      aria-label={`Proposal status: ${PROPOSAL_STATUS_LABEL[status]}`}
      className={cn("font-medium", styles[status], className)}
    >
      {PROPOSAL_STATUS_LABEL[status]}
    </Badge>
  );
}
