// ─── src/app/dashboard/finance/invoices/pending/page.tsx ──────────────────────
"use client";
import { useQuery } from "@tanstack/react-query";
import { getPendingInvoices } from "@/utils/api";
import PageHeader from "@/app/component/dashboard/page-header";
import DynamicTable from "@/app/component/dashboard/dynamic-table";
import { Clock } from "lucide-react";

export default function PendingInvoicesPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["invoices-pending"],
    queryFn: () => getPendingInvoices().then((r) => r.data),
  });

  return (
    <>
      <PageHeader title="Pending Invoices" subtitle="All invoices awaiting payment" titleIcon={<Clock size={24} />} totalCount={data?.count ?? 0} />
      <DynamicTable
        data={data?.data || []}
        isLoading={isLoading}
        isError={isError}
        columns={[
          { key: "user", label: "Student", render: (inv) => <div><p className="font-medium text-gray-800">{inv.user?.name || "—"}</p><p className="text-xs text-gray-400">{inv.user?.email}</p></div> },
          { key: "totalAmount", label: "Total", render: (inv) => <span>Rs {(inv.totalAmount || 0).toLocaleString()}</span> },
          { key: "paidAmount", label: "Paid", render: (inv) => <span className="text-green-600">Rs {(inv.paidAmount || 0).toLocaleString()}</span> },
          { key: "remainingAmount", label: "Remaining", render: (inv) => <span className="text-rose-500 font-bold">Rs {(inv.remainingAmount || 0).toLocaleString()}</span> },
          { key: "status", label: "Status", render: (inv) => <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">{inv.status}</span> },
          { key: "dueDate", label: "Due Date", render: (inv) => <span className="text-gray-500 text-sm">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</span> },
        ]}
        actions={[]}
      />
    </>
  );
}