"use client";

import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { lusitana } from "@/app/ui/fonts";
import axiosInstance from "@/app/lib/axios";

const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};

export default function CardWrapper() {
  const [data, setData] = useState({
    numberOfInvoices: 0,
    numberOfCustomers: 0,
    totalPaidInvoices: 0,
    totalPendingInvoices: 0,
  });

  useEffect(() => {
    async function fetchData() {
      const res = await axiosInstance.get(`/invoices/cards`);
      setData(res.data);
    }

    fetchData();
  }, []);

  return (
    <>
      <Card title="Collected" value={data.totalPaidInvoices} type="collected" />
      <Card title="Pending" value={data.totalPendingInvoices} type="pending" />
      <Card
        title="Total Invoices"
        value={data.numberOfInvoices}
        type="invoices"
      />
      <Card
        title="Total Customers"
        value={data.numberOfCustomers}
        type="customers"
      />
    </>
  );
}

type CardProps = {
  title: string;
  value: number | string;
  type: "invoices" | "customers" | "pending" | "collected";
};

export function Card({ title, value, type }: CardProps) {
  const Icon = iconMap[type];
  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon && <Icon className="h-5 w-5 text-gray-700" />}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className} truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}
