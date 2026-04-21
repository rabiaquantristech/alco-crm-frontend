"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllEnrollments,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  graduateEnrollment,
  suspendEnrollment,
  reactivateEnrollment,
} from "@/utils/api";
import PageHeader, { FilterField } from "@/app/component/dashboard/page-header";
import DynamicTable from "@/app/component/dashboard/dynamic-table";
import Modal from "@/app/component/ui/model/modal";
import Popup from "@/app/component/ui/popup/popup";
import { ModalField } from "@/types/ui";
import toast from "react-hot-toast";
import { BookOpen, Pencil, Trash2, GraduationCap, PauseCircle, PlayCircle } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import ProtectedRoute from "@/app/component/protected-route";

const statusColor = (status: string) => {
  const map: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    completed: "bg-teal-100 text-teal-700",
    suspended: "bg-yellow-100 text-yellow-700",
    cancelled: "bg-gray-100 text-gray-600",
    blocked: "bg-rose-100 text-rose-700",
  };
  return map[status] || "bg-gray-100 text-gray-600";
};

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

const createFields: ModalField[] = [
  { name: "user", label: "User ID", type: "input", inputType: "text", placeholder: "MongoDB ObjectId" },
  { name: "program", label: "Program ID", type: "input", inputType: "text", placeholder: "MongoDB ObjectId" },
  { name: "batch", label: "Batch ID (optional)", type: "input", inputType: "text", placeholder: "MongoDB ObjectId" },
];

const editFields: ModalField[] = [
  { name: "progress", label: "Progress (%)", type: "input", inputType: "number", placeholder: "0-100" },
  {
    name: "status", label: "Status", type: "select",
    options: [
      { label: "Active", value: "active" },
      { label: "Completed", value: "completed" },
      { label: "Suspended", value: "suspended" },
      { label: "Cancelled", value: "cancelled" },
      { label: "Blocked", value: "blocked" },
    ],
  },
];

