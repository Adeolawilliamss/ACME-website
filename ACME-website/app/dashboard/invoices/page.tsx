import dynamic from "next/dynamic";
import { Suspense } from "react";
import { InvoicesTableSkeleton } from "@/app/ui/skeletons";

const InvoicesPage = dynamic(() => import("./invoicesPage"));

export default function Page() {
  return (
    <Suspense fallback={<InvoicesTableSkeleton />}>
      <InvoicesPage />
    </Suspense>
  );
}
