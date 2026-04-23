"use client";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllLeads, createLead, updateLead, deleteLead,
  assignLead, convertLead, markLostLead, addActivityLead,
  getActivitiesLead, getLeadsStats, getNamesPrograms,
} from "@/utils/api";
import PageHeader, { FilterField } from "@/app/component/dashboard/page-header";
import Modal from "@/app/component/ui/model/modal";
import { ModalField } from "@/types/ui";
import toast from "react-hot-toast";
import {
  Users, Pencil, UserCheck, XCircle, Activity,
  Trash2, UserPlus, LayoutGrid, List, ChevronRight,
  Phone, Mail, Tag, ArrowRight,
} from "lucide-react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DynamicTable from "@/app/component/dashboard/dynamic-table";
import AssignLeadModal from "./assign-lead-modal";
import LeadPipeline from "@/app/component/dashboard/lead-pipeline";
import QuickStats from "@/app/component/dashboard/quick-stats";
import Popup from "@/app/component/ui/popup/popup";
import ViewActivityModal from "./view-activity-modal";
import { useAppSelector } from "@/store/hooks";

// ── Pipeline Stages — FrontForce style ───────────────────────
const PIPELINE_STAGES = [
  { key: "new", label: "Application Received", color: "border-sky-600", bg: "bg-sky-200/60", dot: "bg-sky-600" },
  { key: "contacted", label: "Client Contacted", color: "border-yellow-600", bg: "bg-yellow-200/60", dot: "bg-yellow-600" },
  { key: "qualified", label: "Breakthrough Session", color: "border-indigo-600", bg: "bg-indigo-200/60", dot: "bg-indigo-600" },
  { key: "interested", label: "Client Interested", color: "border-orange-600", bg: "bg-orange-200/60", dot: "bg-orange-600" },
  { key: "converted", label: "Payment Received", color: "border-teal-600", bg: "bg-teal-200/60", dot: "bg-teal-600" },
  { key: "enrolled", label: "Enrolled in Batch", color: "border-green-600", bg: "bg-green-200/60", dot: "bg-green-600" },
];

// ── Modal Fields ──────────────────────────────────────────────
// const addLeadFields: ModalField[] = [
//   { name: "first_name", label: "First Name", type: "input", inputType: "text", placeholder: "Ahmed" },
//   { name: "last_name", label: "Last Name", type: "input", inputType: "text", placeholder: "Khan" },
//   { name: "email", label: "Email", type: "input", inputType: "email", placeholder: "ahmed@gmail.com" },
//   { name: "phone", label: "Phone", type: "input", inputType: "text", placeholder: "03001234567" },
//   {
//     name: "opportunity_value",
//     label: "Opportunity Value (Rs)",
//     type: "input",
//     inputType: "number",
//     placeholder: "200000"
//   },
//   {
//     name: "source", label: "Source", type: "select",
//     options: [
//       { label: "Facebook", value: "facebook" },
//       { label: "Google", value: "google" },
//       { label: "Organic", value: "organic" },
//       { label: "Referral", value: "referral" },
//       { label: "Enroll", value: "enroll" },
//       { label: "Contact", value: "contact" },
//     ],
//   },
//   {
//     name: "quality", label: "Quality", type: "select",
//     options: [
//       { label: "Hot", value: "hot" },
//       { label: "Warm", value: "warm" },
//       { label: "Cold", value: "cold" },
//     ],
//   },
//   { name: "notes", label: "Notes", type: "textarea", placeholder: "Koi notes..." },
// ];
const addLeadFields: ModalField[] = [
  { name: "first_name", label: "First Name", type: "input", inputType: "text", placeholder: "Ahmed" },
  { name: "last_name", label: "Last Name", type: "input", inputType: "text", placeholder: "Khan" },
  { name: "email", label: "Email", type: "input", inputType: "email", placeholder: "ahmed@gmail.com" },
  { name: "phone", label: "Phone", type: "input", inputType: "text", placeholder: "03001234567" },
  { name: "nationality", label: "Nationality", type: "input", inputType: "text", placeholder: "Pakistani" },
  { name: "profession", label: "Profession", type: "input", inputType: "text", placeholder: "Engineer" },
  { name: "opportunity_value", label: "Opportunity Value (Rs)", type: "input", inputType: "number", placeholder: "200000" },
  {
    name: "program_id", label: "Program", type: "select",
    options: [], // ← programs dynamically load honge — neeche dekho
  },
  {
    name: "source", label: "Source", type: "select",
    options: [
      { label: "Facebook", value: "facebook" },
      { label: "Google", value: "google" },
      { label: "Organic", value: "organic" },
      { label: "Referral", value: "referral" },
      { label: "Enroll", value: "enroll" },
      { label: "Contact", value: "contact" },
    ],
  },
  {
    name: "quality", label: "Quality", type: "select",
    options: [
      { label: "Hot", value: "hot" },
      { label: "Warm", value: "warm" },
      { label: "Cold", value: "cold" },
    ],
  },
  { name: "query", label: "Query", type: "textarea", placeholder: "Client ka sawaal..." },
  { name: "message", label: "Message", type: "textarea", placeholder: "Additional message..." },
  { name: "notes", label: "Notes", type: "textarea", placeholder: "Internal notes..." },
  { name: "utm_source", label: "UTM Source", type: "input", inputType: "text", placeholder: "google" },
  { name: "utm_medium", label: "UTM Medium", type: "input", inputType: "text", placeholder: "cpc" },
  { name: "utm_campaign", label: "UTM Campaign", type: "input", inputType: "text", placeholder: "nlp-2025" },
];