function EnrollmentsContent() {
  const queryClient = useQueryClient();
  const { user: authUser } = useAppSelector((state) => state.auth);
  const isAdmin = ["admin", "super_admin"].includes(authUser?.role);

  const [filters, setFilters] = useState<Record<string, string>>({
    status: "",
    search: "",
    page: "1",
    limit: "10",
  });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<any>(null);
  const [deletingEnrollment, setDeletingEnrollment] = useState<any>(null);
  const [graduatingEnrollment, setGraduatingEnrollment] = useState<any>(null);
  const [suspendingEnrollment, setSuspendingEnrollment] = useState<any>(null);
  const [reactivatingEnrollment, setReactivatingEnrollment] = useState<any>(null);

  const filterFields: FilterField[] = [
    { type: "input", name: "search", placeholder: "Search..." },
    {
      type: "select", name: "status",
      options: [
        { label: "Active", value: "active" },
        { label: "Completed", value: "completed" },
        { label: "Suspended", value: "suspended" },
        { label: "Cancelled", value: "cancelled" },
        { label: "Blocked", value: "blocked" },
      ],
    },
  ];

  const { data, isLoading, isError } = useQuery({
    queryKey: ["enrollments", filters],
    queryFn: () =>
      getAllEnrollments({
        ...filters,
        page: Number(filters.page),
        limit: Number(filters.limit),
      }).then((r) => r.data),
  });

  // POST /api/v1/enrollments
  const { mutate: addEnrollment, isPending: isAdding } = useMutation({
    mutationFn: createEnrollment,
    onSuccess: () => {
      toast.success("Enrollment created! ✅");
      setIsAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed!"),
  });

  // PUT /api/v1/enrollments/:id
  const { mutate: editEnrollment, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateEnrollment(id, data),
    onSuccess: () => {
      toast.success("Updated! ✅");
      setEditingEnrollment(null);
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
    onError: () => toast.error("Failed to update!"),
  });

  // DELETE /api/v1/enrollments/:id
  const { mutate: deleteEnroll, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteEnrollment(id),
    onSuccess: () => {
      toast.success("Deleted! 🗑️");
      setDeletingEnrollment(null);
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
    onError: () => toast.error("Failed to delete!"),
  });

  // POST /api/v1/enrollments/:id/graduate
  const { mutate: graduate, isPending: isGraduating } = useMutation({
    mutationFn: (id: string) => graduateEnrollment(id),
    onSuccess: () => {
      toast.success("Student graduated! 🎓");
      setGraduatingEnrollment(null);
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
    onError: () => toast.error("Failed!"),
  });

  // POST /api/v1/enrollments/:id/suspend
  const { mutate: suspend, isPending: isSuspending } = useMutation({
    mutationFn: (id: string) => suspendEnrollment(id),
    onSuccess: () => {
      toast.success("Enrollment suspended!");
      setSuspendingEnrollment(null);
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
    onError: () => toast.error("Failed!"),
  });

  // POST /api/v1/enrollments/:id/reactivate
  const { mutate: reactivate, isPending: isReactivating } = useMutation({
    mutationFn: (id: string) => reactivateEnrollment(id),
    onSuccess: () => {
      toast.success("Enrollment reactivated! ✅");
      setReactivatingEnrollment(null);
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
    onError: () => toast.error("Failed!"),
  });

  return (
    <>
      <PageHeader
        title="Enrollments"
        subtitle="Manage all student enrollments"
        titleIcon={<BookOpen size={24} />}
        totalCount={data?.meta?.total ?? 0}
        onAdd={isAdmin ? () => setIsAddOpen(true) : undefined}
        filters={filters}
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
          {
            key: "program", label: "Program",
            render: (e) => <span className="text-gray-700">{e.program?.name || "—"}</span>,
          },
          {
            key: "batch", label: "Batch",
            render: (e) => <span className="text-gray-500 text-sm">{e.batch?.name || "—"}</span>,
          },
          {
            key: "status", label: "Status",
            render: (e) => (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(e.status)}`}>
                {e.status}
              </span>
            ),
          },
          {
            key: "accessStatus", label: "Access",
            render: (e) => (
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${accessColor(e.accessStatus)}`}>
                {e.accessStatus || "—"}
              </span>
            ),
          },
          {
            key: "progress", label: "Progress",
            render: (e) => (
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-yellow-400" style={{ width: `${e.progress || 0}%` }} />
                </div>
                <span className="text-xs text-gray-500">{e.progress || 0}%</span>
              </div>
            ),
          },
          {
            key: "enrolledAt", label: "Enrolled",
            render: (e) => (
              <span className="text-gray-400 text-sm">
                {e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : "—"}
              </span>
            ),
          },
        ]}
        actions={[
          {
            icon: <Pencil size={14} />,
            label: "Edit",
            onClick: (e) => setEditingEnrollment(e),
            className: "hover:bg-yellow-50 hover:text-yellow-600",
            hidden: () => !isAdmin,
          },
          {
            icon: <GraduationCap size={14} />,
            label: "Graduate",
            onClick: (e) => setGraduatingEnrollment(e),
            className: "hover:bg-teal-50 hover:text-teal-600",
            hidden: (e) => e.isGraduated || e.status !== "active" || !isAdmin,
          },
          {
            icon: <PauseCircle size={14} />,
            label: "Suspend",
            onClick: (e) => setSuspendingEnrollment(e),
            className: "hover:bg-yellow-50 hover:text-yellow-600",
            hidden: (e) => e.status !== "active" || !isAdmin,
          },
          {
            icon: <PlayCircle size={14} />,
            label: "Reactivate",
            onClick: (e) => setReactivatingEnrollment(e),
            className: "hover:bg-green-50 hover:text-green-600",
            hidden: (e) => e.status !== "suspended" || !isAdmin,
          },
          {
            icon: <Trash2 size={14} />,
            label: "Delete",
            onClick: (e) => setDeletingEnrollment(e),
            className: "hover:bg-rose-50 hover:text-rose-500",
            hidden: () => !isAdmin,
          },
        ]}
      />

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create Enrollment"
        fields={createFields}
        onSubmit={addEnrollment}
        isLoading={isAdding}
        mode="add"
      />

      {/* Edit Modal */}
      {editingEnrollment && (
        <Modal
          isOpen={!!editingEnrollment}
          onClose={() => setEditingEnrollment(null)}
          title="Edit Enrollment"
          subtitle={editingEnrollment.user?.name}
          fields={editFields}
          initialValues={{
            progress: editingEnrollment.progress || 0,
            status: editingEnrollment.status,
          }}
          onSubmit={(data) => editEnrollment({ id: editingEnrollment._id, data })}
          isLoading={isUpdating}
          mode="edit"
        />
      )}

      {/* Graduate Popup */}
      {graduatingEnrollment && (
        <Popup
          isOpen={!!graduatingEnrollment}
          onClose={() => setGraduatingEnrollment(null)}
          onConfirm={() => graduate(graduatingEnrollment._id)}
          variant="info"
          title="Graduate Student"
          description={
            <>Mark <span className="font-bold text-teal-600">{graduatingEnrollment.user?.name}</span> as graduated?</>
          }
          confirmText="Yes, Graduate 🎓"
          isLoading={isGraduating}
          loadingText="Processing..."
        />
      )}

      {/* Suspend Popup */}
      {suspendingEnrollment && (
        <Popup
          isOpen={!!suspendingEnrollment}
          onClose={() => setSuspendingEnrollment(null)}
          onConfirm={() => suspend(suspendingEnrollment._id)}
          variant="danger"
          title="Suspend Enrollment"
          description={
            <>Suspend enrollment of <span className="font-bold text-yellow-600">{suspendingEnrollment.user?.name}</span>?</>
          }
          confirmText="Yes, Suspend"
          isLoading={isSuspending}
          loadingText="Suspending..."
        />
      )}

      {/* Reactivate Popup */}
      {reactivatingEnrollment && (
        <Popup
          isOpen={!!reactivatingEnrollment}
          onClose={() => setReactivatingEnrollment(null)}
          onConfirm={() => reactivate(reactivatingEnrollment._id)}
          variant="info"
          title="Reactivate Enrollment"
          description={
            <>Reactivate enrollment of <span className="font-bold text-green-600">{reactivatingEnrollment.user?.name}</span>?</>
          }
          confirmText="Yes, Reactivate"
          isLoading={isReactivating}
          loadingText="Reactivating..."
        />
      )}

      {/* Delete Popup */}
      {deletingEnrollment && (
        <Popup
          isOpen={!!deletingEnrollment}
          onClose={() => setDeletingEnrollment(null)}
          onConfirm={() => deleteEnroll(deletingEnrollment._id)}
          variant="danger"
          title="Delete Enrollment"
          description={
            <>Delete enrollment of <span className="font-bold text-rose-500">{deletingEnrollment.user?.name}</span>? This cannot be undone.</>
          }
          confirmText="Yes, Delete"
          isLoading={isDeleting}
          loadingText="Deleting..."
        />
      )}
    </>
  );
}

export default function EnrollmentsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "super_admin", "finance_manager"]}>
      <EnrollmentsContent />
    </ProtectedRoute>
  );
}