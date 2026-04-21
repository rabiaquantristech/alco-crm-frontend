"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllInvoices, createInvoice, updateInvoice, markInvoicePaid } from "@/utils/api";
import PageHeader, { FilterField } from "@/app/component/dashboard/page-header";
import DynamicTable from "@/app/component/dashboard/dynamic-table";
import Modal from "@/app/component/ui/model/modal";
import Popup from "@/app/component/ui/popup/popup";
import { ModalField } from "@/types/ui";
import toast from "react-hot-toast";
import { FileText, CheckCircle, Pencil } from "lucide-react";

const statusColor = (status: string) => {
  const map: Record<string, string> = {
    PAID: "bg-green-100 text-green-700",
    PARTIAL: "bg-yellow-100 text-yellow-700",
    PENDING: "bg-sky-100 text-sky-700",
    OVERDUE: "bg-rose-100 text-rose-700",
    BLOCKED: "bg-gray-100 text-gray-600",
    EXTENDED: "bg-indigo-100 text-indigo-700",
    WARNING: "bg-orange-100 text-orange-700",
  };
  return map[status] || "bg-gray-100 text-gray-600";
};

const createFields: ModalField[] = [
  { name: "user", label: "User ID", type: "input", inputType: "text", placeholder: "MongoDB ObjectId" },
  { name: "enrollment", label: "Enrollment ID", type: "input", inputType: "text", placeholder: "MongoDB ObjectId" },
  { name: "totalAmount", label: "Total Amount (Rs)", type: "input", inputType: "number", placeholder: "50000" },
  { name: "dueDate", label: "Due Date", type: "input", inputType: "date" },
];

const editFields: ModalField[] = [
  { name: "dueDate", label: "Due Date", type: "input", inputType: "date" },
  {
    name: "status", label: "Status", type: "select",
    options: [
      { label: "Pending", value: "PENDING" },
      { label: "Partial", value: "PARTIAL" },
      { label: "Paid", value: "PAID" },
      { label: "Overdue", value: "OVERDUE" },
      { label: "Extended", value: "EXTENDED" },
      { label: "Blocked", value: "BLOCKED" },
    ],
  },
];

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: "", search: "", page: "1", limit: "10" });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [markPaidInvoice, setMarkPaidInvoice] = useState<any>(null);

  const filterFields: FilterField[] = [
    { type: "input", name: "search", placeholder: "Search user, email..." },
    {
      type: "select", name: "status",
      options: [
        { label: "Pending", value: "PENDING" },
        { label: "Partial", value: "PARTIAL" },
        { label: "Paid", value: "PAID" },
        { label: "Overdue", value: "OVERDUE" },
        { label: "Extended", value: "EXTENDED" },
        { label: "Blocked", value: "BLOCKED" },
      ],
    },
  ];

  const { data, isLoading, isError } = useQuery({
    queryKey: ["invoices", filters],
    queryFn: () => getAllInvoices({ ...filters, page: Number(filters.page), limit: Number(filters.limit) }).then((r) => r.data),
  });

  const { mutate: addInvoice, isPending: isAdding } = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => { toast.success("Invoice created! ✅"); setIsAddOpen(false); queryClient.invalidateQueries({ queryKey: ["invoices"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed!"),
  });

  const { mutate: editInvoice, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateInvoice(id, data),
    onSuccess: () => { toast.success("Invoice updated! ✅"); setEditingInvoice(null); queryClient.invalidateQueries({ queryKey: ["invoices"] }); },
    onError: () => toast.error("Failed to update!"),
  });

  const { mutate: markPaid, isPending: isMarkingPaid } = useMutation({
    mutationFn: (id: string) => markInvoicePaid(id),
    onSuccess: () => { toast.success("Invoice marked as paid! ✅"); setMarkPaidInvoice(null); queryClient.invalidateQueries({ queryKey: ["invoices"] }); },
    onError: () => toast.error("Failed!"),
  });

  return (
    <>
      <PageHeader
        title="Invoices"
        subtitle="Manage all invoices"
        titleIcon={<FileText size={24} />}
        totalCount={data?.meta?.total ?? 0}
        onAdd={() => setIsAddOpen(true)}
        filters={filters}
        setFilters={setFilters}
        filterFields={filterFields}
      />

      <DynamicTable
        data={data?.data || []}
        isLoading={isLoading}
        isError={isError}
        columns={[
          { key: "user", label: "Student", render: (inv) => <span className="font-medium text-gray-800">{inv.user?.name || inv.user || "—"}</span> },
          { key: "totalAmount", label: "Total", render: (inv) => <span>Rs {(inv.totalAmount || 0).toLocaleString()}</span> },
          { key: "paidAmount", label: "Paid", render: (inv) => <span className="text-green-600 font-medium">Rs {(inv.paidAmount || 0).toLocaleString()}</span> },
          { key: "remainingAmount", label: "Remaining", render: (inv) => <span className="text-rose-500 font-medium">Rs {(inv.remainingAmount || 0).toLocaleString()}</span> },
          {
            key: "status", label: "Status",
            render: (inv) => (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(inv.status)}`}>{inv.status}</span>
            ),
          },
          { key: "dueDate", label: "Due Date", render: (inv) => <span className="text-gray-500 text-sm">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</span> },
        ]}
        actions={[
          {
            icon: <Pencil size={14} />, label: "Edit",
            onClick: (inv) => setEditingInvoice(inv),
            className: "hover:bg-yellow-50 hover:text-yellow-600",
          },
          {
            icon: <CheckCircle size={14} />, label: "Mark Paid",
            onClick: (inv) => setMarkPaidInvoice(inv),
            className: "hover:bg-green-50 hover:text-green-600",
            hidden: (inv) => inv.status === "PAID",
          },
        ]}
      />

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create Invoice" fields={createFields} onSubmit={addInvoice} isLoading={isAdding} mode="add" />

      {/* Edit Modal */}
      {editingInvoice && (
        <Modal
          isOpen={!!editingInvoice}
          onClose={() => setEditingInvoice(null)}
          title="Edit Invoice"
          fields={editFields}
          initialValues={{ dueDate: editingInvoice.dueDate?.split("T")[0] || "", status: editingInvoice.status }}
          onSubmit={(data) => editInvoice({ id: editingInvoice._id, data })}
          isLoading={isUpdating}
          mode="edit"
        />
      )}

      {/* Mark Paid Popup */}
      {markPaidInvoice && (
        <Popup
          isOpen={!!markPaidInvoice}
          onClose={() => setMarkPaidInvoice(null)}
          onConfirm={() => markPaid(markPaidInvoice._id)}
          variant="info"
          title="Mark Invoice as Paid"
          description={<>Mark invoice of <span className="font-bold text-green-600">Rs {markPaidInvoice.totalAmount?.toLocaleString()}</span> as fully paid?</>}
          confirmText="Yes, Mark Paid"
          isLoading={isMarkingPaid}
          loadingText="Processing..."
        />
      )}
    </>
  );
}