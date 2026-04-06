"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    adminGetAllLeads, adminCreateLead, adminUpdateLead, adminDeleteLead,
    adminAssignLead, adminConvertLead, adminMarkLost, adminAddActivity, adminGetActivities
} from "@/utils/api";
import PageHeader, { FilterField } from "@/app/component/dashboard/page-header";
import Modal from "@/app/component/ui/model/modal";
import { ModalField } from "@/types/ui";
import Button from "@/app/component/ui/button";
import toast from "react-hot-toast";
import { Users, Pencil, UserCheck, XCircle, Activity, Trash2, UserPlus } from "lucide-react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DynamicTable from "@/app/component/dashboard/dynamic-table";
import AssignLeadModal from "./assign-lead-modal";

// ── Fields ──
const addLeadFields: ModalField[] = [
    { name: "first_name", label: "First Name", type: "input", inputType: "text", placeholder: "Ahmed" },
    { name: "last_name", label: "Last Name", type: "input", inputType: "text", placeholder: "Khan" },
    { name: "email", label: "Email", type: "input", inputType: "email", placeholder: "ahmed@gmail.com" },
    { name: "phone", label: "Phone", type: "input", inputType: "text", placeholder: "03001234567" },
    {
        name: "source", label: "Source", type: "select",
        options: [
            { label: "Facebook", value: "facebook" },
            { label: "Google", value: "google" },
            { label: "Organic", value: "organic" },
            { label: "Referral", value: "referral" },
        ]
    },
    {
        name: "quality", label: "Quality", type: "select",
        options: [
            { label: "Hot", value: "hot" },
            { label: "Warm", value: "warm" },
            { label: "Cold", value: "cold" },
        ]
    },
    { name: "notes", label: "Notes", type: "textarea", placeholder: "Koi notes..." },
];

