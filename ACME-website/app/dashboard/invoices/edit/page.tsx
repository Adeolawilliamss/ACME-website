// app/dashboard/invoices/edit/page.tsx
import { Suspense } from 'react';
import EditInvoiceWrapper from './editInvoiceWrapper';

export default function Page() {
  return (
    <Suspense fallback={<div className="mt-10 text-center">Loading...</div>}>
      <EditInvoiceWrapper />
    </Suspense>
  );
}
