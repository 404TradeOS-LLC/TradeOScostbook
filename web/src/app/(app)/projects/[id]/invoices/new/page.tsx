import { getProject } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { NewInvoiceForm } from "./form";

export default async function NewInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getSessionToken();
  const project = await getProject(token ?? "", id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New invoice</h1>
      <NewInvoiceForm projectId={id} estimates={project.estimates} />
    </div>
  );
}
