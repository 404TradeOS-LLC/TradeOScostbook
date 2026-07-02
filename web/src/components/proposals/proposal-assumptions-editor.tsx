import { ProposalTextSection } from "./proposal-text-section";

interface ProposalAssumptionsEditorProps {
  defaultValue: string | string[];
  readOnly?: boolean;
  name?: string;
  label?: string;
}

export function ProposalAssumptionsEditor({ defaultValue, readOnly, name = "assumptions", label = "Assumptions" }: ProposalAssumptionsEditorProps) {
  return (
    <ProposalTextSection
      name={name}
      label={label}
      defaultValue={defaultValue}
      readOnly={readOnly}
      rows={6}
      helpText={readOnly ? undefined : "What conditions is this price based on?"}
      emptyText="No assumptions recorded."
    />
  );
}
