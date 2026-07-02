"use client";

import { InfoPanel } from "@/components/shared/info-panel";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface ProposalTextSectionProps {
  name: string;
  label: string;
  /**
   * Accepts either a single block of text (the legacy proposal-draft shape)
   * or a list of discrete items (IntakeProposalDraft.assumptions/exclusions
   * in the committed project-intake result shape, app/modules/project-intake/types.ts).
   */
  defaultValue: string | string[];
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
  const items = Array.isArray(defaultValue) ? defaultValue.filter(Boolean) : null;
  const textValue = Array.isArray(defaultValue) ? defaultValue.join("\n") : defaultValue;

  if (readOnly) {
    return (
      <InfoPanel title={label}>
        {items ? (
          items.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-foreground">
              {items.map((item, index) => (
                <li key={`${name}-${index}`}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-relaxed text-foreground">{emptyText}</p>
          )
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{textValue || emptyText}</p>
        )}
      </InfoPanel>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
      <Textarea id={name} name={name} rows={rows} defaultValue={textValue} />
    </div>
  );
}
