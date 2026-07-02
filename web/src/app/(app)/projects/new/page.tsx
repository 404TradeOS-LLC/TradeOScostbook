import { listCustomers } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { NewProjectForm } from "./form";

export default async function NewProjectPage() {
  const token = await getSessionToken();
  const customers = token ? await listCustomers(token) : [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New project</h1>
      <NewProjectForm customers={customers} />
    </div>
  );
}
