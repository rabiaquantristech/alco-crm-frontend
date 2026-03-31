"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminGetAllUsers, adminUpdateUser, adminDeleteUser } from "@/utils/api";
import { User, UserRole, UsersResponse } from "@/types/apiType";
import ProtectedRoute from "@/app/component/protected-route";
import toast from "react-hot-toast";
import { Pencil, Trash2, UserCog, X, Check } from "lucide-react";
import Modal from "../component/ui/model/modal";
import { ModalField } from "@/types/ui";


// ✅ Edit Modal Component
const userFields: ModalField[] = [
  { name: "name", label: "Name", type: "input", inputType: "text", placeholder: "Enter name" },
  { name: "email", label: "Email", type: "input", inputType: "email", placeholder: "Enter email" },
  {
    name: "role", label: "Role", type: "select",
    options: [
      { label: "User", value: "user" },
      { label: "Admin", value: "admin" },
      { label: "Relationship Manager", value: "relationship_manager" },
    ]
  },
];

// ✅ Main Admin Page
export default function AdminPage() {
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch Users
  const { data, isLoading, isError } = useQuery<UsersResponse>({
    queryKey: ["admin-users"],
    queryFn: () => adminGetAllUsers().then((res) => res.data),
  });

  // Update User
  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; email: string; role: string } }) =>
      adminUpdateUser(id, data),
    onSuccess: () => {
      toast.success("User updated successfully! ✅");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditingUser(null);
    },
    onError: () => toast.error("Failed to update user!"),
  });

  // Delete User
  const { mutate: deleteUser, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => adminDeleteUser(id),
    onSuccess: () => {
      toast.success("User deleted! 🗑️");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDeletingId(null);
    },
    onError: () => toast.error("Failed to delete user!"),
  });

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteUser(id);
  };

  const roleColor = (role: string) =>
    role === "admin"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-100 text-gray-600";

  return (
    <ProtectedRoute>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserCog size={24} />
            Admin Panel
          </h1>
          <p className="text-gray-400 text-sm">Manage all users and their roles</p>
        </div>
        <div className="bg-white rounded-xl px-4 py-2 shadow-sm text-sm text-gray-600">
          Total Users:{" "}
          <span className="font-bold text-gray-900">{data?.count ?? 0}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-red-500">
            Failed to load users. Please try again.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-gray-400 text-left">
                <th className="px-6 py-4 font-medium">#</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.users?.map((user, index) => (
                <tr key={user._id} className="border-b last:border-0 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-2 rounded-lg hover:bg-yellow-50 text-gray-400 hover:text-yellow-600 transition"
                      >
                        <Pencil size={15} />
                      </button>
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(user._id)}
                        disabled={isDeleting && deletingId === user._id}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>


      {/* Edit Modal */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title="Edit User"
          fields={userFields}
          initialValues={{
            name: editingUser.name,
            email: editingUser.email,
            role: editingUser.role,
          }}
          onSubmit={(data) => updateUser({
            id: editingUser._id,
            data: data as { name: string; email: string; role: UserRole }
          })}
          isLoading={isUpdating}
          mode="edit"
        />
      )}
    </ProtectedRoute>
  );
}