const editFields: ModalField[] = [
    { name: "first_name", label: "First Name", type: "input", inputType: "text" },
    { name: "last_name", label: "Last Name", type: "input", inputType: "text" },
    { name: "email", label: "Email", type: "input", inputType: "email" },
    { name: "phone", label: "Phone", type: "input", inputType: "text" },
    {
        name: "quality", label: "Quality", type: "select",
        options: [
            { label: "Hot", value: "hot" },
            { label: "Warm", value: "warm" },
            { label: "Cold", value: "cold" },
        ]
    },
    {
        name: "source", label: "Source", type: "select",
        options: [
            { label: "Facebook", value: "facebook" },
            { label: "Google", value: "google" },
            { label: "Organic", value: "organic" },
            { label: "Referral", value: "referral" },
        ]
    },
    {
        name: "status", label: "Status", type: "select",
        options: [
            { label: "New", value: "new" },
            { label: "Contacted", value: "contacted" },
            { label: "Qualified", value: "qualified" },
        ]
    },
    { name: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
    { name: "utm_source", label: "UTM Source", type: "input", inputType: "text" },
    { name: "utm_campaign", label: "UTM Campaign", type: "input", inputType: "text" },
];

const activityFields: ModalField[] = [
    {
        name: "activity_type", label: "Activity Type", type: "select",
        options: [
            { label: "Call", value: "call" },
            { label: "Email", value: "email" },
            { label: "Meeting", value: "meeting" },
            { label: "Note", value: "note" },
        ]
    },
    { name: "title", label: "Title", type: "input", inputType: "text", placeholder: "First call" },
    { name: "description", label: "Description", type: "textarea", placeholder: "Details..." },
    { name: "call_duration_minutes", label: "Call Duration (mins)", type: "input", inputType: "text", placeholder: "15" },
    { name: "call_outcome", label: "Call Outcome", type: "input", inputType: "text", placeholder: "interested" },
];

const lostFields: ModalField[] = [
    { name: "lost_reason", label: "Lost Reason", type: "input", inputType: "text", placeholder: "Too expensive" },
    { name: "lost_notes", label: "Notes", type: "textarea", placeholder: "Additional notes..." },
];

const assignFields: ModalField[] = [
    { name: "assigned_to", label: "User ID", type: "input", inputType: "text", placeholder: "Sales rep user ID" },
];

const statusColor = (status: string) => {
    switch (status) {
        case "new": return "bg-sky-100 text-sky-700";
        case "contacted": return "bg-yellow-100 text-yellow-700";
        case "qualified": return "bg-purple-100 text-purple-700";
        case "converted": return "bg-emerald-100 text-emerald-700";
        case "lost": return "bg-rose-100 text-rose-700";
        case "hot": return "bg-red-100 text-red-600";
        case "warm": return "bg-orange-100 text-orange-600";
        case "cold": return "bg-blue-100 text-blue-600";
        default: return "bg-gray-100 text-gray-600";
    }
};

export default function AdminLeads() {
    const queryClient = useQueryClient();

    // ── States ──
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<any>(null);
    const [activityLead, setActivityLead] = useState<any>(null);
    const [lostLead, setLostLead] = useState<any>(null);
    const [assigningLead, setAssigningLead] = useState<any>(null);
    const [showDeleteAll, setShowDeleteAll] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [viewActivities, setViewActivities] = useState<any>(null);
    const [filters, setFilters] = useState({ status: "", quality: "", source: "", search: "" });

    const filterFields: FilterField[] = [
        { type: "input", name: "search", placeholder: "Search name, email..." },
        {
            type: "select", name: "status",
            options: [
                { label: "New", value: "new" },
                { label: "Contacted", value: "contacted" },
                { label: "Qualified", value: "qualified" },
                { label: "Converted", value: "converted" },
                { label: "Lost", value: "lost" },
            ],
        },
        {
            type: "select", name: "quality",
            options: [
                { label: "Hot", value: "hot" },
                { label: "Warm", value: "warm" },
                { label: "Cold", value: "cold" },
            ],
        },
        {
            type: "select", name: "source",
            options: [
                { label: "Facebook", value: "facebook" },
                { label: "Google", value: "google" },
                { label: "Organic", value: "organic" },
                { label: "Referral", value: "referral" },
            ],
        },
    ];

    // ── Queries ──
    const { data, isLoading, isError } = useQuery({
        queryKey: ["admin-leads", filters],
        queryFn: () => adminGetAllLeads(filters).then((res) => res.data),
    });

    const { data: activitiesData, isLoading: isLoadingActivities } = useQuery({
        queryKey: ["lead-activities", viewActivities?._id],
        queryFn: () => adminGetActivities(viewActivities._id).then((res) => res.data),
        enabled: !!viewActivities,
    });

    // ── Mutations ──
    const { mutate: addLead, isPending: isAdding } = useMutation({
        mutationFn: (data: any) => adminCreateLead(data),
        onSuccess: () => {
            toast.success("Lead created! ✅");
            setIsAddOpen(false);
            queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
        },
        onError: (e: any) => toast.error(e?.response?.data?.message || "Failed!"),
    });

    const { mutate: updateLead, isPending: isUpdating } = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => adminUpdateLead(id, data),
        onSuccess: () => {
            toast.success("Lead updated! ✅");
            setEditingLead(null);
            queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
        },
        onError: () => toast.error("Failed to update!"),
    });

    const { mutate: deleteLead, isPending: isDeleting } = useMutation({
        mutationFn: (id: string) => adminDeleteLead(id),
        onSuccess: () => {
            toast.success("Lead deleted! 🗑️");
            setDeletingId(null);
            queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
        },
        onError: () => toast.error("Failed to delete!"),
    });

    const { mutate: assignLead, isPending: isAssigning } = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => adminAssignLead(id, data),
        onSuccess: () => {
            toast.success("Lead assigned! ✅");
            setAssigningLead(null);
            queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
        },
        onError: () => toast.error("Failed to assign!"),
    });

    const { mutate: convertLead } = useMutation({
        mutationFn: (id: string) => adminConvertLead(id),
        onSuccess: () => {
            toast.success("Lead converted! 🎉");
            queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
        },
        onError: () => toast.error("Failed to convert!"),
    });

    const { mutate: markLost, isPending: isMarkingLost } = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => adminMarkLost(id, data),
        onSuccess: () => {
            toast.success("Marked as lost!");
            setLostLead(null);
            queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
        },
        onError: () => toast.error("Failed!"),
    });

    const { mutate: addActivity, isPending: isAddingActivity } = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => adminAddActivity(id, data),
        onSuccess: () => {
            toast.success("Activity added! ✅");
            setActivityLead(null);
            queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
        },
        onError: () => toast.error("Failed!"),
    });

    return (
        <>
            <PageHeader
                title="Leads"
                subtitle="Manage all leads"
                titleIcon={<Users size={24} />}
                totalCount={data?.meta?.total ?? 0}
                onAdd={() => setIsAddOpen(true)}
                onDeleteAll={() => setShowDeleteAll(true)}
                filters={filters}
                setFilters={setFilters}
                filterFields={filterFields}
            />

            {/* Table */}
            <DynamicTable
                data={data?.data || []}
                isLoading={isLoading}
                isError={isError}
                columns={[
                    {
                        key: "name", label: "Name",
                        render: (lead) => (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold text-xs">
                                    {lead.first_name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-gray-800">
                                    {lead.first_name} {lead.last_name}
                                </span>
                            </div>
                        ),
                    },
                    { key: "email", label: "Email" },
                    { key: "phone", label: "Phone" },
                    {
                        key: "quality", label: "Quality",
                        render: (lead) => (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(lead.quality)}`}>
                                {lead.quality}
                            </span>
                        ),
                    },
                    {
                        key: "status", label: "Status",
                        render: (lead) => (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(lead.status)}`}>
                                {lead.status}
                            </span>
                        ),
                    },
                    {
                        key: "source", label: "Source",
                        render: (lead) => <span className="capitalize">{lead.source || "—"}</span>,
                    },
                    {
                        key: "assigned_to", label: "Assigned To",
                        render: (lead) => <span>{lead.assigned_to?.name || "—"}</span>,
                    },
                ]}
                actions={[
                    {
                        icon: <Pencil size={14} />,
                        label: "Edit",
                        onClick: (lead) => setEditingLead(lead),
                        className: "hover:bg-yellow-50 hover:text-yellow-600",
                    },
                    {
                        icon: <UserPlus size={14} />,
                        label: "Assign",
                        onClick: (lead) => setAssigningLead(lead),
                        className: "hover:bg-blue-50 hover:text-blue-600",
                    },
                    {
                        icon: <Activity size={14} />,
                        label: "Add Activity",
                        onClick: (lead) => setActivityLead(lead),
                        className: "hover:bg-purple-50 hover:text-purple-600",
                    },
                    {
                        icon: <MdOutlineRemoveRedEye size={14} />,
                        label: "View Activities",
                        onClick: (lead) => setViewActivities(lead),
                        className: "hover:bg-indigo-50 hover:text-indigo-600",
                    },
                    {
                        icon: <UserCheck size={14} />,
                        label: "Convert",
                        onClick: (lead) => convertLead(lead._id),
                        className: "hover:bg-green-50 hover:text-green-600",
                        hidden: (lead) => lead.status === "converted" || lead.status === "lost",
                    },
                    {
                        icon: <XCircle size={14} />,
                        label: "Mark Lost",
                        onClick: (lead) => setLostLead(lead),
                        className: "hover:bg-red-50 hover:text-red-500",
                        hidden: (lead) => lead.status === "converted" || lead.status === "lost",
                    },
                    {
                        icon: <Trash2 size={14} />,
                        label: "Delete",
                        onClick: (lead) => {
                            setDeletingId(lead._id);
                            deleteLead(lead._id);
                        },
                        className: "hover:bg-red-50 hover:text-red-500",
                    },
                ]}
            />

            {/* ── Add Lead Modal ── */}
            <Modal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                title="Add New Lead"
                fields={addLeadFields}
                onSubmit={(data) => addLead(data)}
                isLoading={isAdding}
                mode="add"
            />

            {/* ── Edit Modal ── */}
            {editingLead && (
                <Modal
                    isOpen={!!editingLead}
                    onClose={() => setEditingLead(null)}
                    title="Edit Lead"
                    subtitle={`${editingLead.first_name} ${editingLead.last_name}`}
                    fields={editFields}
                    initialValues={{
                        first_name: editingLead.first_name,
                        last_name: editingLead.last_name,
                        email: editingLead.email,
                        phone: editingLead.phone || "",
                        quality: editingLead.quality || "",
                        source: editingLead.source || "",
                        status: editingLead.status || "",
                        notes: editingLead.notes || "",
                        utm_source: editingLead.utm_source || "",
                        utm_campaign: editingLead.utm_campaign || "",
                    }}
                    onSubmit={(data) => updateLead({ id: editingLead._id, data })}
                    isLoading={isUpdating}
                    mode="edit"
                />
            )}

            {/* ── Assign Modal ── */}
            {/* {assigningLead && (
                <Modal
                    isOpen={!!assigningLead}
                    onClose={() => setAssigningLead(null)}
                    title="Assign Lead"
                    subtitle={`${assigningLead.first_name} ${assigningLead.last_name}`}
                    fields={assignFields}
                    onSubmit={(data) => assignLead({ id: assigningLead._id, data })}
                    isLoading={isAssigning}
                    mode="add"
                />
            )} */}

            {/* ── Add Activity Modal ── */}
            {activityLead && (
                <Modal
                    isOpen={!!activityLead}
                    onClose={() => setActivityLead(null)}
                    title="Add Activity"
                    subtitle={`${activityLead.first_name} ${activityLead.last_name}`}
                    fields={activityFields}
                    onSubmit={(data) => addActivity({ id: activityLead._id, data })}
                    isLoading={isAddingActivity}
                    mode="add"
                />
            )}

            {/* ── View Activities Modal ── */}
            {viewActivities && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">Activities</h2>
                                <p className="text-xs text-gray-400">{viewActivities.first_name} {viewActivities.last_name}</p>
                            </div>
                            <button onClick={() => setViewActivities(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        {isLoadingActivities ? (
                            <div className="flex justify-center py-8">
                                <div className="w-6 h-6 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : activitiesData?.data?.length === 0 ? (
                            <p className="text-center text-gray-400 py-8">No activities yet</p>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {activitiesData?.data?.map((act: any, i: number) => (
                                    <div key={i} className="border rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-800">{act.title}</span>
                                            <span className="text-xs text-gray-400 capitalize">{act.activity_type}</span>
                                        </div>
                                        {act.description && (
                                            <p className="text-xs text-gray-500">{act.description}</p>
                                        )}
                                        {act.call_duration_minutes && (
                                            <p className="text-xs text-gray-400 mt-1">Duration: {act.call_duration_minutes} mins</p>
                                        )}
                                        {act.call_outcome && (
                                            <p className="text-xs text-gray-400">Outcome: {act.call_outcome}</p>
                                        )}
                                        <p className="text-xs text-gray-300 mt-2">
                                            {new Date(act.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-4">
                            <Button variant="secondary" fullWidth onClick={() => setViewActivities(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Mark Lost Modal ── */}
            {lostLead && (
                <Modal
                    isOpen={!!lostLead}
                    onClose={() => setLostLead(null)}
                    title="Mark as Lost"
                    subtitle={`${lostLead.first_name} ${lostLead.last_name}`}
                    fields={lostFields}
                    onSubmit={(data) => markLost({ id: lostLead._id, data })}
                    isLoading={isMarkingLost}
                    mode="add"
                />
            )}

            {/* ── Delete All Popup ── */}
            {showDeleteAll && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 size={18} className="text-red-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Delete All Leads</h3>
                                <p className="text-xs text-gray-400">This cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete{" "}
                            <span className="font-bold text-red-500">all leads</span>?
                        </p>
                        <div className="flex gap-3">
                            <Button variant="secondary" fullWidth onClick={() => setShowDeleteAll(false)}>
                                Cancel
                            </Button>
                            <Button variant="danger" fullWidth onClick={() => setShowDeleteAll(false)}>
                                Yes, Delete All
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {assigningLead && (
                <AssignLeadModal
                    lead={assigningLead}
                    onClose={() => setAssigningLead(null)}
                    onAssign={(userId) => assignLead({
                        id: assigningLead._id,
                        data: { assigned_to: userId }
                    })}
                    isLoading={isAssigning}
                />
            )}
        </>
    );
}