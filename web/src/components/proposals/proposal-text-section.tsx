"use client";

import { InfoPanel } from "@/components/shared/info-panel";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface ProposalTextSectionProps {
  name: string;
  label: string;
  defaultValue: string;
  readOnly?: boolean;
  rows?: number;
  helpText?: string;
  emptyText?: string;
}

/**
 * Shared implementation behind ProposalScopeEditor / ProposalAssumptionsEditor /
 * ProposalExclusionsEditor. Same field renders as an editable Textarea in a
 * form, or as read-only client-facing copy on the preview page.
 */
export function ProposalTextSection({
  name,
  label,
  defaultValue,
  readOnly = false,
  rows = 8,
  helpText,
  emptyText = "Not provided yet.",
}: ProposalTextSectionProps) {
  if (readOnly) {
    return (
      <InfoPanel title={label}>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{defaultValue || emptyText}</p>
      </InfoPanel>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
      <Textarea id={name} name={name} rows={rows} defaultValue={defaultValue} />
    </div>
  );
}