// const editFields: ModalField[] = [
//   { name: "first_name", label: "First Name", type: "input", inputType: "text" },
//   { name: "last_name", label: "Last Name", type: "input", inputType: "text" },
//   { name: "email", label: "Email", type: "input", inputType: "email" },
//   { name: "phone", label: "Phone", type: "input", inputType: "text" },
//   {
//     name: "quality", label: "Quality", type: "select",
//     options: [
//       { label: "Hot", value: "hot" }, { label: "Warm", value: "warm" }, { label: "Cold", value: "cold" },
//     ],
//   },
//   {
//     name: "source", label: "Source", type: "select",
//     options: [
//       { label: "Facebook", value: "facebook" }, { label: "Google", value: "google" },
//       { label: "Organic", value: "organic" }, { label: "Referral", value: "referral" },
//       { label: "Enroll", value: "enroll" }, { label: "Contact", value: "contact" },
//     ],
//   },
//   {
//     name: "status", label: "Status", type: "select",
//     options: [
//       { label: "New", value: "new" }, { label: "Contacted", value: "contacted" },
//       { label: "Qualified", value: "qualified" }, { label: "Interested", value: "interested" },
//     ],
//   },
//   { name: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
//   { name: "utm_source", label: "UTM Source", type: "input", inputType: "text" },
//   { name: "utm_campaign", label: "UTM Campaign", type: "input", inputType: "text" },
// ];

const editFields: ModalField[] = [
  { name: "first_name", label: "First Name", type: "input", inputType: "text", },
  { name: "last_name", label: "Last Name", type: "input", inputType: "text", },
  { name: "email", label: "Email", type: "input", inputType: "email", },
  { name: "phone", label: "Phone", type: "input", inputType: "text", },
  { name: "nationality", label: "Nationality", type: "input", inputType: "text", },
  { name: "profession", label: "Profession", type: "input", inputType: "text", },
  { name: "opportunity_value", label: "Opportunity Value (Rs)", type: "input", inputType: "number", },
  {
    name: "program_id", label: "Program", type: "select",
    options: [], // dynamically load hoga — same trick
  },
  {
    name: "status", label: "Status", type: "select",
    options: [
      { label: "New", value: "new" },
      { label: "Contacted", value: "contacted" },
      { label: "Qualified", value: "qualified" },
      { label: "Interested", value: "interested" },
      { label: "Converted", value: "converted" },
      { label: "Lost", value: "lost" },
    ],
  },
  {
    name: "quality", label: "Quality", type: "select",
    options: [
      { label: "Hot", value: "hot" },
      { label: "Warm", value: "warm" },
      { label: "Cold", value: "cold" },
    ],
  },
  {
    name: "source", label: "Source", type: "select",
    options: [
      { label: "Facebook", value: "facebook" },
      { label: "Google", value: "google" },
      { label: "Organic", value: "organic" },
      { label: "Referral", value: "referral" },
      { label: "Enroll", value: "enroll" },
      { label: "Contact", value: "contact" },
    ],
  },
  { name: "query", label: "Query", type: "textarea", placeholder: "Client ka sawaal..." },
  { name: "message", label: "Message", type: "textarea", placeholder: "Additional message..." },
  { name: "notes", label: "Notes", type: "textarea", placeholder: "Internal notes..." },
  { name: "utm_source", label: "UTM Source", type: "input", inputType: "text", },
  { name: "utm_medium", label: "UTM Medium", type: "input", inputType: "text", },
  { name: "utm_campaign", label: "UTM Campaign", type: "input", inputType: "text", },
];

