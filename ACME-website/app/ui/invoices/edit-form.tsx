"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { InvoiceForm, CustomerField } from "@/app/lib/definitions";
import { Button } from "@/app/ui/button";
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

export default function EditInvoiceForm({
  invoice,
  customers,
}: {
  invoice: InvoiceForm;
  customers: CustomerField[];
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState(invoice.customer_id);
  const [amount, setAmount] = useState(invoice.amount);
  const [status, setStatus] = useState(invoice.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      console.log("Updating invoice:", invoice.id);
      await axios.patch(`http://localhost:5000/api/invoices/${invoice.id}`, {
        customerId,
        amount,
        status: status.charAt(0).toUpperCase() + status.slice(1),
      },{ withCredentials: true});
      router.push("/dashboard/invoices");
    } catch (err: any) {
      console.error(err.response?.data || err);
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-500">{error}</p>}

      {/* Customer */}
      <div>
        <label className="block text-sm font-medium">Customer</label>
        <div className="relative mt-1">
          <select
            defaultValue={invoice.customer_id}
            onChange={(e) => setCustomerId(e.target.value)}
            className="block w-full rounded-md border-gray-300 pl-10 py-2"
          >
            <option value="" disabled>
              Select a customer
            </option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <UserCircleIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium">Amount (USD)</label>
        <div className="relative mt-1">
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            className="block w-full rounded-md border-gray-300 pl-10 py-2"
          />
          <CurrencyDollarIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Status */}
      <fieldset>
        <legend className="block text-sm font-medium">Status</legend>
        <div className="mt-2 flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="pending"
              checked={status === "pending"}
              onChange={() => setStatus("pending")}
            />
            <span className="ml-1 flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-sm">
              Pending <ClockIcon className="h-4 w-4" />
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="paid"
              checked={status === "paid"}
              onChange={() => setStatus("paid")}
            />
            <span className="ml-1 flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-sm">
              Paid <CheckIcon className="h-4 w-4" />
            </span>
          </label>
        </div>
      </fieldset>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          onClick={() => router.push("/dashboard/invoices")}
          className="bg-red-500 px-4 py-2 rounded"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
