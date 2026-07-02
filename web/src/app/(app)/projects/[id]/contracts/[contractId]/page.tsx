import Link from "next/link";
import { voidContractAction } from "@/app/actions/contracts";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getContract } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { SignContractForm } from "./sign-form";

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string; contractId: string }> }) {
  const { id: projectId, contractId } = await params;
  const token = await getSessionToken();
  const contract = await getContract(token ?? "", contractId);

  return (
    <div className="flex flex-col gap-6">
      <Link href={`/projects/${projectId}`} className="text-sm text-muted-foreground underline">
        ← Back to project
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Contract</h1>
        <StatusBadge status={contract.status} />
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap text-muted-foreground">{contract.termsText}</p>
        </CardContent>
      </Card>

      {contract.status === "signed" && (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Signature</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>Signed by {contract.signerName}</p>
            {contract.signedAt && <p className="text-muted-foreground">on {new Date(contract.signedAt).toLocaleDateString()}</p>}
          </CardContent>
        </Card>
      )}

      <Card className="max-w-md">
        <CardContent className="flex flex-col gap-4 pt-6">
          <a
            href={`/api/documents/contracts/${contract.id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            Download PDF
          </a>

          {contract.status === "pending_signature" && (
            <>
              <SignContractForm contractId={contract.id} projectId={projectId} />
              <form action={voidContractAction}>
                <input type="hidden" name="contractId" value={contract.id} />
                <input type="hidden" name="projectId" value={projectId} />
                <Button type="submit" variant="destructive">
                  Void contract
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
