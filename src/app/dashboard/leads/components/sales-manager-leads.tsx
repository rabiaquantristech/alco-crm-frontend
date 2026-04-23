"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllLeads, createLead, updateLead,
  assignLead, convertLead, markLostLead, addActivityLead,
  getActivitiesLead, getLeadsStats,
} from "@/utils/api";
import PageHeader from "@/app/component/dashboard/page-header";
import toast from "react-hot-toast";
import { Users, Pencil, UserCheck, XCircle, Activity, UserPlus } from "lucide-react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DynamicTable from "@/app/component/dashboard/dynamic-table";
import LeadPipeline from "@/app/component/dashboard/lead-pipeline";
import QuickStats from "@/app/component/dashboard/quick-stats";
import LeadsModals from "../shared/leads-modals";
import { simpleAddLeadFields, editLeadFields } from "../shared/fields";
import { statusColor, leadFilterFields, defaultLeadFilters } from "../shared/constants";
import { useAppSelector } from "@/store/hooks";

export default function SalesManagerLeads() {
  const queryClient = useQueryClient();
  const { user: authUser } = useAppSelector((state) => state.auth);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [activityLead, setActivityLead] = useState<any>(null);
  const [lostLead, setLostLead] = useState<any>(null);
  const [assigningLead, setAssigningLead] = useState<any>(null);
  const [viewActivities, setViewActivities] = useState<any>(null);
  const [filters, setFilters] = useState(defaultLeadFilters);

  // ── Queries ──────────────────────────────────────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: ["sales-leads", filters],
    queryFn: () => getAllLeads({ ...filters, assigned_to: authUser._id }).then((r) => r.data),
  });

  const { data: activitiesData, isLoading: isLoadingActivities } = useQuery({
    queryKey: ["lead-activities", viewActivities?._id],
    queryFn: () => getActivitiesLead(viewActivities._id).then((r) => r.data),
    enabled: !!viewActivities,
  });

  const { data: statsData } = useQuery({
    queryKey: ["sales-leads-stats", authUser?._id],
    queryFn: () => getLeadsStats(authUser?._id).then((r) => r.data.data),
    enabled: !!authUser?._id,
  });

  const pipelineData = [
    { label: "New", count: statsData?.new || 0, color: "bg-sky-500" },
    { label: "Contacted", count: statsData?.contacted || 0, color: "bg-yellow-400" },
    { label: "Qualified", count: statsData?.qualified || 0, color: "bg-indigo-500" },
    { label: "Converted", count: statsData?.converted || 0, color: "bg-teal-500" },
    { label: "Lost", count: statsData?.lost || 0, color: "bg-rose-400" },
  ];

  const quickStatsData = [
    { label: "Conversion Rate", value: `${statsData?.conversionRate || 0}%`, color: "text-teal-600" },
    { label: "Hot Leads", value: `${statsData?.hot || 0}`, color: "text-red-500" },
    { label: "Assigned", value: `${statsData?.assigned || 0}`, color: "text-blue-600" },
    { label: "Lost", value: `${statsData?.lost || 0}`, color: "text-rose-500" },
  ];

  // ── Mutations ────────────────────────────────────────────────
  const { mutate: addLead, isPending: isAdding } = useMutation({
    mutationFn: createLead,
    onSuccess: () => { toast.success("Lead created! ✅"); setIsAddOpen(false); queryClient.invalidateQueries({ queryKey: ["sales-leads"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed!"),
  });

  const { mutate: updateLeadApi, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateLead(id, data),
    onSuccess: () => { toast.success("Lead updated! ✅"); setEditingLead(null); queryClient.invalidateQueries({ queryKey: ["sales-leads"] }); },
    onError: () => toast.error("Failed to update!"),
  });

  const { mutate: assignLeadApi, isPending: isAssigning } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => assignLead(id, data),
    onSuccess: () => { toast.success("Lead assigned! ✅"); setAssigningLead(null); queryClient.invalidateQueries({ queryKey: ["sales-leads"] }); },
    onError: () => toast.error("Failed to assign!"),
  });

  const { mutate: convertLeadApi } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => convertLead(id, data),
    onSuccess: () => { toast.success("Lead converted! 🎉"); queryClient.invalidateQueries({ queryKey: ["sales-leads"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to convert!"),
  });

  const { mutate: markLost, isPending: isMarkingLost } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => markLostLead(id, data),
    onSuccess: () => { toast.success("Marked as lost!"); setLostLead(null); queryClient.invalidateQueries({ queryKey: ["sales-leads"] }); },
    onError: () => toast.error("Failed!"),
  });

  const { mutate: addActivity, isPending: isAddingActivity } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => addActivityLead(id, data),
    onSuccess: () => { toast.success("Activity added! ✅"); setActivityLead(null); queryClient.invalidateQueries({ queryKey: ["sales-leads"] }); },
    onError: () => toast.error("Failed!"),
  });

  return (
    <>
      <PageHeader
        title="Leads" subtitle="Manage all leads" titleIcon={<Users size={24} />}
        totalCount={data?.meta?.total ?? 0} onAdd={() => setIsAddOpen(true)}
        filters={filters} setFilters={setFilters} filterFields={leadFilterFields}
      />

      <DynamicTable
        data={data?.data || []} isLoading={isLoading} isError={isError}
        columns={[
          { key: "name", label: "Name", render: (lead) => <span className="font-medium text-gray-800">{lead.first_name} {lead.last_name}</span> },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "quality", label: "Quality", render: (lead) => <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(lead.quality)}`}>{lead.quality}</span> },
          { key: "status", label: "Status", render: (lead) => <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(lead.status)}`}>{lead.status}</span> },
          { key: "source", label: "Source", render: (lead) => <span className="capitalize">{lead.source || "—"}</span> },
          { key: "assigned_to", label: "Assigned To", render: (lead) => <span>{lead.assigned_to?.name || "—"}</span> },
        ]}
        actions={[
          { icon: <Pencil size={14} />, label: "Edit", onClick: setEditingLead, className: "hover:bg-yellow-50 hover:text-yellow-600" },
          { icon: <UserPlus size={14} />, label: "Assign", onClick: setAssigningLead, className: "hover:bg-blue-50 hover:text-blue-600" },
          { icon: <Activity size={14} />, label: "Add Activity", onClick: setActivityLead, className: "hover:bg-indigo-50 hover:text-indigo-600" },
          { icon: <MdOutlineRemoveRedEye size={14} />, label: "View Activities", onClick: setViewActivities, className: "hover:bg-indigo-50 hover:text-indigo-600", hidden: (lead) => !lead.activities?.length },
          { icon: <UserCheck size={14} />, label: "Convert", onClick: (lead) => convertLeadApi({ id: lead._id, data: { program_id: lead.program_id, batch_id: lead.batch_id, payment_plan_id: lead.payment_plan_id } }), className: "hover:bg-teal-50 hover:text-teal-600", hidden: (lead) => lead.status === "converted" || lead.status === "lost" },
          { icon: <XCircle size={14} />, label: "Mark Lost", onClick: setLostLead, className: "hover:bg-red-50 hover:text-red-500", hidden: (lead) => lead.status === "converted" || lead.status === "lost" },
        ]}
      />

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="col-span-2"><LeadPipeline data={pipelineData} /></div>
        <QuickStats data={quickStatsData} />
      </div>

      <LeadsModals
        // Add
        isAddOpen={isAddOpen} onAddClose={() => setIsAddOpen(false)}
        onAddSubmit={addLead} isAdding={isAdding} addFields={simpleAddLeadFields}
        // Edit
        editingLead={editingLead} onEditClose={() => setEditingLead(null)}
        onEditSubmit={(data) => updateLeadApi({ id: editingLead._id, data })}
        isUpdating={isUpdating} editFields={editLeadFields}
        editInitialValues={editingLead ? {
          first_name: editingLead.first_name || "",
          last_name: editingLead.last_name || "",
          email: editingLead.email || "",
          phone: editingLead.phone || "",
          quality: editingLead.quality || "",
          source: editingLead.source || "",
          status: editingLead.status || "",
          notes: editingLead.notes || "",
          utm_source: editingLead.utm_source || "",
          utm_campaign: editingLead.utm_campaign || "",
        } : undefined}
        // Activity
        activityLead={activityLead} onActivityClose={() => setActivityLead(null)}
        onActivitySubmit={(data) => addActivity({ id: activityLead._id, data })} isAddingActivity={isAddingActivity}
        // View Activities
        viewActivities={viewActivities} onViewActivitiesClose={() => setViewActivities(null)}
        activitiesData={activitiesData} isLoadingActivities={isLoadingActivities}
        // Lost
        lostLead={lostLead} onLostClose={() => setLostLead(null)}
        onLostSubmit={(data) => markLost({ id: lostLead._id, data })} isMarkingLost={isMarkingLost}
        // Assign
        assigningLead={assigningLead} onAssignClose={() => setAssigningLead(null)}
        onAssign={(userId) => assignLeadApi({ id: assigningLead._id, data: { assigned_to: userId } })}
        isAssigning={isAssigning} currentUserRole={authUser?.role}
      />
    </>
  );
}