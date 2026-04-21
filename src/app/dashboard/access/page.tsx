"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllEnrollments, grantAccess } from "@/utils/api";
import PageHeader, { FilterField } from "@/app/component/dashboard/page-header";
import DynamicTable from "@/app/component/dashboard/dynamic-table";
import Modal from "@/app/component/ui/model/modal";
import { ModalField } from "@/types/ui";
import toast from "react-hot-toast";
import { ShieldCheck, KeyRound } from "lucide-react";

const accessColor = (status: string) => {
  const map: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    GRACE: "bg-yellow-100 text-yellow-700",
    EXTENDED: "bg-indigo-100 text-indigo-700",
    RESTRICTED: "bg-orange-100 text-orange-700",
    BLOCKED: "bg-rose-100 text-rose-700",
  };
  return map[status] || "bg-gray-100 text-gray-600";
};

const grantFields: ModalField[] = [
  { name: "days", label: "Days to Grant", type: "input", inputType: "number", placeholder: "30" },
];

export default function AccessControlPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: "", search: "", page: 1, limit: 10 });
  const [grantingAccess, setGrantingAccess] = useState<any>(null);

  const filterFields: FilterField[] = [
    { type: "input", name: "search", placeholder: "Search..." },
    {
      type: "select", name: "status",
      options: [
        { label: "Active", value: "active" },
        { label: "Suspended", value: "suspended" },
        { label: "Completed", value: "completed" },
      ],
    },
  ];

  const { data, isLoading, isError } = useQuery({
    queryKey: ["enrollments-access", filters],
    queryFn: () => getAllEnrollments(filters).then((r) => r.data),
  });

  const { mutate: grant, isPending: isGranting } = useMutation({
    mutationFn: (formData: any) => grantAccess({ enrollmentId: grantingAccess._id, days: Number(formData.days) }),
    onSuccess: () => {
      toast.success("Access granted! ✅");
      setGrantingAccess(null);
      queryClient.invalidateQueries({ queryKey: ["enrollments-access"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed!"),
  });

  return (
    <>
      <PageHeader
        title="Access Control"
        subtitle="Grant or manage student access"
        titleIcon={<ShieldCheck size={24} />}
        totalCount={data?.meta?.total ?? 0}
        filters={{ ...filters, page: String(filters.page), limit: String(filters.limit) }}
        setFilters={setFilters}
        filterFields={filterFields}
      />

      <DynamicTable
        data={data?.data || []}
        isLoading={isLoading}
        isError={isError}
        columns={[
          {
            key: "user", label: "Student",
            render: (e) => (
              <div>
                <p className="font-medium text-gray-800">{e.user?.name || "—"}</p>
                <p className="text-xs text-gray-400">{e.user?.email}</p>
              </div>
            ),
          },
          { key: "program", label: "Program", render: (e) => <span>{e.program?.name || "—"}</span> },
          {
            key: "accessStatus", label: "Access Status",
            render: (e) => (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${accessColor(e.accessStatus)}`}>
                {e.accessStatus || "—"}
              </span>
            ),
          },
          {
            key: "accessOverride", label: "Override Active",
            render: (e) => {
              if (!e.accessOverride?.endDate) return <span className="text-gray-400 text-sm">None</span>;
              const isActive = new Date(e.accessOverride.endDate) > new Date();
              return (
                <div>
                  <span className={`text-xs font-medium ${isActive ? "text-green-600" : "text-gray-400"}`}>
                    {isActive ? "Active" : "Expired"}
                  </span>
                  <p className="text-xs text-gray-400">Until: {new Date(e.accessOverride.endDate).toLocaleDateString()}</p>
                </div>
              );
            },
          },
          {
            key: "financeExtension", label: "Finance Extension",
            render: (e) => {
              if (!e.financeExtension?.newDueDate) return <span className="text-gray-400 text-sm">None</span>;
              return (
                <div>
                  <p className="text-xs font-medium text-indigo-600">+{e.financeExtension.durationDays} days</p>
                  <p className="text-xs text-gray-400">Due: {new Date(e.financeExtension.newDueDate).toLocaleDateString()}</p>
                </div>
              );
            },
          },
          {
            key: "enrolledAt", label: "Enrolled",
            render: (e) => <span className="text-gray-400 text-sm">{e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : "—"}</span>,
          },
        ]}
        actions={[
          {
            icon: <KeyRound size={14} />, label: "Grant Access",
            onClick: (e) => setGrantingAccess(e),
            className: "hover:bg-teal-50 hover:text-teal-600",
          },
        ]}
      />

      {/* Grant Access Modal */}
      {grantingAccess && (
        <Modal
          isOpen={!!grantingAccess}
          onClose={() => setGrantingAccess(null)}
          title="Grant Free Access"
          subtitle={grantingAccess.user?.name}
          fields={grantFields}
          initialValues={{ days: "30" }}
          onSubmit={grant}
          isLoading={isGranting}
          mode="add"
        />
      )}
    </>
  );
}