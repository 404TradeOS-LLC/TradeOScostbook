"use client";

import { useActionState } from "react";
import { createCustomerAction } from "@/app/actions/customers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewCustomerPage() {
  const [state, formAction, isPending] = useActionState(createCustomerAction, undefined);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New customer</h1>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Customer details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="billingAddress">Billing address</Label>
              <Input id="billingAddress" name="billingAddress" />
            </div>
            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Create customer"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
