'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import EditInvoiceForm from '@/app/ui/invoices/edit-form';
import { InvoiceForm, CustomerField } from '@/app/lib/definitions';
import axiosInstance from '@/app/lib/axios';

export default function EditInvoiceWrapper() {
  const search = useSearchParams();
  const id = search.get('id');

  const [invoice, setInvoice] = useState<InvoiceForm | null>(null);
  const [customers, setCustomers] = useState<CustomerField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      try {
        const [invRes, custRes] = await Promise.all([
          axiosInstance.get(`/invoices/${id}`),
          axiosInstance.get(`/customers`),
        ]);

        setInvoice(invRes.data.data.invoice);
        setCustomers(
          custRes.data.data.customers.map((c: any) => ({
            id: c._id.toString(),
            name: c.name,
            email: c.email,
            photo: c.photo,
            _id: c._id,
          }))
        );
      } catch (err) {
        console.error('Error fetching edit data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) return <div className="mt-10 text-center">Loading…</div>;
  if (!id || !invoice)
    return (
      <div className="mt-10 text-center text-red-500">Invoice not found.</div>
    );

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="mb-4 text-2xl font-semibold">Edit Invoice</h1>
      <EditInvoiceForm invoice={invoice} customers={customers} />
    </div>
  );
}
