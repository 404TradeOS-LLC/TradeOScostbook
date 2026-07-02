import Link from "next/link";
import { ProposalHeader } from "@/components/proposals/proposal-header";
import { ProposalActionsToolbar } from "@/components/proposals/proposal-actions-toolbar";
import { ProposalCustomerCard } from "@/components/proposals/proposal-customer-card";
import { InvestmentSummaryCard } from "@/components/proposals/investment-summary-card";
import { ProposalTimelineCard } from "@/components/proposals/proposal-timeline-card";
import { PaymentScheduleCard } from "@/components/proposals/payment-schedule-card";
import { ProposalScopeEditor } from "@/components/proposals/proposal-scope-editor";
import { ProposalAssumptionsEditor } from "@/components/proposals/proposal-assumptions-editor";
import { ProposalExclusionsEditor } from "@/components/proposals/proposal-exclusions-editor";
import { ProposalAcceptanceCard } from "@/components/proposals/proposal-acceptance-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProject, getProposal, type ProposalPaymentScheduleEntry } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

export default async function ProposalPreviewPage({
  params,
}: {
  params: Promise<{ id: string; proposalId: string }>;
}) {
  const { id: projectId, proposalId } = await params;
  const token = await getSessionToken();
  const [project, proposal] = await Promise.all([getProject(token ?? "", projectId), getProposal(token ?? "", proposalId)]);
  const pdfUrl = `/api/documents/proposals/${proposal.id}/pdf`;
  const paymentSchedule = Array.isArray(proposal.paymentScheduleJson)
    ? (proposal.paymentScheduleJson as ProposalPaymentScheduleEntry[])
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href={`/projects/${projectId}/proposals/${proposalId}`} className="text-sm text-muted-foreground underline">
          ← Back to proposal review
        </Link>
        <ProposalActionsToolbar projectId={projectId} proposal={proposal} variant="preview" />
      </div>

      <ProposalHeader proposal={proposal} customerName={project.customer?.name} projectName={project.name} />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="flex flex-col gap-6">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>{proposal.estimateId ? "Estimate-backed PDF" : "Project draft PDF"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
                <iframe src={pdfUrl} title="Proposal PDF Preview" className="h-[70vh] w-full bg-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Proposal details</CardTitle>
              <CardDescription>Accessible text version of the PDF content above, for screen readers and quick reference.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <ProposalScopeEditor readOnly defaultValue={proposal.scopeOfWork ?? ""} />
              <div className="grid gap-5 md:grid-cols-2">
                <ProposalAssumptionsEditor readOnly defaultValue={proposal.assumptions ?? ""} />
                <ProposalExclusionsEditor readOnly defaultValue={proposal.exclusions ?? ""} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <InvestmentSummaryCard priceLow={proposal.priceLow} priceHigh={proposal.priceHigh} finalPrice={proposal.finalPrice} />
          <ProposalTimelineCard timeline={proposal.timeline} />
          <PaymentScheduleCard schedule={paymentSchedule} />
          <ProposalCustomerCard customer={project.customer} />
          <ProposalAcceptanceCard proposal={proposal} />
        </div>
      </div>
    </div>
  );
}