const activityFields: ModalField[] = [
  {
    name: "activity_type", label: "Activity Type", type: "select",
    options: [
      { label: "Call", value: "call" }, { label: "Email", value: "email" },
      { label: "Meeting", value: "meeting" }, { label: "Note", value: "note" },
    ],
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

// ── Helpers ───────────────────────────────────────────────────
const qualityColor = (q: string) => {
  const m: Record<string, string> = {
    hot: "bg-red-100 text-red-600",
    warm: "bg-orange-100 text-orange-600",
    cold: "bg-blue-100 text-blue-600",
  };
  return m[q] || "bg-gray-100 text-gray-500";
};

const statusColor = (s: string) => {
  const m: Record<string, string> = {
    new: "bg-sky-100 text-sky-700", contacted: "bg-yellow-100 text-yellow-700",
    qualified: "bg-indigo-100 text-indigo-700", converted: "bg-teal-100 text-teal-700",
    lost: "bg-rose-100 text-rose-700", hot: "bg-red-100 text-red-600",
    warm: "bg-orange-100 text-orange-600", cold: "bg-blue-100 text-blue-600",
  };
  return m[s] || "bg-gray-100 text-gray-600";
};

// map lead.status → pipeline stage key
function toStageKey(status: string) {
  const m: Record<string, string> = {
    new: "new", contacted: "contacted", qualified: "qualified",
    interested: "interested", converted: "converted", enrolled: "enrolled",
  };
  return m[status] || "new";
}

// ── Kanban Lead Card ──────────────────────────────────────────
function KanbanCard({
  lead, programMap, onEdit, onActivity, onConvert, onMarkLost, onDelete, onAssign, onViewActivities,
}: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 hover:shadow-md transition-shadow cursor-pointer group">
      {/* Name + quality */}
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

      {/* Source */}
      {lead.source && (
        <p className="text-[11px] text-gray-400 mb-2 capitalize">{lead.source}</p>
      )}

      {/* Program */}
      {lead.program_id && (
        <div className="flex items-center gap-1 mb-2">
          <Tag size={10} className="text-gray-400" />
          <span className="text-[11px] text-gray-500 truncate">
            {programMap[lead.program_id] || "Program"}
          </span>
        </div>
      )}

      {/* Opportunity value */}
      {lead.opportunity_value && (
        <p className="text-[11px] font-semibold text-gray-700 mb-2">
          Rs {Number(lead.opportunity_value).toLocaleString()}
        </p>
      )}

      {/* Assigned to */}
      {lead.assigned_to && (
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-[8px] font-bold text-gray-900">
            {lead.assigned_to?.name?.charAt(0) || "?"}
          </div>
          <span className="text-[10px] text-gray-400">{lead.assigned_to?.name}</span>
        </div>
      )}

      {/* Action icons */}
      <div className="flex items-center gap-1 pt-2 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(lead)} title="Edit" className="p-1 rounded hover:bg-yellow-50 hover:text-yellow-600 text-gray-400">
          <Pencil size={11} />
        </button>
        <button onClick={() => onAssign(lead)} title="Assign" className="p-1 rounded hover:bg-blue-50 hover:text-blue-600 text-gray-400">
          <UserPlus size={11} />
        </button>
        <button onClick={() => onActivity(lead)} title="Activity" className="p-1 rounded hover:bg-indigo-50 hover:text-indigo-600 text-gray-400">
          <Activity size={11} />
        </button>
        {lead.activities?.length > 0 && (
          <button onClick={() => onViewActivities(lead)} title="View" className="p-1 rounded hover:bg-indigo-50 hover:text-indigo-600 text-gray-400">
            <MdOutlineRemoveRedEye size={11} />
          </button>
        )}
        {lead.status !== "converted" && lead.status !== "lost" && (
          <>
            <button onClick={() => onConvert(lead)} title="Convert" className="p-1 rounded hover:bg-teal-50 hover:text-teal-600 text-gray-400">
              <UserCheck size={11} />
            </button>
            <button onClick={() => onMarkLost(lead)} title="Lost" className="p-1 rounded hover:bg-rose-50 hover:text-rose-500 text-gray-400">
              <XCircle size={11} />
            </button>
          </>
        )}
        <button onClick={() => onDelete(lead)} title="Delete" className="p-1 rounded hover:bg-rose-50 hover:text-rose-500 text-gray-400 ml-auto">
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

// ── Kanban Board ─────────────────────────────────────────────
function KanbanBoard({ leads, programMap, actions }: any) {
  // Group leads by stage
  const grouped: Record<string, any[]> = {};
  PIPELINE_STAGES.forEach((s) => { grouped[s.key] = []; });
  (leads || []).forEach((lead: any) => {
    const key = toStageKey(lead.status);
    if (grouped[key]) grouped[key].push(lead);
  });

  // Total value per column
  const colValue = (key: string) =>
    grouped[key].reduce((sum: number, l: any) => sum + (Number(l.opportunity_value) || 0), 0);

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 min-h-[60vh] " style={{ scrollbarWidth: "thin" }}>
      {PIPELINE_STAGES.map((stage) => (
        <div key={stage.key} className="flex-shrink-0 w-64 flex flex-col">
          {/* Column Header */}
          <div className={`rounded-xl border-t-4 ${stage.color} ${stage.bg} px-3 py-2.5 mb-2`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-700">{stage.label}</p>
              <span className="text-xs font-bold text-gray-500 bg-white px-2 py-0.5 rounded-full">
                {grouped[stage.key].length}
              </span>
            </div>
            {colValue(stage.key) > 0 && (
              <p className="text-[11px] text-gray-500 mt-0.5">
                Rs {colValue(stage.key).toLocaleString()}
              </p>
            )}
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-2 flex-1">
            {grouped[stage.key].length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-500 border-2 border-dashed border-gray-100 rounded-xl">
                No leads
              </div>
            ) : (
              grouped[stage.key].map((lead: any) => (
                <KanbanCard
                  key={lead._id}
                  lead={lead}
                  programMap={programMap}
                  {...actions}
                />
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
  const { user: authUser } = useAppSelector((state) => state.auth);

  // View toggle: opportunities (kanban) | list
  const [activeView, setActiveView] = useState<"opportunities" | "list">("opportunities");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [activityLead, setActivityLead] = useState<any>(null);
  const [lostLead, setLostLead] = useState<any>(null);
  const [assigningLead, setAssigningLead] = useState<any>(null);
  const [deletingLead, setDeletingLead] = useState<any>(null);
  const [viewActivities, setViewActivities] = useState<any>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [filters, setFilters] = useState({ status: "", quality: "", source: "", search: "" });

  const filterFields: FilterField[] = [
    { type: "input", name: "search", placeholder: "Search name, email..." },
    {
      type: "select", name: "status",
      options: [
        { label: "New", value: "new" }, { label: "Contacted", value: "contacted" },
        { label: "Qualified", value: "qualified" }, { label: "Converted", value: "converted" },
        { label: "Lost", value: "lost" },
      ],
    },
    {
      type: "select", name: "quality",
      options: [
        { label: "Hot", value: "hot" }, { label: "Warm", value: "warm" }, { label: "Cold", value: "cold" },
      ],
    },
    {
      type: "select", name: "source",
      options: [
        { label: "Facebook", value: "facebook" }, { label: "Google", value: "google" },
        { label: "Organic", value: "organic" }, { label: "Referral", value: "referral" },
        { label: "Enroll", value: "enroll" }, { label: "Contact", value: "contact" },
      ],
    },
  ];

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

  const addLeadFieldsWithPrograms: ModalField[] = addLeadFields.map((f) =>
    f.name === "program_id"
      ? { ...f, options: (programs || []).map((p: any) => ({ label: p.name, value: p._id })) }
      : f
  );

  const editFieldsWithPrograms: ModalField[] = editFields.map((f) =>
    f.name === "program_id"
      ? { ...f, options: (programs || []).map((p: any) => ({ label: p.name, value: p._id })) }
      : f
  );

  const programMap = Object.fromEntries(
    (programs || []).map((p: any) => [p._id, p.name])
  );

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

  // Shared action handlers for kanban + table
  const actions = {
    onEdit: (lead: any) => setEditingLead(lead),
    onAssign: (lead: any) => setAssigningLead(lead),
    onActivity: (lead: any) => setActivityLead(lead),
    onViewActivities: (lead: any) => setViewActivities(lead),
    onConvert: (lead: any) => convertLeadApi({ id: lead._id, data: { program_id: lead.program_id, batch_id: lead.batch_id, payment_plan_id: lead.payment_plan_id } }),
    onMarkLost: (lead: any) => setLostLead(lead),
    onDelete: (lead: any) => setDeletingLead(lead),
  };

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

      {/* ── View Toggle Tabs ── */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-5">
        <button
          onClick={() => setActiveView("opportunities")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeView === "opportunities" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
        >
          <LayoutGrid size={14} />
          Opportunities
        </button>
        <button
          onClick={() => setActiveView("list")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeView === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
        >
          <List size={14} />
          List
        </button>
      </div>

      {/* ── OPPORTUNITIES / KANBAN VIEW ── */}
      {activeView === "opportunities" && (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <KanbanBoard
              leads={data?.data || []}
              programMap={programMap}
              actions={actions}
            />
          )}
        </>
      )}

      {/* ── LIST VIEW ── */}
      {activeView === "list" && (
        <>
          <DynamicTable
            data={data?.data || []}
            isLoading={isLoading}
            isError={isError}
            columns={[
              {
                key: "name", label: "Name",
                render: (lead) => (
                  <span className="font-medium text-gray-800">
                    {lead.first_name} {lead.last_name}
                  </span>
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
                key: "program_id", label: "Program",
                render: (lead) => <span>{programMap[lead.program_id] || "—"}</span>,
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
              { icon: <Pencil size={14} />, label: "Edit", onClick: actions.onEdit, className: "hover:bg-yellow-50 hover:text-yellow-600" },
              { icon: <UserPlus size={14} />, label: "Assign", onClick: actions.onAssign, className: "hover:bg-blue-50 hover:text-blue-600" },
              { icon: <Activity size={14} />, label: "Add Activity", onClick: actions.onActivity, className: "hover:bg-indigo-50 hover:text-indigo-600" },
              {
                icon: <MdOutlineRemoveRedEye size={14} />, label: "View Activities", onClick: actions.onViewActivities,
                className: "hover:bg-indigo-50 hover:text-indigo-600",
                hidden: (lead) => !lead.activities || lead.activities.length === 0,
              },
              {
                icon: <UserCheck size={14} />, label: "Convert", onClick: actions.onConvert,
                className: "hover:bg-teal-50 hover:text-teal-600",
                hidden: (lead) => lead.status === "converted" || lead.status === "lost",
              },
              {
                icon: <XCircle size={14} />, label: "Mark Lost", onClick: actions.onMarkLost,
                className: "hover:bg-red-50 hover:text-red-500",
                hidden: (lead) => lead.status === "converted" || lead.status === "lost",
              },
              { icon: <Trash2 size={14} />, label: "Delete", onClick: actions.onDelete, className: "hover:bg-red-50 hover:text-red-500" },
            ]}
          />

          {/* Pipeline + Quick Stats — sirf list view mein */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="col-span-2">
              <LeadPipeline data={pipelineData} />
            </div>
            <QuickStats data={quickStatsData} />
          </div>
        </>
      )}

      {/* ── Modals ── */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Lead"
        fields={addLeadFieldsWithPrograms}  // ← yeh
        onSubmit={addLead}
        isLoading={isAdding}
        mode="add"
      />
      {editingLead && (
        <Modal
          isOpen={!!editingLead}
          onClose={() => setEditingLead(null)}
          title="Edit Lead"
          subtitle={`${editingLead.first_name} ${editingLead.last_name}`}
          fields={editFieldsWithPrograms}
          initialValues={{
            first_name: editingLead.first_name || "",
            last_name: editingLead.last_name || "",
            email: editingLead.email || "",
            phone: editingLead.phone || "",
            nationality: editingLead.nationality || "",
            profession: editingLead.profession || "",
            opportunity_value: editingLead.opportunity_value || "",
            program_id: editingLead.program_id?._id
              || editingLead.program_id || "",
            status: editingLead.status || "",
            quality: editingLead.quality || "",
            source: editingLead.source || "",
            query: editingLead.query || "",
            message: editingLead.message || "",
            notes: editingLead.notes || "",
            utm_source: editingLead.utm_source || "",
            utm_medium: editingLead.utm_medium || "",
            utm_campaign: editingLead.utm_campaign || "",
          }}
          onSubmit={(data) => updateLeadApi({ id: editingLead._id, data })}
          isLoading={isUpdating}
          mode="edit"
        />
      )}

      {activityLead && (
        <Modal
          isOpen={!!activityLead} onClose={() => setActivityLead(null)}
          title="Add Activity" subtitle={`${activityLead.first_name} ${activityLead.last_name}`}
          fields={activityFields} onSubmit={(data) => addActivity({ id: activityLead._id, data })}
          isLoading={isAddingActivity} mode="add"
        />
      )}

      <ViewActivityModal
        isOpen={!!viewActivities} onClose={() => setViewActivities(null)}
        lead={viewActivities} activitiesData={activitiesData} isLoading={isLoadingActivities}
      />

      {lostLead && (
        <Modal
          isOpen={!!lostLead} onClose={() => setLostLead(null)}
          title="Mark as Lost" subtitle={`${lostLead.first_name} ${lostLead.last_name}`}
          fields={lostFields} onSubmit={(data) => markLost({ id: lostLead._id, data })}
          isLoading={isMarkingLost} mode="add"
        />
      )}

      {deletingLead && (
        <Popup
          isOpen={!!deletingLead} onClose={() => setDeletingLead(null)}
          onConfirm={() => deleteLeadApi(deletingLead._id)}
          variant="danger" title="Delete Lead"
          description={<>Delete <span className="font-bold text-red-500">{deletingLead.first_name} {deletingLead.last_name}</span>? This cannot be undone.</>}
          confirmText="Yes, Delete" isLoading={isDeleting} loadingText="Deleting..."
        />
      )}

      {assigningLead && (
        <AssignLeadModal
          lead={assigningLead}
          onClose={() => setAssigningLead(null)}
          onAssign={(userId) => assignLeadApi({
            id: assigningLead._id,
            data: { assigned_to: userId }
          })}
          isLoading={isAssigning}
          currentUserRole="admin"
        />
      )}
    </>
  );
}
// "use client";
// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//     getAllLeads, createLead, updateLead, deleteLead,
//     assignLead, convertLead, markLostLead, addActivityLead, getActivitiesLead,
//     getLeadsStats,
//     getNamesPrograms
// } from "@/utils/api";
// import PageHeader, { FilterField } from "@/app/component/dashboard/page-header";
// import Modal from "@/app/component/ui/model/modal";
// import { ModalField } from "@/types/ui";
// import toast from "react-hot-toast";
// import { Users, Pencil, UserCheck, XCircle, Activity, Trash2, UserPlus } from "lucide-react";
// import { MdOutlineRemoveRedEye } from "react-icons/md";
// import DynamicTable from "@/app/component/dashboard/dynamic-table";
// import AssignLeadModal from "./assign-lead-modal";
// import LeadPipeline from "@/app/component/dashboard/lead-pipeline";
// import QuickStats from "@/app/component/dashboard/quick-stats";
// import Popup from "@/app/component/ui/popup/popup";
// import ViewActivityModal from "./view-activity-modal";
// import { useAppSelector } from "@/store/hooks";


// // ── Fields ──
// const addLeadFields: ModalField[] = [
//     { name: "first_name", label: "First Name", type: "input", inputType: "text", placeholder: "Ahmed" },
//     { name: "last_name", label: "Last Name", type: "input", inputType: "text", placeholder: "Khan" },
//     { name: "email", label: "Email", type: "input", inputType: "email", placeholder: "ahmed@gmail.com" },
//     { name: "phone", label: "Phone", type: "input", inputType: "text", placeholder: "03001234567" },
//     {
//         name: "source", label: "Source", type: "select",
//         options: [
//             { label: "Facebook", value: "facebook" },
//             { label: "Google", value: "google" },
//             { label: "Organic", value: "organic" },
//             { label: "Referral", value: "referral" },
//             { label: "Enroll", value: "enroll" },
//             { label: "Contact", value: "contact" },
//         ]
//     },
//     {
//         name: "quality", label: "Quality", type: "select",
//         options: [
//             { label: "Hot", value: "hot" },
//             { label: "Warm", value: "warm" },
//             { label: "Cold", value: "cold" },
//         ]
//     },
//     { name: "notes", label: "Notes", type: "textarea", placeholder: "Koi notes..." },
// ];

// const editFields: ModalField[] = [
//     { name: "first_name", label: "First Name", type: "input", inputType: "text" },
//     { name: "last_name", label: "Last Name", type: "input", inputType: "text" },
//     { name: "email", label: "Email", type: "input", inputType: "email" },
//     { name: "phone", label: "Phone", type: "input", inputType: "text" },
//     {
//         name: "quality", label: "Quality", type: "select",
//         options: [
//             { label: "Hot", value: "hot" },
//             { label: "Warm", value: "warm" },
//             { label: "Cold", value: "cold" },
//         ]
//     },
//     {
//         name: "source", label: "Source", type: "select",
//         options: [
//             { label: "Facebook", value: "facebook" },
//             { label: "Google", value: "google" },
//             { label: "Organic", value: "organic" },
//             { label: "Referral", value: "referral" },
//             { label: "Enroll", value: "enroll" },
//             { label: "Contact", value: "contact" },
//         ]
//     },
//     {
//         name: "status", label: "Status", type: "select",
//         options: [
//             { label: "New", value: "new" },
//             { label: "Contacted", value: "contacted" },
//             { label: "Qualified", value: "qualified" },
//         ]
//     },
//     { name: "notes", label: "Notes", type: "textarea", placeholder: "Notes..." },
//     { name: "utm_source", label: "UTM Source", type: "input", inputType: "text" },
//     { name: "utm_campaign", label: "UTM Campaign", type: "input", inputType: "text" },
// ];

// const activityFields: ModalField[] = [
//     {
//         name: "activity_type", label: "Activity Type", type: "select",
//         options: [
//             { label: "Call", value: "call" },
//             { label: "Email", value: "email" },
//             { label: "Meeting", value: "meeting" },
//             { label: "Note", value: "note" },
//         ]
//     },
//     { name: "title", label: "Title", type: "input", inputType: "text", placeholder: "First call" },
//     { name: "description", label: "Description", type: "textarea", placeholder: "Details..." },
//     { name: "call_duration_minutes", label: "Call Duration (mins)", type: "input", inputType: "text", placeholder: "15" },
//     { name: "call_outcome", label: "Call Outcome", type: "input", inputType: "text", placeholder: "interested" },
// ];

// const lostFields: ModalField[] = [
//     { name: "lost_reason", label: "Lost Reason", type: "input", inputType: "text", placeholder: "Too expensive" },
//     { name: "lost_notes", label: "Notes", type: "textarea", placeholder: "Additional notes..." },
// ];

// const statusColor = (status: string) => {
//     switch (status) {
//         case "new": return "bg-sky-100 text-sky-700";
//         case "contacted": return "bg-yellow-100 text-yellow-700";
//         case "qualified": return "bg-indigo-100 text-indigo-700";
//         case "converted": return "bg-teal-100 text-teal-700";
//         case "lost": return "bg-rose-100 text-rose-700";
//         case "hot": return "bg-red-100 text-red-600";
//         case "warm": return "bg-orange-100 text-orange-600";
//         case "cold": return "bg-blue-100 text-blue-600";
//         default: return "bg-gray-100 text-gray-600";
//     }
// };

// export default function AdminLeads() {
//     const queryClient = useQueryClient();

//     // ── States ──
//     const [isAddOpen, setIsAddOpen] = useState(false);
//     const [editingLead, setEditingLead] = useState<any>(null);
//     const [activityLead, setActivityLead] = useState<any>(null);
//     const [lostLead, setLostLead] = useState<any>(null);
//     const [assigningLead, setAssigningLead] = useState<any>(null);
//     const [showDeletePopup, setShowDeletePopup] = useState(false);
//     const [deletingLead, setDeletingLead] = useState<any>(null);
//     const [viewActivities, setViewActivities] = useState<any>(null);
//     const [filters, setFilters] = useState({ status: "", quality: "", source: "", search: "" });
//     const { user: authUser } = useAppSelector((state) => state.auth);
//     console.log("Current user role in AdminLeads:", authUser?.role);

//     const filterFields: FilterField[] = [
//         { type: "input", name: "search", placeholder: "Search name, email..." },
//         {
//             type: "select", name: "status",
//             options: [
//                 { label: "New", value: "new" },
//                 { label: "Contacted", value: "contacted" },
//                 { label: "Qualified", value: "qualified" },
//                 { label: "Converted", value: "converted" },
//                 { label: "Lost", value: "lost" },
//             ],
//         },
//         {
//             type: "select", name: "quality",
//             options: [
//                 { label: "Hot", value: "hot" },
//                 { label: "Warm", value: "warm" },
//                 { label: "Cold", value: "cold" },
//             ],
//         },
//         {
//             type: "select", name: "source",
//             options: [
//                 { label: "Facebook", value: "facebook" },
//                 { label: "Google", value: "google" },
//                 { label: "Organic", value: "organic" },
//                 { label: "Referral", value: "referral" },
//                 { label: "Enroll", value: "enroll" },
//                 { label: "Contact", value: "contact" },
//             ],
//         },
//     ];

//     // ── Queries ──
//     const { data, isLoading, isError } = useQuery({
//         queryKey: ["admin-leads", filters],
//         queryFn: () => getAllLeads(filters).then((res) => res.data),
//     });

//     const { data: activitiesData, isLoading: isLoadingActivities } = useQuery({
//         queryKey: ["lead-activities", viewActivities?._id],
//         queryFn: () => getActivitiesLead(viewActivities._id).then((res) => res.data),
//         enabled: !!viewActivities,
//     });

//     // ✅ Stats query add karo
//     const { data: statsData } = useQuery({
//         queryKey: ["admin-leads-stats"],
//         queryFn: () => getLeadsStats().then((res) => res.data.data),
//     });

//     const { data: programs } = useQuery({
//         queryKey: ["program-names"],
//         queryFn: getNamesPrograms,
//     });

//     const programMap = Object.fromEntries(
//         (programs || []).map((p: any) => [p._id, p.name])
//     );

//     // Pipeline real data
//     const pipelineData = [
//         { label: "New", count: statsData?.new || 0, color: "bg-sky-500" },
//         { label: "Contacted", count: statsData?.contacted || 0, color: "bg-yellow-400" },
//         { label: "Qualified", count: statsData?.qualified || 0, color: "bg-indigo-500" },
//         { label: "Converted", count: statsData?.converted || 0, color: "bg-teal-500" },
//         { label: "Lost", count: statsData?.lost || 0, color: "bg-rose-400" },
//     ];

//     // Quick stats real data
//     const quickStatsData = [
//         { label: "Conversion Rate", value: `${statsData?.conversionRate || 0}%`, color: "text-teal-600" },
//         { label: "Hot Leads", value: `${statsData?.hot || 0}`, color: "text-red-500" },
//         { label: "Assigned", value: `${statsData?.assigned || 0}`, color: "text-blue-600" },
//         { label: "Lost", value: `${statsData?.lost || 0}`, color: "text-rose-500" },
//     ];

//     // ── Mutations ──
//     const { mutate: addLead, isPending: isAdding } = useMutation({
//         mutationFn: (data: any) => createLead(data),
//         onSuccess: () => {
//             toast.success("Lead created! ✅");
//             setIsAddOpen(false);
//             queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
//         },
//         onError: (e: any) => toast.error(e?.response?.data?.message || "Failed!"),
//     });

//     const { mutate: updateLeadApi, isPending: isUpdating } = useMutation({
//         mutationFn: ({ id, data }: { id: string; data: any }) => updateLead(id, data),
//         onSuccess: () => {
//             toast.success("Lead updated! ✅");
//             setEditingLead(null);
//             queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
//         },
//         onError: () => toast.error("Failed to update!"),
//     });

//     const { mutate: deleteLeadApi, isPending: isDeleting } = useMutation({
//         mutationFn: (id: string) => deleteLead(id),
//         onSuccess: () => {
//             toast.success("Lead deleted! 🗑️");
//             setDeletingLead(null);
//             queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
//         },
//         onError: () => toast.error("Failed to delete!"),
//     });

//     const { mutate: assignLeadApi, isPending: isAssigning } = useMutation({
//         mutationFn: ({ id, data }: { id: string; data: any }) => assignLead(id, data),
//         onSuccess: () => {
//             toast.success("Lead assigned! ✅");
//             setAssigningLead(null);
//             queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
//         },
//         onError: () => toast.error("Failed to assign!"),
//     });

//     const { mutate: convertLeadApi } = useMutation({
//         mutationFn: ({ id, data }: { id: string; data: any }) =>
//             convertLead(id, data),

//         onSuccess: () => {
//             toast.success("Lead converted! 🎉");
//             queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
//         },

//         onError: (err: any) => {
//             toast.error(err?.response?.data?.message || "Failed to convert!");
//         },
//     });

//     const { mutate: markLost, isPending: isMarkingLost } = useMutation({
//         mutationFn: ({ id, data }: { id: string; data: any }) => markLostLead(id, data),
//         onSuccess: () => {
//             toast.success("Marked as lost!");
//             setLostLead(null);
//             queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
//         },
//         onError: () => toast.error("Failed!"),
//     });

//     const { mutate: addActivity, isPending: isAddingActivity } = useMutation({
//         mutationFn: ({ id, data }: { id: string; data: any }) => addActivityLead(id, data),
//         onSuccess: () => {
//             toast.success("Activity added! ✅");
//             setActivityLead(null);
//             queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
//         },
//         onError: () => toast.error("Failed!"),
//     });

//     return (
//         <>
//             <PageHeader
//                 title="Leads"
//                 subtitle="Manage all leads"
//                 titleIcon={<Users size={24} />}
//                 totalCount={data?.meta?.total ?? 0}
//                 onAdd={() => setIsAddOpen(true)}
//                 // onDeleteAll={() => setShowDeletepOPU(true)}
//                 filters={filters}
//                 setFilters={setFilters}
//                 filterFields={filterFields}
//             />

//             {/* Table */}
//             <DynamicTable
//                 data={data?.data || []}
//                 isLoading={isLoading}
//                 isError={isError}
//                 columns={[
//                     {
//                         key: "name", label: "Name",
//                         render: (lead) => (
//                             <div className="flex items-center gap-3">
//                                 {/* <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-900 font-bold text-xs"
//                                     style={{
//                                         background: lead?.avatarColor,
//                                         backdropFilter: "blur(10px)",
//                                         opacity: 0.8,
//                                     }}>
//                                     {lead.first_name?.charAt(0).toUpperCase()}
//                                 </div> */}
//                                 <span className="font-medium text-gray-800">
//                                     {lead.first_name} {lead.last_name}
//                                 </span>
//                             </div>
//                         ),
//                     },
//                     { key: "email", label: "Email" },
//                     { key: "phone", label: "Phone" },
//                     {
//                         key: "quality", label: "Quality",
//                         render: (lead) => (
//                             <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(lead.quality)}`}>
//                                 {lead.quality}
//                             </span>
//                         ),
//                     },
//                     {
//                         key: "status", label: "Status",
//                         render: (lead) => (
//                             <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(lead.status)}`}>
//                                 {lead.status}
//                             </span>
//                         ),
//                     },
//                     {

//                         key: "program_id", label: "Program",
//                         render: (lead) => (
//                             <span>
//                                 {programMap[lead.program_id] || "Not specified"}
//                             </span>
//                         ),
//                     },
//                     {
//                         key: "source", label: "Source",
//                         render: (lead) => <span className="capitalize">{lead.source || "—"}</span>,
//                     },
//                     {
//                         key: "assigned_to", label: "Assigned To",
//                         render: (lead) => <span>{lead.assigned_to?.name || "—"}</span>,
//                     },
//                 ]}
//                 actions={[
//                     {
//                         icon: <Pencil size={14} />,
//                         label: "Edit",
//                         onClick: (lead) => setEditingLead(lead),
//                         className: "hover:bg-yellow-50 hover:text-yellow-600",
//                     },
//                     {
//                         icon: <UserPlus size={14} />,
//                         label: "Assign",
//                         onClick: (lead) => setAssigningLead(lead),
//                         className: "hover:bg-blue-50 hover:text-blue-600",
//                     },
//                     {
//                         icon: <Activity size={14} />,
//                         label: "Add Activity",
//                         onClick: (lead) => setActivityLead(lead),
//                         className: "hover:bg-indigo-50 hover:text-indigo-600",
//                     },
//                     {
//                         icon: <MdOutlineRemoveRedEye size={14} />,
//                         label: "View Activities",
//                         onClick: (lead) => setViewActivities(lead),
//                         className: "hover:bg-indigo-50 hover:text-indigo-600",
//                         hidden: (lead) => !lead.activities || lead.activities.length === 0,
//                     },
//                     {
//                         icon: <UserCheck size={14} />,
//                         label: "Convert",
//                         onClick: (lead) =>
//                             convertLeadApi({
//                                 id: lead._id,
//                                 data: {
//                                     program_id: lead.program_id,
//                                     batch_id: lead.batch_id,
//                                     payment_plan_id: lead.payment_plan_id,
//                                 },
//                             }),
//                         className: "hover:bg-teal-50 hover:text-teal-600",
//                         hidden: (lead) => lead.status === "converted" || lead.status === "lost",
//                     },
//                     {
//                         icon: <XCircle size={14} />,
//                         label: "Mark Lost",
//                         onClick: (lead) => setLostLead(lead),
//                         className: "hover:bg-red-50 hover:text-red-500",
//                         hidden: (lead) => lead.status === "converted" || lead.status === "lost",
//                     },
//                     {
//                         icon: <Trash2 size={14} />,
//                         label: "Delete",
//                         onClick: (lead) => {
//                             setDeletingLead(lead);
//                         },
//                         className: "hover:bg-red-50 hover:text-red-500",
//                     },
//                 ]}
//             />

//             {/* Pipeline + Quick Stats */}
//             <div className="grid grid-cols-3 gap-4 mt-6">
//                 <div className="col-span-2">
//                     <LeadPipeline data={pipelineData} />
//                 </div>

//                 <QuickStats
//                     data={quickStatsData}
//                 />
//             </div>

//             {/* ── Add Lead Modal ── */}
//             <Modal
//                 isOpen={isAddOpen}
//                 onClose={() => setIsAddOpen(false)}
//                 title="Add New Lead"
//                 fields={addLeadFields}
//                 onSubmit={(data) => addLead(data)}
//                 isLoading={isAdding}
//                 mode="add"
//             />

//             {/* ── Edit Modal ── */}
//             {editingLead && (
//                 <Modal
//                     isOpen={!!editingLead}
//                     onClose={() => setEditingLead(null)}
//                     title="Edit Lead"
//                     subtitle={`${editingLead.first_name} ${editingLead.last_name}`}
//                     fields={editFields}
//                     initialValues={{
//                         first_name: editingLead.first_name,
//                         last_name: editingLead.last_name,
//                         email: editingLead.email,
//                         phone: editingLead.phone || "",
//                         quality: editingLead.quality || "",
//                         source: editingLead.source || "",
//                         status: editingLead.status || "",
//                         notes: editingLead.notes || "",
//                         utm_source: editingLead.utm_source || "",
//                         utm_campaign: editingLead.utm_campaign || "",
//                     }}
//                     onSubmit={(data) => updateLeadApi({ id: editingLead._id, data })}
//                     isLoading={isUpdating}
//                     mode="edit"
//                 />
//             )}

//             {/* ── Add Activity Modal ── */}
//             {activityLead && (
//                 <Modal
//                     isOpen={!!activityLead}
//                     onClose={() => setActivityLead(null)}
//                     title="Add Activity"
//                     subtitle={`${activityLead.first_name} ${activityLead.last_name}`}
//                     fields={activityFields}
//                     onSubmit={(data) => addActivity({ id: activityLead._id, data })}
//                     isLoading={isAddingActivity}
//                     mode="add"
//                 />
//             )}

//             {/* ── View Activities Modal ── */}
//             {/* {viewActivities && ( */}
//             <ViewActivityModal
//                 isOpen={!!viewActivities}
//                 onClose={() => setViewActivities(null)}
//                 lead={viewActivities}
//                 activitiesData={activitiesData}
//                 isLoading={isLoadingActivities}
//             />
//             {/* )} */}

//             {/* ── Mark Lost Modal ── */}
//             {lostLead && (
//                 <Modal
//                     isOpen={!!lostLead}
//                     onClose={() => setLostLead(null)}
//                     title="Mark as Lost"
//                     subtitle={`${lostLead.first_name} ${lostLead.last_name}`}
//                     fields={lostFields}
//                     onSubmit={(data) => markLost({ id: lostLead._id, data })}
//                     isLoading={isMarkingLost}
//                     mode="add"
//                 />
//             )}

//             {/* ── Delete Lead Popup ── */}
//             {deletingLead && (
//                 <Popup
//                     isOpen={!!deletingLead}
//                     onClose={() => setDeletingLead(null)}
//                     onConfirm={() => {
//                         deleteLeadApi(deletingLead._id);
//                     }}
//                     variant="danger"
//                     title="Delete Lead"
//                     description={
//                         <>
//                             Are you sure you want to delete{" "}
//                             <span className="font-bold text-red-500">
//                                 {deletingLead.first_name} {deletingLead.last_name}
//                             </span>
//                             ? This action cannot be undone.
//                         </>
//                     }
//                     confirmText="Yes, Delete"
//                     isLoading={isDeleting}
//                     loadingText="Deleting..."
//                 />
//             )}

//             {/* ── Delete All Popup ── */}
//             {showDeletePopup && (
//                 <Popup
//                     isOpen={showDeletePopup}
//                     onClose={() => setShowDeletePopup(false)}
//                     onConfirm={() => {
//                         if (data?.data?.length === 0) {
//                             toast.error("No leads to delete!");
//                             setShowDeletePopup(false);
//                             return;
//                         }
//                     }}
//                     variant="danger"
//                     title="Delete All Leads"
//                     description={
//                         <>
//                             Are you sure you want to delete{" "}
//                             <span className="font-bold text-red-500">all leads</span>?
//                             This will permanently remove every lead from the system.
//                         </>
//                     }
//                     confirmText="Yes, Delete All"
//                     isLoading={isDeleting}
//                     loadingText="Deleting..."
//                 />
//             )}

//             {/* ── Assign Modal ── */}
//             {assigningLead && (
//                 <AssignLeadModal
//                     lead={assigningLead}
//                     onClose={() => setAssigningLead(null)}
//                     onAssign={(userId) => assignLeadApi({
//                         id: assigningLead._id,
//                         data: { assigned_to: userId }
//                     })}
//                     isLoading={isAssigning}
//                     currentUserRole="admin"
//                 />
//             )}
//         </>
//     );
// }