"use client";

import { useEffect, useState } from "react";
import EditInvoiceForm from "@/app/ui/invoices/edit-form";
import { InvoiceForm, CustomerField } from "@/app/lib/definitions";
import axios from "axios";

interface Params {
  params: { id: string };
}

export default function EditPage({ params }: Params) {
  const { id } = params;

  const [invoice, setInvoice] = useState<InvoiceForm | null>(null);
  const [customers, setCustomers] = useState<CustomerField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1️⃣ Fetch the invoice
        const invRes = await axios.get(`http://localhost:5000/api/invoices/${id}`, {
          withCredentials: true,
        });
        setInvoice(invRes.data.data.invoice);

        // 2️⃣ Fetch & normalize customers
        const custRes = await axios.get("http://localhost:5000/api/customers", {
          withCredentials: true,
        });
        const raw: any[] = custRes.data.data.customers;
        const normalized = raw.map((c) => ({
          id: c._id.toString(),
          name: c.name,
          email: c.email,
          photo: c.photo,
        }));
        setCustomers(normalized);
      } catch (err) {
        console.error("Error fetching invoice or customers:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!invoice) {
    return <div className="text-center mt-10 text-red-500">Invoice not found.</div>;
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="mb-4 text-2xl font-semibold">Edit Invoice</h1>
      <EditInvoiceForm invoice={invoice} customers={customers} />
    </div>
  );
}
