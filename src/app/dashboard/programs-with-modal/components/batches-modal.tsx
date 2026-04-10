"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminGetBatches, adminCreateBatch, adminUpdateBatch, adminDeleteBatch } from "@/utils/api";
import Modal from "@/app/component/ui/model/modal";
import Popup from "@/app/component/ui/popup/popup";
import Button from "@/app/component/ui/button";
import { ModalField } from "@/types/ui";
import toast from "react-hot-toast";
import { X, Plus, Pencil, Trash2, Users } from "lucide-react";

const batchFields: ModalField[] = [
  { name: "name", label: "Batch Name", type: "input", inputType: "text", placeholder: "Batch 2026-A" },
  { name: "start_date", label: "Start Date", type: "input", inputType: "date" },
  { name: "end_date", label: "End Date", type: "input", inputType: "date" },
  { name: "max_students", label: "Max Students", type: "input", inputType: "text", placeholder: "30" },
  {
    name: "status", label: "Status", type: "select",
    options: [
      { label: "Upcoming", value: "upcoming" },
      { label: "Active", value: "active" },
      { label: "Completed", value: "completed" },
      { label: "Cancelled", value: "cancelled" },
    ]
  },
];

const statusColor = (status: string) => {
  switch (status) {
    case "upcoming": return "bg-blue-100 text-blue-700";
    case "active": return "bg-emerald-100 text-emerald-700";
    case "completed": return "bg-gray-100 text-gray-600";
    case "cancelled": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-600";
  }
};

type Props = {
  program: any;
  onClose: () => void;
  zIndex?: number;
};

export default function BatchesModal({ program, onClose, zIndex = 50 }: Props) {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any>(null);
  const [deletingBatch, setDeletingBatch] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-batches", program._id],
    queryFn: () => adminGetBatches({ program_id: program._id }).then(res => res.data),
  });

  const { mutate: addBatch, isPending: isAdding } = useMutation({
    mutationFn: (data: any) => adminCreateBatch({ ...data, program_id: program._id }),
    onSuccess: () => {
      toast.success("Batch created! ✅");
      setIsAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-batches", program._id] });
    },
    onError: () => toast.error("Failed!"),
  });

  const { mutate: updateBatch, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminUpdateBatch(id, data),
    onSuccess: () => {
      toast.success("Batch updated! ✅");
      setEditingBatch(null);
      queryClient.invalidateQueries({ queryKey: ["admin-batches", program._id] });
    },
    onError: () => toast.error("Failed!"),
  });

  const { mutate: deleteBatch, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => adminDeleteBatch(id),
    onSuccess: () => {
      toast.success("Batch deleted! 🗑️");
      setDeletingBatch(null);
      queryClient.invalidateQueries({ queryKey: ["admin-batches", program._id] });
    },
    onError: () => toast.error("Failed!"),
  });

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center  p-4" style={{ zIndex }}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[80vh] flex flex-col">

          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Batches</h2>
              <p className="text-xs text-gray-400 mt-0.5">{program.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition font-medium"
              >
                <Plus size={12} />
                Add Batch
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : data?.data?.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Users size={32} className="mx-auto mb-2 opacity-30" />
                No batches yet — add one!
              </div>
            ) : (
              <div className="space-y-3">
                {data?.data?.map((batch: any) => (
                  <div key={batch._id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-800 text-sm">{batch.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(batch.status)}`}>
                          {batch.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>Start: {new Date(batch.start_date).toLocaleDateString()}</span>
                        {batch.end_date && <span>End: {new Date(batch.end_date).toLocaleDateString()}</span>}
                        <span className="flex items-center gap-1">
                          <Users size={10} />
                          {batch.current_students}/{batch.max_students}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => setEditingBatch(batch)} className="p-1.5 rounded-lg hover:bg-yellow-50 text-gray-400 hover:text-yellow-600 transition">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setDeletingBatch(batch)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t flex-shrink-0">
            <Button variant="secondary" fullWidth onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Batch" subtitle={program.name} fields={batchFields} onSubmit={(data) => addBatch(data)} isLoading={isAdding} mode="add" zIndex={60} />

      {editingBatch && (
        <Modal isOpen={!!editingBatch} onClose={() => setEditingBatch(null)} title="Edit Batch" fields={batchFields}
          initialValues={{
            name: editingBatch.name,
            start_date: editingBatch.start_date?.split("T")[0] || "",
            end_date: editingBatch.end_date?.split("T")[0] || "",
            max_students: editingBatch.max_students?.toString(),
            status: editingBatch.status,
          }}
          onSubmit={(data) => updateBatch({ id: editingBatch._id, data })} isLoading={isUpdating} mode="edit" />
      )}

      {deletingBatch && (
        <Popup isOpen={!!deletingBatch} onClose={() => setDeletingBatch(null)} onConfirm={() => deleteBatch(deletingBatch._id)}
          variant="danger" title="Delete Batch"
          description={<>Delete <span className="font-bold text-red-500">{deletingBatch.name}</span>?</>}
          confirmText="Yes, Delete" isLoading={isDeleting} loadingText="Deleting..." />
      )}
    </>
  );
}