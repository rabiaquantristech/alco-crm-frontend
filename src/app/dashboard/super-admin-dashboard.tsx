"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminGetAllUsers, adminUpdateUser, adminDeleteUser, adminDeleteAllUsers, adminCreateUser, adminAssignRole, adminUpdateUserPassword } from "@/utils/api";
import { User, UserRole, UsersResponse } from "@/types/apiType";
import ProtectedRoute from "@/app/component/protected-route";
import toast from "react-hot-toast";
import { Pencil, Trash2, UserCog, Plus } from "lucide-react";
import Modal from "../component/ui/model/modal";
import { ModalField } from "@/types/ui";
import Button from "@/app/component/ui/button";
import Popup from "../component/ui/popup/popup";
import { useAppSelector } from "@/store/hooks";

// Add fields
const addUserFields: ModalField[] = [
  { name: "name", label: "Name", type: "input", inputType: "text", placeholder: "Enter name" },
  { name: "email", label: "Email", type: "input", inputType: "email", placeholder: "Enter email" },
  { name: "password", label: "Password", type: "input", inputType: "password", placeholder: "Enter password" },
  {
    name: "role", label: "Role", type: "select",
    options: [
      { label: "User", value: "user" },
      { label: "Admin", value: "admin" },
      { label: "sales Manager", value: "sales_manager" },
    ]
  },
];

export default function SuperAdminDashboard () {
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const { user: authUser } = useAppSelector((state) => state.auth);

  // Fetch Users
  const { data, isLoading, isError } = useQuery<UsersResponse>({
    queryKey: ["admin-users"],
    queryFn: () => adminGetAllUsers().then((res) => res.data),
  });

  // Add User
  const { mutate: addUser, isPending: isAdding } = useMutation({
    mutationFn: (data: any) => adminCreateUser(data),
    onSuccess: () => {
      toast.success("User created successfully! ✅");
      setIsAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to create user!"),
  });

  // Update User — General + Security tab
  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminUpdateUser(id, data),
    onSuccess: () => {
      toast.success("User updated! ✅");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditingUser(null);
    },
    onError: () => toast.error("Failed to update user!"),
  });

  // Change Password
  const { mutate: changePassword, isPending: isChangingPassword } = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      adminUpdateUserPassword(id, password),
    onSuccess: () => {
      toast.success("Password updated! 🔐");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditingUser(null);
    },
    onError: () => toast.error("Failed to update password!"),
  });

  // ✅ Assign Role — Role tab
  const { mutate: assignRole, isPending: isAssigningRole } = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminAssignRole(id, role),
    onSuccess: () => {
      toast.success("Role updated! ✅");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditingUser(null);
    },
    onError: () => toast.error("Failed to update role!"),
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

  // Delete All
  const { mutate: deleteAll, isPending: isDeletingAll } = useMutation({
    mutationFn: () => adminDeleteAllUsers(),
    onSuccess: () => {
      toast.success("All users deleted!");
      setShowDeleteAll(false);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => toast.error("Failed to delete all users!"),
  });

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteUser(id);
  };

  // const roleColor = (role: string) =>
  //   role === "super_admin"
  //     ? "bg-yellow-100 text-yellow-700"
  //     : "bg-gray-100 text-gray-600";

  return (
    <ProtectedRoute>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserCog size={24} />
            Super Admin Panel
          </h1>
          <p className="text-gray-400 text-sm">Manage all users and their roles</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddOpen(true)}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-80 transition"
            style={{ background: "#EEEDFE" }}
            title="Add User"
          >
            <Plus size={16} color="#534AB7" />
          </button>

          <button
            onClick={() => setShowDeleteAll(true)}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-80 transition"
            style={{ background: "#FAEEDA" }}
            title="Delete All Users"
          >
            <Trash2 size={16} color="#854F0B" />
          </button>

          <div className="bg-white rounded-xl px-4 py-2 shadow-sm text-sm text-gray-600">
            Total Users:{" "}
            <span className="font-bold text-gray-900">{data?.count ?? 0}</span>
          </div>
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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${user?.role === "super_admin" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className={`p-2 rounded-lg text-gray-400 ${user?.role !== "super_admin" && "hover:text-yellow-600  hover:bg-yellow-50"} transition`}
                        disabled={user?.role === "super_admin" ? true : false}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        disabled={user?.role === "super_admin" ? true : isDeleting && deletingId === user._id}
                        className={`p-2 rounded-lg  text-gray-400 ${user?.role !== "super_admin" && "hover:text-red-500 hover:bg-red-50"} transition disabled:opacity-50`}
                        
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

      {/* Add User Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New User"
        fields={addUserFields}
        onSubmit={(data) => addUser(data)}
        isLoading={isAdding}
        mode="add"
      />

      {/* Edit Modal — 3 tabs */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title="Edit User"
          subtitle={editingUser.name}
          fields={[]}
          onSubmit={() => { }}
          isLoading={isUpdating || isAssigningRole}
          mode="edit"
          initialValues={{
            name: editingUser.name,
            email: editingUser.email,
            role: editingUser.role,
            newPassword: "",
          }}
          tabs={[
            {
              key: "general",
              label: "General",
              fields: [
                { name: "name", label: "Name", type: "input", inputType: "text" },
                { name: "email", label: "Email", type: "input", inputType: "email", disabled: true },
              ],
              // ✅ mutation use karo — direct API nahi
              onSubmit: (data) => updateUser({
                id: editingUser._id,
                data: { name: data.name as string },
              }),
            },
            {
              key: "role",
              label: "Role",
              fields: [
                { name: "name", label: "Name", type: "input", inputType: "text", disabled: true },
                { name: "email", label: "Email", type: "input", inputType: "email", disabled: true },
                {
                  name: "role", label: "Role", type: "select",
                  options: [
                    { label: "User", value: "user" },
                    // { label: "Admin", value: "admin", disabled: authUser?.role === "super_admin" }, 
                    { label: "sales Manager", value: "sales_manager" },
                  ],
                },
              ],
              // ✅ mutation use karo
              onSubmit: (data) => assignRole({
                id: editingUser._id,
                role: data.role as string,
              }),
            },
            {
              key: "security",
              label: "Security",
              fields: [
                {
                  name: "newPassword",
                  label: "New Password",
                  type: "input",
                  inputType: "password",
                  placeholder: "Add new password",
                  autoComplete: "new-password"
                },
              ],
              onSubmit: (data) => changePassword({
                id: editingUser._id,
                password: data.newPassword as string,
              }),
            },
          ]}
        />
      )}

      {/* Delete All Danger Popup */}
      {showDeleteAll && (
        <Popup
          isOpen={showDeleteAll}
          onClose={() => setShowDeleteAll(false)}
          onConfirm={() => deleteAll()}
          variant="danger"
          title="Delete All Users"
          description={
            <>
              Are you sure you want to delete{" "}
              <span className="font-bold text-red-500">all users</span>?
              This will permanently remove every account from the system.
            </>
          }
          confirmText="Yes, Delete All"
          isLoading={isDeletingAll}
          loadingText="Deleting..."
        />
      )}

    </ProtectedRoute>
  );
}