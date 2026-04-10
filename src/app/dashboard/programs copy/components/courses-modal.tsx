"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    adminGetCourses, adminCreateCourse,
    adminUpdateCourse, adminDeleteCourse
} from "@/utils/api";
import Modal from "@/app/component/ui/model/modal";
import Popup from "@/app/component/ui/popup/popup";
import Button from "@/app/component/ui/button";
import { ModalField } from "@/types/ui";
import toast from "react-hot-toast";
import { X, Plus, Pencil, Trash2, ChevronRight, BookOpen } from "lucide-react";
import ModulesModal from "./modules-modal";

const courseFields: ModalField[] = [
    { name: "title", label: "Course Title", type: "input", inputType: "text", placeholder: "Introduction to NLP" },
    { name: "description", label: "Description", type: "textarea", placeholder: "Course description..." },
    {
        name: "status", label: "Status", type: "select",
        options: [
            { label: "Active", value: "active" },
            { label: "Draft", value: "draft" },
            { label: "Inactive", value: "inactive" },
        ]
    },
];

type Props = {
    program: any;
    onClose: () => void;
    zIndex?: number;
};

export default function CoursesModal({ program, onClose, zIndex = 50 }: Props) {
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<any>(null);
    const [deletingCourse, setDeletingCourse] = useState<any>(null);
    const [managingModules, setManagingModules] = useState<any>(null);

    const handleAddCourse = () => {
        setIsAddOpen(true);
    }

    const { data, isLoading } = useQuery({
        queryKey: ["admin-courses", program._id],
        queryFn: () => adminGetCourses(program._id).then(res => res.data),
    });

    const { mutate: addCourse, isPending: isAdding } = useMutation({
        mutationFn: (data: any) => adminCreateCourse(program._id, data),
        onSuccess: () => {
            toast.success("Course created! ✅");
            setIsAddOpen(false);
            queryClient.invalidateQueries({ queryKey: ["admin-courses", program._id] });
            queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
        },
        onError: () => toast.error("Failed!"),
    });

    const { mutate: updateCourse, isPending: isUpdating } = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => adminUpdateCourse(id, data),
        onSuccess: () => {
            toast.success("Course updated! ✅");
            setEditingCourse(null);
            queryClient.invalidateQueries({ queryKey: ["admin-courses", program._id] });
        },
        onError: () => toast.error("Failed!"),
    });

    const { mutate: deleteCourse, isPending: isDeleting } = useMutation({
        mutationFn: (id: string) => adminDeleteCourse(id),
        onSuccess: () => {
            toast.success("Course deleted! 🗑️");
            setDeletingCourse(null);
            queryClient.invalidateQueries({ queryKey: ["admin-courses", program._id] });
            queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
        },
        onError: () => toast.error("Failed!"),
    });

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center  p-4" style={{ zIndex }}>
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">

                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">Courses</h2>
                            <p className="text-xs text-gray-400 mt-0.5">{program.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleAddCourse}
                                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition font-medium"
                            >
                                <Plus size={12} />
                                Add Course
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
                                <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
                                No courses yet — add one!
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data?.data?.map((course: any, index: number) => (
                                    <div key={course._id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition">
                                        {/* Order */}
                                        <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-500 flex-shrink-0">
                                            {index + 1}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-800 text-sm">{course.title}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-gray-400">{course.total_modules} modules</span>
                                                <span className="text-xs text-gray-400">{course.total_lessons} lessons</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${course.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>
                                                    {course.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => setManagingModules(course)}
                                                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition"
                                            >
                                                Modules <ChevronRight size={12} />
                                            </button>
                                            <button
                                                onClick={() => setEditingCourse(course)}
                                                className="p-1.5 rounded-lg hover:bg-yellow-50 text-gray-400 hover:text-yellow-600 transition"
                                            >
                                                <Pencil size={13} />
                                            </button>
                                            <button
                                                onClick={() => setDeletingCourse(course)}
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

                    {/* Footer */}
                    <div className="p-4 border-t flex-shrink-0">
                        <Button variant="secondary" fullWidth onClick={onClose}>Close</Button>
                    </div>
                </div>
            </div>

            {/* Add Course Modal */}
            <Modal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                title="Add Course"
                subtitle={program.name}
                fields={courseFields}
                onSubmit={(data) => addCourse(data)}
                isLoading={isAdding}
                mode="add"
                initialValues={{
                    status: "active",
                }}
                zIndex={60}
            />

            {/* Edit Course Modal */}
            {editingCourse && (
                <Modal
                    isOpen={!!editingCourse}
                    onClose={() => setEditingCourse(null)}
                    title="Edit Course"
                    subtitle={editingCourse.title}
                    fields={courseFields}
                    initialValues={{
                        title: editingCourse.title,
                        description: editingCourse.description || "",
                        status: editingCourse.status,
                    }}
                    onSubmit={(data) => updateCourse({ id: editingCourse._id, data })}
                    isLoading={isUpdating}
                    mode="edit"
                    zIndex={60}
                />
            )}

            {/* Delete Popup */}
            {deletingCourse && (
                <Popup
                    isOpen={!!deletingCourse}
                    onClose={() => setDeletingCourse(null)}
                    onConfirm={() => deleteCourse(deletingCourse._id)}
                    variant="danger"
                    title="Delete Course"
                    description={
                        <>Delete <span className="font-bold text-red-500">{deletingCourse.title}</span>? All modules and lessons will be deleted.</>
                    }
                    confirmText="Yes, Delete"
                    isLoading={isDeleting}
                    loadingText="Deleting..."
                    zIndex={70}
                />
            )}

            {/* Modules Modal */}
            {managingModules && (
                <ModulesModal
                    course={managingModules}
                    program={program}
                    onClose={() => setManagingModules(null)}
                />
            )}
        </>
    );
}