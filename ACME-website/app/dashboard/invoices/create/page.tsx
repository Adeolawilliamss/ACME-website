"use client";
import { useEffect, useState } from "react";
import Form from "@/app/ui/invoices/create-form";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import axiosInstance from '@/app/lib/axios';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

type Customer = {
  id: string;
  name: string;
};

export default function Page() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/customers`, {
          withCredentials: true,
        });
        setCustomers(res.data.data.customers);
      } catch (error) {
        const err = error as AxiosError;
        if (err.response && err.response.status === 401) {
          router.push('/login-required');
        }
        console.error("Failed to fetch customers:", err);
      }
    };

    fetchCustomers();
  }, [router]);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Invoices", href: "/dashboard/invoices" },
          {
            label: "Create Invoice",
            href: "/dashboard/invoices/create",
            active: true,
          },
        ]}
      />
      <Form customers={customers} />
    </main>
  );
}
