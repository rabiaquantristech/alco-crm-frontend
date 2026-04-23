"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllLeads, createLead, updateLead, addActivityLead, getActivitiesLead
} from "@/utils/api";
import PageHeader, { FilterField } from "@/app/component/dashboard/page-header";
import Modal from "@/app/component/ui/model/modal";
import { ModalField } from "@/types/ui";
import toast from "react-hot-toast";
import { Users, Pencil, Activity, } from "lucide-react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DynamicTable from "@/app/component/dashboard/dynamic-table";
import ViewActivityModal from "./view-activity-modal";
import { useAppSelector } from "@/store/hooks";



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
      { label: "Enroll", value: "enroll" },
      { label: "Contact", value: "contact" },
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
  { name: "first_name", label: "First Name", type: "input", inputType: "text", disabled: true },
  { name: "last_name", label: "Last Name", type: "input", inputType: "text", disabled: true },
  { name: "email", label: "Email", type: "input", inputType: "email", disabled: true },
  { name: "phone", label: "Phone", type: "input", inputType: "text", disabled: true },
  {
    name: "quality", label: "Quality", type: "select", disabled: true,
    options: [
      { label: "Hot", value: "hot" },
      { label: "Warm", value: "warm" },
      { label: "Cold", value: "cold" },
    ]
  },
  {
    name: "source", label: "Source", type: "select", disabled: true,
    options: [
      { label: "Facebook", value: "facebook" },
      { label: "Google", value: "google" },
      { label: "Organic", value: "organic" },
      { label: "Referral", value: "referral" },
      { label: "Enroll", value: "enroll" },
      { label: "Contact", value: "contact" },
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
  { name: "notes", label: "Notes", type: "textarea", placeholder: "Notes...", disabled: true },
  { name: "utm_source", label: "UTM Source", type: "input", inputType: "text", disabled: true },
  { name: "utm_campaign", label: "UTM Campaign", type: "input", inputType: "text", disabled: true },
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

const statusColor = (status: string) => {
  switch (status) {
    case "new": return "bg-sky-100 text-sky-700";
    case "contacted": return "bg-yellow-100 text-yellow-700";
    case "qualified": return "bg-indigo-100 text-indigo-700";
    case "converted": return "bg-teal-100 text-teal-700";
    case "lost": return "bg-rose-100 text-rose-700";
    case "hot": return "bg-red-100 text-red-600";
    case "warm": return "bg-orange-100 text-orange-600";
    case "cold": return "bg-blue-100 text-blue-600";
    default: return "bg-gray-100 text-gray-600";
  }
};

export default function SalesRepLeads() {
  const queryClient = useQueryClient();

  // ── States ──
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [activityLead, setActivityLead] = useState<any>(null);
  const [viewActivities, setViewActivities] = useState<any>(null);
  const [filters, setFilters] = useState({ status: "", quality: "", source: "", search: "" });
  const { user: authUser } = useAppSelector((state) => state.auth);
  console.log("Current user role in SalesManagerLeads:", authUser?.role);

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
        { label: "Enroll", value: "enroll" },
        { label: "Contact", value: "contact" },
      ],
    },
  ];

  // ── Queries ──
  const { data, isLoading, isError } = useQuery({
    queryKey: ["sales-leads", filters],
    queryFn: () => getAllLeads({
      ...filters,
      assigned_to: authUser._id
    }).then((res) => res.data),
  });

  const { data: activitiesData, isLoading: isLoadingActivities } = useQuery({
    queryKey: ["lead-activities", viewActivities?._id],
    queryFn: () => getActivitiesLead(viewActivities._id).then((res) => res.data),
    enabled: !!viewActivities,
  });

  // ── Mutations ──
  const { mutate: addLead, isPending: isAdding } = useMutation({
    mutationFn: (data: any) => createLead(data),
    onSuccess: () => {
      toast.success("Lead created! ✅");
      setIsAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ["sales-leads"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed!"),
  });

  const { mutate: updateLeadApi, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateLead(id, data),
    onSuccess: () => {
      toast.success("Lead updated! ✅");
      setEditingLead(null);
      queryClient.invalidateQueries({ queryKey: ["sales-leads"] });
    },
    onError: () => toast.error("Failed to update!"),
  });

  const { mutate: addActivity, isPending: isAddingActivity } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => addActivityLead(id, data),
    onSuccess: () => {
      toast.success("Activity added! ✅");
      setActivityLead(null);
      queryClient.invalidateQueries({ queryKey: ["sales-leads"] });
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
                {/* <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-900 font-bold text-xs"
                                    style={{
                                        background: lead?.avatarColor,
                                        backdropFilter: "blur(10px)",
                                        opacity: 0.8,
                                    }}>
                                    {lead.first_name?.charAt(0).toUpperCase()}
                                </div> */}
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
          },
          {
            icon: <Activity size={14} />,
            label: "Add Activity",
            onClick: (lead) => setActivityLead(lead),
          },
          {
            icon: <MdOutlineRemoveRedEye size={14} />,
            label: "View Activities",
            onClick: (lead) => setViewActivities(lead),
            hidden: (lead) => !lead.activities || lead.activities.length === 0,
          }
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
          onSubmit={(data) => updateLeadApi({ id: editingLead._id, data })}
          isLoading={isUpdating}
          mode="edit"
        />
      )}

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
      {/* {viewActivities && ( */}
      <ViewActivityModal
        isOpen={!!viewActivities}
        onClose={() => setViewActivities(null)}
        lead={viewActivities}
        activitiesData={activitiesData}
        isLoading={isLoadingActivities}
      />
      {/* )} */}




    </>
  );
}