"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminGetAllLeads, adminMarkLost, adminAddActivity } from "@/utils/api";
import { useAppSelector } from "@/store/hooks";
import PageHeader from "@/app/component/dashboard/page-header";
import Modal from "@/app/component/ui/model/modal";
import { ModalField } from "@/types/ui";
import toast from "react-hot-toast";
import { PhoneCall, XCircle, Activity } from "lucide-react";

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
    case "new": return "bg-blue-100 text-blue-700";
    case "contacted": return "bg-yellow-100 text-yellow-700";
    case "qualified": return "bg-indigo-100 text-indigo-700";
    case "converted": return "bg-teal-100 text-teal-700";
    case "lost": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-600";
  }
};

const qualityColor = (quality: string) => {
  switch (quality) {
    case "hot": return "bg-red-100 text-red-600";
    case "warm": return "bg-orange-100 text-orange-600";
    case "cold": return "bg-blue-100 text-blue-600";
    default: return "bg-gray-100 text-gray-600";
  }
};

export default function SalesRepLeads() {
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);
  const [activityLead, setActivityLead] = useState<any>(null);
  const [lostLead, setLostLead] = useState<any>(null);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["sales-rep-leads", user?.id, search],
    queryFn: () => adminGetAllLeads({
      assigned_to: user?.id,
      search,
    }).then((res) => res.data),
  });

  const { mutate: markLost, isPending: isMarkingLost } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminMarkLost(id, data),
    onSuccess: () => {
      toast.success("Marked as lost!");
      setLostLead(null);
      queryClient.invalidateQueries({ queryKey: ["sales-rep-leads"] });
    },
    onError: () => toast.error("Failed!"),
  });

  const { mutate: addActivity, isPending: isAddingActivity } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminAddActivity(id, data),
    onSuccess: () => {
      toast.success("Activity added! ✅");
      setActivityLead(null);
      queryClient.invalidateQueries({ queryKey: ["sales-rep-leads"] });
    },
    onError: () => toast.error("Failed!"),
  });

  return (
    <>
      <PageHeader
        title="My Leads"
        subtitle="Leads assigned to you"
        titleIcon={<PhoneCall size={24} />}
        totalCount={data?.meta?.total ?? 0}
      />

      {/* Search */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search name, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-300 w-56"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-sm text-gray-400 hover:text-red-500 transition"
          >
            Reset
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-red-500">Failed to load leads.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-gray-400 text-left">
                <th className="px-6 py-4 font-medium">#</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium">Quality</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((lead: any, index: number) => (
                <tr key={lead._id} className="border-b last:border-0 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold text-xs">
                        {lead.first_name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">
                        {lead.first_name} {lead.last_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{lead.email}</td>
                  <td className="px-6 py-4 text-gray-500">{lead.phone || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${qualityColor(lead.quality)}`}>
                      {lead.quality}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setActivityLead(lead)}
                        className="p-2 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition"
                        title="Add Activity"
                      >
                        <Activity size={14} />
                      </button>
                      {lead.status !== "converted" && lead.status !== "lost" && (
                        <button
                          onClick={() => setLostLead(lead)}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                          title="Mark Lost"
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {data?.data?.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    No leads assigned to you
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Activity Modal */}
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

      {/* Mark Lost Modal */}
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
    </>
  );
}