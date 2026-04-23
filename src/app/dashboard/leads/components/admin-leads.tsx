"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllLeads, createLead, updateLead, deleteLead,
  assignLead, convertLead, markLostLead, addActivityLead,
  getActivitiesLead, getLeadsStats, getNamesPrograms,
} from "@/utils/api";
import PageHeader from "@/app/component/dashboard/page-header";
import toast from "react-hot-toast";
import {
  Users, Pencil, UserCheck, XCircle, Activity,
  Trash2, UserPlus, LayoutGrid, List, Tag,
} from "lucide-react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DynamicTable from "@/app/component/dashboard/dynamic-table";
import LeadPipeline from "@/app/component/dashboard/lead-pipeline";
import QuickStats from "@/app/component/dashboard/quick-stats";
import LeadsModals from "../shared/leads-modals";
import { addLeadFields, editLeadFields } from "../shared/fields";
import { statusColor, qualityColor, PIPELINE_STAGES, toStageKey, leadFilterFields, defaultLeadFilters } from "../shared/constants";
import { ModalField } from "@/types/ui";

// ── Kanban Card ───────────────────────────────────────────────
function KanbanCard({ lead, programMap, onEdit, onActivity, onConvert, onMarkLost, onDelete, onAssign, onViewActivities }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-semibold text-gray-800 text-sm leading-tight">
          {lead.first_name} {lead.last_name}
        </p>
        {lead.quality && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${qualityColor(lead.quality)}`}>
            {lead.quality}
          </span>
        )}
      </div>
      {lead.source && <p className="text-[11px] text-gray-400 mb-2 capitalize">{lead.source}</p>}
      {lead.program_id && (
        <div className="flex items-center gap-1 mb-2">
          <Tag size={10} className="text-gray-400" />
          <span className="text-[11px] text-gray-500 truncate">{programMap[lead.program_id] || "Program"}</span>
        </div>
      )}
      {lead.opportunity_value && (
        <p className="text-[11px] font-semibold text-gray-700 mb-2">
          Rs {Number(lead.opportunity_value).toLocaleString()}
        </p>
      )}
      {lead.assigned_to && (
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-[8px] font-bold text-gray-900">
            {lead.assigned_to?.name?.charAt(0) || "?"}
          </div>
          <span className="text-[10px] text-gray-400">{lead.assigned_to?.name}</span>
        </div>
      )}
      <div className="flex items-center gap-1 pt-2 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(lead)} title="Edit" className="p-1 rounded hover:bg-yellow-50 hover:text-yellow-600 text-gray-400"><Pencil size={11} /></button>
        <button onClick={() => onAssign(lead)} title="Assign" className="p-1 rounded hover:bg-blue-50 hover:text-blue-600 text-gray-400"><UserPlus size={11} /></button>
        <button onClick={() => onActivity(lead)} title="Activity" className="p-1 rounded hover:bg-indigo-50 hover:text-indigo-600 text-gray-400"><Activity size={11} /></button>
        {lead.activities?.length > 0 && (
          <button onClick={() => onViewActivities(lead)} title="View" className="p-1 rounded hover:bg-indigo-50 hover:text-indigo-600 text-gray-400"><MdOutlineRemoveRedEye size={11} /></button>
        )}
        {lead.status !== "converted" && lead.status !== "lost" && (
          <>
            <button onClick={() => onConvert(lead)} title="Convert" className="p-1 rounded hover:bg-teal-50 hover:text-teal-600 text-gray-400"><UserCheck size={11} /></button>
            <button onClick={() => onMarkLost(lead)} title="Lost" className="p-1 rounded hover:bg-rose-50 hover:text-rose-500 text-gray-400"><XCircle size={11} /></button>
          </>
        )}
        <button onClick={() => onDelete(lead)} title="Delete" className="p-1 rounded hover:bg-rose-50 hover:text-rose-500 text-gray-400 ml-auto"><Trash2 size={11} /></button>
      </div>
    </div>
  );
}

// ── Kanban Board ──────────────────────────────────────────────
function KanbanBoard({ leads, programMap, actions }: any) {
  const grouped: Record<string, any[]> = {};
  PIPELINE_STAGES.forEach((s) => { grouped[s.key] = []; });
  (leads || []).forEach((lead: any) => {
    const key = toStageKey(lead.status);
    if (grouped[key]) grouped[key].push(lead);
  });

  const colValue = (key: string) =>
    grouped[key].reduce((sum: number, l: any) => sum + (Number(l.opportunity_value) || 0), 0);

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 min-h-[60vh]" style={{ scrollbarWidth: "thin" }}>
      {PIPELINE_STAGES.map((stage) => (
        <div key={stage.key} className="flex-shrink-0 w-64 flex flex-col">
          <div className={`rounded-xl border-t-4 ${stage.color} ${stage.bg} px-3 py-2.5 mb-2`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-700">{stage.label}</p>
              <span className="text-xs font-bold text-gray-500 bg-white px-2 py-0.5 rounded-full">
                {grouped[stage.key].length}
              </span>
            </div>
            {colValue(stage.key) > 0 && (
              <p className="text-[11px] text-gray-500 mt-0.5">Rs {colValue(stage.key).toLocaleString()}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            {grouped[stage.key].length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-500 border-2 border-dashed border-gray-100 rounded-xl">No leads</div>
            ) : (
              grouped[stage.key].map((lead: any) => (
                <KanbanCard key={lead._id} lead={lead} programMap={programMap} {...actions} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function AdminLeads() {
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<"opportunities" | "list">("opportunities");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [activityLead, setActivityLead] = useState<any>(null);
  const [lostLead, setLostLead] = useState<any>(null);
  const [assigningLead, setAssigningLead] = useState<any>(null);
  const [deletingLead, setDeletingLead] = useState<any>(null);
  const [viewActivities, setViewActivities] = useState<any>(null);
  const [filters, setFilters] = useState(defaultLeadFilters);

  // ── Queries ──────────────────────────────────────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-leads", filters],
    queryFn: () => getAllLeads(filters).then((r) => r.data),
  });

  const { data: activitiesData, isLoading: isLoadingActivities } = useQuery({
    queryKey: ["lead-activities", viewActivities?._id],
    queryFn: () => getActivitiesLead(viewActivities._id).then((r) => r.data),
    enabled: !!viewActivities,
  });

  const { data: statsData } = useQuery({
    queryKey: ["admin-leads-stats"],
    queryFn: () => getLeadsStats().then((r) => r.data.data),
  });

  const { data: programs } = useQuery({
    queryKey: ["program-names"],
    queryFn: getNamesPrograms,
  });

  // Inject programs into fields
  const injectPrograms = (fields: ModalField[]) =>
    fields.map((f) =>
      f.name === "program_id"
        ? { ...f, options: (programs || []).map((p: any) => ({ label: p.name, value: p._id })) }
        : f
    );

  const programMap = Object.fromEntries((programs || []).map((p: any) => [p._id, p.name]));

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
    onSuccess: () => { toast.success("Lead created! ✅"); setIsAddOpen(false); queryClient.invalidateQueries({ queryKey: ["admin-leads"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed!"),
  });

  const { mutate: updateLeadApi, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateLead(id, data),
    onSuccess: () => { toast.success("Lead updated! ✅"); setEditingLead(null); queryClient.invalidateQueries({ queryKey: ["admin-leads"] }); },
    onError: () => toast.error("Failed to update!"),
  });

  const { mutate: deleteLeadApi, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => { toast.success("Lead deleted! 🗑️"); setDeletingLead(null); queryClient.invalidateQueries({ queryKey: ["admin-leads"] }); },
    onError: () => toast.error("Failed to delete!"),
  });

  const { mutate: assignLeadApi, isPending: isAssigning } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => assignLead(id, data),
    onSuccess: () => { toast.success("Lead assigned! ✅"); setAssigningLead(null); queryClient.invalidateQueries({ queryKey: ["admin-leads"] }); },
    onError: () => toast.error("Failed to assign!"),
  });

  const { mutate: convertLeadApi } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => convertLead(id, data),
    onSuccess: () => { toast.success("Lead converted! 🎉"); queryClient.invalidateQueries({ queryKey: ["admin-leads"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to convert!"),
  });

  const { mutate: markLost, isPending: isMarkingLost } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => markLostLead(id, data),
    onSuccess: () => { toast.success("Marked as lost!"); setLostLead(null); queryClient.invalidateQueries({ queryKey: ["admin-leads"] }); },
    onError: () => toast.error("Failed!"),
  });

  const { mutate: addActivity, isPending: isAddingActivity } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => addActivityLead(id, data),
    onSuccess: () => { toast.success("Activity added! ✅"); setActivityLead(null); queryClient.invalidateQueries({ queryKey: ["admin-leads"] }); },
    onError: () => toast.error("Failed!"),
  });

  // ── Shared Actions ───────────────────────────────────────────
  const actions = {
    onEdit: setEditingLead,
    onAssign: setAssigningLead,
    onActivity: setActivityLead,
    onViewActivities: setViewActivities,
    onConvert: (lead: any) => convertLeadApi({ id: lead._id, data: { program_id: lead.program_id, batch_id: lead.batch_id, payment_plan_id: lead.payment_plan_id } }),
    onMarkLost: setLostLead,
    onDelete: setDeletingLead,
  };

  return (
    <>
      <PageHeader
        title="Leads" subtitle="Manage all leads" titleIcon={<Users size={24} />}
        totalCount={data?.meta?.total ?? 0} onAdd={() => setIsAddOpen(true)}
        filters={filters} setFilters={setFilters} filterFields={leadFilterFields}
      />

      {/* ── View Toggle ── */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-5">
        <button
          onClick={() => setActiveView("opportunities")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeView === "opportunities" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          <LayoutGrid size={14} /> Opportunities
        </button>
        <button
          onClick={() => setActiveView("list")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeView === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          <List size={14} /> List
        </button>
      </div>

      {/* ── Kanban View ── */}
      {activeView === "opportunities" && (
        isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <KanbanBoard leads={data?.data || []} programMap={programMap} actions={actions} />
        )
      )}

      {/* ── List View ── */}
      {activeView === "list" && (
        <>
          <DynamicTable
            data={data?.data || []} isLoading={isLoading} isError={isError}
            columns={[
              { key: "name", label: "Name", render: (lead) => <span className="font-medium text-gray-800">{lead.first_name} {lead.last_name}</span> },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              { key: "quality", label: "Quality", render: (lead) => <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(lead.quality)}`}>{lead.quality}</span> },
              { key: "status", label: "Status", render: (lead) => <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(lead.status)}`}>{lead.status}</span> },
              { key: "program_id", label: "Program", render: (lead) => <span>{programMap[lead.program_id] || "—"}</span> },
              { key: "source", label: "Source", render: (lead) => <span className="capitalize">{lead.source || "—"}</span> },
              { key: "assigned_to", label: "Assigned To", render: (lead) => <span>{lead.assigned_to?.name || "—"}</span> },
            ]}
            actions={[
              { icon: <Pencil size={14} />, label: "Edit", onClick: actions.onEdit, className: "hover:bg-yellow-50 hover:text-yellow-600" },
              { icon: <UserPlus size={14} />, label: "Assign", onClick: actions.onAssign, className: "hover:bg-blue-50 hover:text-blue-600" },
              { icon: <Activity size={14} />, label: "Add Activity", onClick: actions.onActivity, className: "hover:bg-indigo-50 hover:text-indigo-600" },
              { icon: <MdOutlineRemoveRedEye size={14} />, label: "View Activities", onClick: actions.onViewActivities, className: "hover:bg-indigo-50 hover:text-indigo-600", hidden: (lead) => !lead.activities?.length },
              { icon: <UserCheck size={14} />, label: "Convert", onClick: actions.onConvert, className: "hover:bg-teal-50 hover:text-teal-600", hidden: (lead) => lead.status === "converted" || lead.status === "lost" },
              { icon: <XCircle size={14} />, label: "Mark Lost", onClick: actions.onMarkLost, className: "hover:bg-red-50 hover:text-red-500", hidden: (lead) => lead.status === "converted" || lead.status === "lost" },
              { icon: <Trash2 size={14} />, label: "Delete", onClick: actions.onDelete, className: "hover:bg-red-50 hover:text-red-500" },
            ]}
          />
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="col-span-2"><LeadPipeline data={pipelineData} /></div>
            <QuickStats data={quickStatsData} />
          </div>
        </>
      )}

      {/* ── All Modals ── */}
      <LeadsModals
        // Add
        isAddOpen={isAddOpen} onAddClose={() => setIsAddOpen(false)}
        onAddSubmit={addLead} isAdding={isAdding} addFields={injectPrograms(addLeadFields)}
        // Edit
        editingLead={editingLead} onEditClose={() => setEditingLead(null)}
        onEditSubmit={(data) => updateLeadApi({ id: editingLead._id, data })}
        isUpdating={isUpdating} editFields={injectPrograms(editLeadFields)}
        editInitialValues={editingLead ? {
          first_name: editingLead.first_name || "",
          last_name: editingLead.last_name || "",
          email: editingLead.email || "",
          phone: editingLead.phone || "",
          nationality: editingLead.nationality || "",
          profession: editingLead.profession || "",
          opportunity_value: editingLead.opportunity_value || "",
          program_id: editingLead.program_id?._id || editingLead.program_id || "",
          status: editingLead.status || "",
          quality: editingLead.quality || "",
          source: editingLead.source || "",
          query: editingLead.query || "",
          message: editingLead.message || "",
          notes: editingLead.notes || "",
          utm_source: editingLead.utm_source || "",
          utm_medium: editingLead.utm_medium || "",
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
        // Delete
        deletingLead={deletingLead} onDeleteClose={() => setDeletingLead(null)}
        onDeleteConfirm={() => deleteLeadApi(deletingLead._id)} isDeleting={isDeleting}
        // Assign
        assigningLead={assigningLead} onAssignClose={() => setAssigningLead(null)}
        onAssign={(userId) => assignLeadApi({ id: assigningLead._id, data: { assigned_to: userId } })}
        isAssigning={isAssigning} currentUserRole="admin"
      />
    </>
  );
}