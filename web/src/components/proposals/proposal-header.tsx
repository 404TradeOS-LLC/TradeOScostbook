import type { Proposal } from "@/lib/api";
import { ProposalStatusBadge } from "./proposal-status-badge";
import { formatProposalDay } from "./proposal-format";

interface ProposalHeaderProps {
  proposal: Proposal;
  customerName?: string | null;
  projectName?: string | null;
  className?: string;
}

export function ProposalHeader({ proposal, customerName, projectName, className }: ProposalHeaderProps) {
  const proposalNumber = proposal.id.slice(0, 8).toUpperCase();

  return (
    <header
      className={`overflow-hidden rounded-2xl border border-blue-950/60 bg-blue-950 text-white shadow-sm ${className ?? ""}`}
    >
      <div className="h-1.5 w-full bg-orange-500" aria-hidden="true" />
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.3em] text-orange-400 uppercase">Proposal</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {proposal.companyName || "Prepared for your project"}
          </h1>
          <dl className="grid gap-x-6 gap-y-1 text-sm text-blue-100 sm:grid-cols-2">
            {customerName && (
              <div className="flex gap-1.5">
                <dt className="text-blue-300">Prepared for:</dt>
                <dd>{customerName}</dd>
              </div>
            )}
            {projectName && (
              <div className="flex gap-1.5">
                <dt className="text-blue-300">Project:</dt>
                <dd>{projectName}</dd>
              </div>
            )}
            <div className="flex gap-1.5">
              <dt className="text-blue-300">Proposal #:</dt>
              <dd>{proposalNumber}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="text-blue-300">Date:</dt>
              <dd>{formatProposalDay(proposal.createdAt)}</dd>
            </div>
          </dl>
        </div>
        <div className="shrink-0">
          <ProposalStatusBadge status={proposal.status} inverted className="text-sm" />
        </div>
      </div>
    </header>
  );
}
