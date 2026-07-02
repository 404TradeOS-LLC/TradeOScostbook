import { ProposalTextSection } from "./proposal-text-section";

interface ProposalScopeEditorProps {
  defaultValue: string;
  readOnly?: boolean;
  name?: string;
  label?: string;
}

export function ProposalScopeEditor({ defaultValue, readOnly, name = "scopeOfWork", label = "Scope of work" }: ProposalScopeEditorProps) {
  return (
    <ProposalTextSection
      name={name}
      label={label}
      defaultValue={defaultValue}
      readOnly={readOnly}
      rows={8}
      helpText={readOnly ? undefined : "Describe exactly what is included in this job."}
      emptyText="Scope of work has not been finalized yet."
    />
  );
}
