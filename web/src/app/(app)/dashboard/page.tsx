import Link from "next/link";
import { getSession } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {session?.email}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">Manage the people and companies you bid work for.</p>
            <Link href="/customers" className={buttonVariants({ variant: "outline" })}>
              View customers
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">Track jobs from lead through estimate to completion.</p>
            <Link href="/projects" className={buttonVariants({ variant: "outline" })}>
              View projects
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
