"use client";

import { useEffect, useState } from "react";
import Pagination from "@/app/ui/invoices/pagination";
import Search from "@/app/ui/invoices/search";
import Table from "@/app/ui/invoices/table";
import { CreateInvoice } from "@/app/ui/invoices/buttons";
import { lusitana } from "@/app/ui/fonts";
import { InvoicesTableSkeleton } from "@/app/ui/skeletons";
import { useSearchParams } from "next/navigation";
import axiosInstance from "@/app/lib/axios";

export default function InvoicesPage() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("query") || "";
  const page = Number(searchParams.get("page")) || 1;
  const [totalPages, setTotalPages] = useState<number>(1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPages = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `/invoices/pages?query=${urlQuery}`
        );
        setTotalPages(res.data.totalPages);
      } catch (err) {
        console.error("Failed to fetch total pages:", err);
      }
      setLoading(false);
    };

    fetchPages();
  }, [urlQuery]);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} dark:text-white text-2xl`}>
          Invoices
        </h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search
          query={query}
          setQuery={setQuery}
          placeholder="Search invoices..."
        />
        <CreateInvoice />
      </div>

      {loading ? (
        <InvoicesTableSkeleton />
      ) : (
        <Table query={query} currentPage={page} />
      )}

      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
