"use client";

import { ArrowPathIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import Image from "next/image";
import { lusitana } from "@/app/ui/fonts";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/app/lib/axios";
import { AxiosError } from "axios";

interface Invoice {
  id: string;
  name: string;
  email: string;
  amount: string;
  image_url: string;
}

export default function LatestInvoices() {
  const [latestInvoices, setLatestInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLatestInvoices = async () => {
      try {
        const res = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/invoices/LatestInvoices`,
          { withCredentials: true }
        );
        setLatestInvoices(res.data.data);
      } catch (error) {
        const err = error as AxiosError;
        if (err.response && err.response.status === 401) {
          router.push("/login-required");
        }
        console.error("Failed to fetch customers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestInvoices();
  }, [router]);

  return (
    <div className="flex w-full flex-col md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl dark:text-white md:text-2xl`}>
        Latest Invoices
      </h2>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
        <div className="bg-white px-6">
          {loading ? (
            <p className="text-sm text-gray-500 py-4">Loading...</p>
          ) : latestInvoices.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No invoices found.</p>
          ) : (
            latestInvoices.map((invoice, i) => (
              <div
                key={invoice.id}
                className={clsx(
                  "flex flex-row items-center justify-between py-4",
                  {
                    "border-t": i !== 0,
                  }
                )}
              >
                <div className="flex items-center">
                  <Image
                    src={`http://localhost:5000/images/${invoice.image_url}`}
                    alt={`${invoice.name}'s profile picture`}
                    className="mr-4 rounded-full"
                    width={32}
                    height={32}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold md:text-base">
                      {invoice.name}
                    </p>
                    <p className="hidden text-sm text-gray-500 sm:block">
                      {invoice.email}
                    </p>
                  </div>
                </div>
                <p
                  className={`${lusitana.className} truncate text-sm font-medium md:text-base`}
                >
                  {invoice.amount}
                </p>
              </div>
            ))
          )}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <ArrowPathIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500">Updated just now</h3>
        </div>
      </div>
    </div>
  );
}
