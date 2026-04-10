"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminGetModules, adminCreateModule,
  adminUpdateModule, adminDeleteModule
} from "@/utils/api";
import Modal from "@/app/component/ui/model/modal";
import Popup from "@/app/component/ui/popup/popup";
import Button from "@/app/component/ui/button";
import { ModalField } from "@/types/ui";
import toast from "react-hot-toast";
import { X, Plus, Pencil, Trash2, ChevronRight, Layers } from "lucide-react";
import LessonsModal from "./lessons-modal";

const moduleFields: ModalField[] = [
  { name: "title", label: "Module Title", type: "input", inputType: "text", placeholder: "What is NLP?" },
  { name: "description", label: "Description", type: "textarea", placeholder: "Module description..." },
];

type Props = {
  course: any;
  program: any;
  onClose: () => void;
};

export default function ModulesModal({ course, program, onClose }: Props) {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [deletingModule, setDeletingModule] = useState<any>(null);
  const [managingLessons, setManagingLessons] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-modules", course._id],
    queryFn: () => adminGetModules(course._id).then(res => res.data),
  });

  const { mutate: addModule, isPending: isAdding } = useMutation({
    mutationFn: (data: any) => adminCreateModule(course._id, data),
    onSuccess: () => {
      toast.success("Module created! ✅");
      setIsAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-modules", course._id] });
    },
    onError: () => toast.error("Failed!"),
  });

  const { mutate: updateModule, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminUpdateModule(id, data),
    onSuccess: () => {
      toast.success("Module updated! ✅");
      setEditingModule(null);
      queryClient.invalidateQueries({ queryKey: ["admin-modules", course._id] });
    },
    onError: () => toast.error("Failed!"),
  });

  const { mutate: deleteModule, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => adminDeleteModule(id),
    onSuccess: () => {
      toast.success("Module deleted! 🗑️");
      setDeletingModule(null);
      queryClient.invalidateQueries({ queryKey: ["admin-modules", course._id] });
    },
    onError: () => toast.error("Failed!"),
  });

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[80vh] flex flex-col">

          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
            <div>
              <p className="text-xs text-gray-400">{program.name}</p>
              <h2 className="text-lg font-semibold text-gray-800">{course.title}</h2>
              <p className="text-xs text-gray-400 mt-0.5">Modules</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition font-medium"
              >
                <Plus size={12} />
                Add Module
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
                <Layers size={32} className="mx-auto mb-2 opacity-30" />
                No modules yet — add one!
              </div>
            ) : (
              <div className="space-y-3">
                {data?.data?.map((module: any, index: number) => (
                  <div key={module._id} className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition">
                    <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm">{module.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{module.total_lessons} lessons</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => setManagingLessons(module)}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition"
                      >
                        Lessons <ChevronRight size={12} />
                      </button>
                      <button
                        onClick={() => setEditingModule(module)}
                        className="p-1.5 rounded-lg hover:bg-yellow-50 text-gray-400 hover:text-yellow-600 transition"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeletingModule(module)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                      >
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

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Module" fields={moduleFields} onSubmit={(data) => addModule(data)} isLoading={isAdding} mode="add" zIndex={70}/>

      {editingModule && (
        <Modal isOpen={!!editingModule} onClose={() => setEditingModule(null)} title="Edit Module" fields={moduleFields}
          initialValues={{ title: editingModule.title, description: editingModule.description || "" }}
          onSubmit={(data) => updateModule({ id: editingModule._id, data })} isLoading={isUpdating} mode="edit" zIndex={70} />
      )}

      {deletingModule && (
        <Popup isOpen={!!deletingModule} onClose={() => setDeletingModule(null)} onConfirm={() => deleteModule(deletingModule._id)}
          variant="danger" title="Delete Module"
          description={<>Delete <span className="font-bold text-red-500">{deletingModule.title}</span>? All lessons will be deleted.</>}
          confirmText="Yes, Delete" isLoading={isDeleting} loadingText="Deleting..." zIndex={80} />
      )}

      {managingLessons && (
        <LessonsModal module={managingLessons} course={course} program={program} onClose={() => setManagingLessons(null)} zIndex={80} />
      )}
    </>
  );
}