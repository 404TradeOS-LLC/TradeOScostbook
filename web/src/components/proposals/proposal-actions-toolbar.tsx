import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Proposal } from "@/lib/api";

interface ProposalActionsToolbarProps {
  projectId: string;
  proposal: Proposal;
  /** "review" hides the preview link when already on the preview page. */
  variant?: "review" | "preview";
  className?: string;
}

export function ProposalActionsToolbar({ projectId, proposal, variant = "review", className }: ProposalActionsToolbarProps) {
  const pdfUrl = `/api/documents/proposals/${proposal.id}/pdf`;

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)} role="toolbar" aria-label="Proposal document actions">
      {variant === "review" && (
        <Link href={`/projects/${projectId}/proposals/${proposal.id}/preview`} className={buttonVariants()}>
          Preview PDF
        </Link>
      )}
      <a href={pdfUrl} target="_blank" rel="noreferrer" className={buttonVariants({ variant: variant === "preview" ? "default" : "outline" })}>
        {variant === "preview" ? "Open in new tab" : "Download PDF"}
      </a>
      {variant === "preview" && (
        <Link href={`/projects/${projectId}/proposals/${proposal.id}`} className={buttonVariants({ variant: "outline" })}>
          Back to review
        </Link>
      )}
    </div>
  );
}
