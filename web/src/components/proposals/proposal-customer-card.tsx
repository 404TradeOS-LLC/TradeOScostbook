import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Customer } from "@/lib/api";

interface ProposalCustomerCardProps {
  customer: Customer | null;
}

export function ProposalCustomerCard({ customer }: ProposalCustomerCardProps) {
  return (
    <Card className="border-border/70">
      <CardHeader className="flex flex-row items-center gap-2">
        <span className="size-2 rounded-full bg-orange-500" aria-hidden="true" />
        <CardTitle>Customer</CardTitle>
      </CardHeader>
      <CardContent>
        {!customer ? (
          <EmptyState title="No customer linked" description="Link a customer to this project so the proposal can carry their contact details." />
        ) : (
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Name</dt>
              <dd className="mt-1 font-medium text-foreground">{customer.name}</dd>
            </div>
            {customer.email && (
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</dt>
                <dd className="mt-1">
                  <a href={`mailto:${customer.email}`} className="text-foreground underline decoration-border underline-offset-2 hover:text-orange-600">
                    {customer.email}
                  </a>
                </dd>
              </div>
            )}
            {customer.phone && (
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Phone</dt>
                <dd className="mt-1">
                  <a href={`tel:${customer.phone}`} className="text-foreground underline decoration-border underline-offset-2 hover:text-orange-600">
                    {customer.phone}
                  </a>
                </dd>
              </div>
            )}
            {customer.address && (
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Address</dt>
                <dd className="mt-1">{customer.address}</dd>
              </div>
            )}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
