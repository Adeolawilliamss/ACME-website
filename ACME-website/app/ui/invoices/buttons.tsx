import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import axiosInstance from "@/app/lib/axios";

export function CreateInvoice() {
  return (
    <Link
      href="/dashboard/invoices/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Invoice</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateInvoice({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/invoices/edit?id=${id}`} // ← pass ID here
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteInvoice({ id }: { id: string }) {
  const deleteInvoiceWithId = async () => {
    if (!id) {
      console.error("🛑 DeleteInvoice called without an id!");
      return;
    }
    console.log("🗑  Deleting invoice with id:", id);
    try {
      await axiosInstance.delete(`/api/invoices/${id}`);
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete invoice:", error);
    }
  };
  return (
    <button
      type="button"
      onClick={deleteInvoiceWithId}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <span className="sr-only">Delete</span>
      <TrashIcon className="w-4" />
    </button>
  );
}
