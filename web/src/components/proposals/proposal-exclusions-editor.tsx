import { ProposalTextSection } from "./proposal-text-section";

interface ProposalExclusionsEditorProps {
  defaultValue: string;
  readOnly?: boolean;
  name?: string;
  label?: string;
}

export function ProposalExclusionsEditor({ defaultValue, readOnly, name = "exclusions", label = "Exclusions" }: ProposalExclusionsEditorProps) {
  return (
    <ProposalTextSection
      name={name}
      label={label}
      defaultValue={defaultValue}
      readOnly={readOnly}
      rows={6}
      helpText={readOnly ? undefined : "What is explicitly not covered by this price?"}
      emptyText="No exclusions recorded."
    />
  );
}
