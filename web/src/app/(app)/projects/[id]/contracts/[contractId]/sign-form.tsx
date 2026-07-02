"use client";

import { useActionState } from "react";
import { signContractAction } from "@/app/actions/contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignContractForm({ contractId, projectId }: { contractId: string; projectId: string }) {
  const [state, formAction, isPending] = useActionState(signContractAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="contractId" value={contractId} />
      <input type="hidden" name="projectId" value={projectId} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="signerName">Signer name</Label>
        <Input id="signerName" name="signerName" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="signerEmail">Signer email</Label>
        <Input id="signerEmail" name="signerEmail" type="email" />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Signing…" : "Sign contract"}
      </Button>
    </form>
  );
}
