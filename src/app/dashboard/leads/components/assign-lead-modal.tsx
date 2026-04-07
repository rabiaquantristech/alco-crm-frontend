"use client";
import { useQuery } from "@tanstack/react-query";
import { adminGetAllUsers } from "@/utils/api";
import Button from "@/app/component/ui/button";
import { X, User } from "lucide-react";
import { useState } from "react";

type Props = {
  lead: any;
  onClose: () => void;
  onAssign: (userId: string) => void;
  isLoading: boolean;
};

export default function AssignLeadModal({ lead, onClose, onAssign, isLoading }: Props) {
  const [selectedUser, setSelectedUser] = useState(lead.assigned_to?._id || "");

  const { data, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users-for-assign"],
    queryFn: () => adminGetAllUsers().then((res) => res.data),
  });

  // ✅ Sirf sales_manager aur sales_rep
  const assignableUsers = data?.users?.filter((user: any) =>
    ["sales_manager", "sales_rep"].includes(user.role)
  );

  const roleLabel = (role: string) => {
    switch (role) {
      case "sales_manager": return "Sales Manager";
      case "sales_rep": return "Sales Rep";
      default: return role;
    }
  };

  const roleColor = (role: string) => {
    switch (role) {
      case "sales_manager": return "bg-indigo-100 text-indigo-700";
      case "sales_rep": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Assign Lead</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {lead.first_name} {lead.last_name} — {lead.email}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* Current assigned */}
        {lead.assigned_to && (
          <div className="mx-6 mt-4 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
            Currently: <span className="font-medium">{lead.assigned_to?.name}</span>
          </div>
        )}

        {/* User List */}
        <div className="p-6">
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Select Sales Rep or Manager
          </label>

          {isLoadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : assignableUsers?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No sales reps or managers found
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {assignableUsers?.map((user: any) => (
                <div
                  key={user._id}
                  onClick={() => setSelectedUser(user._id)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition ${
                    selectedUser === user._id
                      ? "border-yellow-400 bg-yellow-50"
                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold text-sm flex-shrink-0">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>

                  {/* Role badge */}
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${roleColor(user.role)}`}>
                    {roleLabel(user.role)}
                  </span>

                  {/* Selected indicator */}
                  {selectedUser === user._id && (
                    <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            fullWidth
            isLoading={isLoading}
            loadingText="Assigning..."
            onClick={() => selectedUser && onAssign(selectedUser)}
            disabled={!selectedUser}
          >
            Assign
          </Button>
        </div>

      </div>
    </div>
  );
}