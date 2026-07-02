"use client";

import { useActionState } from "react";
import { createContractAction } from "@/app/actions/contracts";
import { acceptProposalAction, rejectProposalAction, sendProposalAction } from "@/app/actions/proposals";
import { StatusBadge } from "@/components/shared/status-badge";
import { Timeline } from "@/components/shared/timeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Proposal } from "@/lib/api";

interface ProposalLifecyclePanelProps {
  projectId: string;
  proposal: Proposal;
}

export function ProposalLifecyclePanel({ projectId, proposal }: ProposalLifecyclePanelProps) {
  const [sendState, sendFormAction, sendPending] = useActionState(sendProposalAction, undefined);
  const [acceptState, acceptFormAction, acceptPending] = useActionState(acceptProposalAction, undefined);
  const [rejectState, rejectFormAction, rejectPending] = useActionState(rejectProposalAction, undefined);
  const [contractState, contractFormAction, contractPending] = useActionState(createContractAction, undefined);

  const isPending = sendPending || acceptPending || rejectPending || contractPending;

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle>Workflow actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Current stage</div>
              <p className="mt-1 text-sm text-muted-foreground">{getStatusDescription(proposal.status)}</p>
            </div>
            <StatusBadge status={proposal.status} />
          </div>
        </div>

        <Timeline
          items={[
            { label: "Draft created", value: formatDate(proposal.createdAt), active: true },
            { label: "Sent to customer", value: formatDate(proposal.sentAt), active: Boolean(proposal.sentAt) },
            { label: "Viewed by customer", value: formatDate(proposal.viewedAt), active: Boolean(proposal.viewedAt) },
            {
              label: proposal.status === "rejected" ? "Customer declined" : proposal.status === "accepted" ? "Customer accepted" : "Customer response",
              value: formatDate(proposal.respondedAt),
              active: Boolean(proposal.respondedAt),
            },
          ]}
        />

        {proposal.status === "draft" && (
          <form action={sendFormAction} className="space-y-3">
            <HiddenFields projectId={projectId} proposalId={proposal.id} />
            <Button type="submit" className="w-full" disabled={isPending}>
              {sendPending ? "Sending…" : "Send to customer"}
            </Button>
            {sendState?.error && <p className="text-sm text-destructive">{sendState.error}</p>}
          </form>
        )}

        {(proposal.status === "sent" || proposal.status === "viewed") && (
          <div className="space-y-3">
            <form action={acceptFormAction} className="space-y-3">
              <HiddenFields projectId={projectId} proposalId={proposal.id} />
              <Button type="submit" className="w-full" disabled={isPending}>
                {acceptPending ? "Saving…" : "Mark accepted"}
              </Button>
              {acceptState?.error && <p className="text-sm text-destructive">{acceptState.error}</p>}
            </form>
            <form action={rejectFormAction} className="space-y-3">
              <HiddenFields projectId={projectId} proposalId={proposal.id} />
              <Button type="submit" variant="outline" className="w-full" disabled={isPending}>
                {rejectPending ? "Saving…" : "Mark rejected"}
              </Button>
              {rejectState?.error && <p className="text-sm text-destructive">{rejectState.error}</p>}
            </form>
          </div>
        )}

        {proposal.status === "accepted" && (
          <form action={contractFormAction} className="space-y-3">
            <HiddenFields projectId={projectId} proposalId={proposal.id} />
            <Button type="submit" className="w-full" disabled={isPending}>
              {contractPending ? "Creating…" : "Create contract"}
            </Button>
            <p className="text-sm text-muted-foreground">Carry the approved scope and terms directly into a signable contract.</p>
            {contractState?.error && <p className="text-sm text-destructive">{contractState.error}</p>}
          </form>
        )}

        {proposal.status === "rejected" && (
          <p className="text-sm text-muted-foreground">
            This proposal was marked as declined. Revise scope or pricing, then issue a fresh draft when you are ready to re-engage.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function HiddenFields({ projectId, proposalId }: { projectId: string; proposalId: string }) {
  return (
    <>
      <input type="hidden" name="proposalId" value={proposalId} />
      <input type="hidden" name="projectId" value={projectId} />
    </>
  );
}

function formatDate(value: string | null) {
  if (!value) return "Not yet";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function getStatusDescription(status: Proposal["status"]) {
  switch (status) {
    case "draft":
      return "Finish the customer-facing language and send the PDF when the scope, assumptions, and payment schedule are ready.";
    case "sent":
      return "The proposal has been issued. Update the record as soon as the customer responds.";
    case "viewed":
      return "The customer has reviewed the proposal. This is a good moment to follow up and close open questions.";
    case "accepted":
      return "The customer approved the proposal. Next, generate the contract so production handoff stays attached to the same project.";
    case "rejected":
      return "The current draft did not move forward. Use the project context to revise and resend a stronger version.";
    default:
      return "Review the current proposal state and keep the workflow moving.";
  }
}
