import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">TradeOS Cost Book</h1>
      <p className="max-w-md text-muted-foreground">
        Estimating, proposals, invoicing, and pricing for trade contractors.
      </p>
      <div className="flex gap-3">
        <Link href="/signup" className={buttonVariants({ variant: "default" })}>
          Get started
        </Link>
        <Link href="/login" className={buttonVariants({ variant: "outline" })}>
          Sign in
        </Link>
      </div>
    </div>
  );
}
