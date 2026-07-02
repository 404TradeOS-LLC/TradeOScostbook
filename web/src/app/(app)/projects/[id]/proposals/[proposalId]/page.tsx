import Link from "next/link";
import { ProposalContextPanel } from "@/components/proposals/proposal-context-panel";
import { ProposalLifecyclePanel } from "@/components/proposals/proposal-lifecycle-panel";
import { ProposalReviewForm } from "@/components/proposals/proposal-review-form";
import { ProposalStatusBadge } from "@/components/proposals/proposal-status-badge";
import { ProposalActionsToolbar } from "@/components/proposals/proposal-actions-toolbar";
import { ProposalCustomerCard } from "@/components/proposals/proposal-customer-card";
import { ProposalProjectCard } from "@/components/proposals/proposal-project-card";
import { InvestmentSummaryCard } from "@/components/proposals/investment-summary-card";
import { ProposalTimelineCard } from "@/components/proposals/proposal-timeline-card";
import { PaymentScheduleCard } from "@/components/proposals/payment-schedule-card";
import { ProposalVersionCard } from "@/components/proposals/proposal-version-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProject, getProposal, type ProposalPaymentScheduleEntry } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string; proposalId: string }> }) {
  const { id: projectId, proposalId } = await params;
  const token = await getSessionToken();
  const [project, proposal] = await Promise.all([getProject(token ?? "", projectId), getProposal(token ?? "", proposalId)]);
  const paymentSchedule = Array.isArray(proposal.paymentScheduleJson) ? (proposal.paymentScheduleJson as ProposalPaymentScheduleEntry[]) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link href={`/projects/${projectId}`} className="text-sm text-muted-foreground underline">
            ← Back to project
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">Proposal Review</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Tighten the draft before it goes to the customer. This proposal should feel professional, but still clearly marked
            as a working draft until final pricing is locked.
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <ProposalStatusBadge status={proposal.status} />
          <ProposalActionsToolbar projectId={projectId} proposal={proposal} variant="review" />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Draft editor</CardTitle>
          </CardHeader>
          <CardContent>
            <ProposalReviewForm projectId={projectId} proposal={proposal} />
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <ProposalCustomerCard customer={project.customer} />
          <ProposalProjectCard project={project} />
          <InvestmentSummaryCard priceLow={proposal.priceLow} priceHigh={proposal.priceHigh} finalPrice={proposal.finalPrice} />
          <ProposalTimelineCard timeline={proposal.timeline} />

          <ProposalLifecyclePanel projectId={projectId} proposal={proposal} />

          <PaymentScheduleCard schedule={paymentSchedule} />

          <ProposalVersionCard projectId={projectId} proposals={project.proposals} currentProposalId={proposal.id} />

          <ProposalContextPanel latestVisit={project.siteVisits[0] ?? null} projectFiles={project.projectFiles} />
        </div>
      </div>
    </div>
  );
}
