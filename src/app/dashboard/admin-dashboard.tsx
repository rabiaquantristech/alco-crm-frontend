// "use client";
// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { adminGetAllUsers, adminUpdateUser, adminDeleteUser, adminDeleteAllUsers, adminCreateUser, adminAssignRole, adminUpdateUserPassword } from "@/utils/api";
// import { User, UsersResponse } from "@/types/apiType";
// import ProtectedRoute from "@/app/component/protected-route";
// import toast from "react-hot-toast";
// import { Pencil, Trash2, UserCog, Plus } from "lucide-react";
// import Modal from "../component/ui/model/modal";
// import { ModalField } from "@/types/ui";
// import Popup from "../component/ui/popup/popup";
// import PageHeader from "../component/dashboard/page-header";
// import DynamicTable from "../component/dashboard/dynamic-table";

// // Add fields
// const addUserFields: ModalField[] = [
//   { name: "name", label: "Name", type: "input", inputType: "text", placeholder: "Enter name" },
//   { name: "email", label: "Email", type: "input", inputType: "email", placeholder: "Enter email" },
//   { name: "password", label: "Password", type: "input", inputType: "password", placeholder: "Enter password" },
//   {
//     name: "role", label: "Role", type: "select",
//     options: [
//       { label: "User", value: "user" },
//       { label: "Sales Manager", value: "sales_manager" },
//       { label: "Sales Rep", value: "sales_rep" },
//       { label: "Support", value: "support" },
//       {label: "Instructor", value: "instructor"},
//       { label: "Finance Manager", value: "finance_manager" },
//     ]
//   },
// ];

// export default function AdminPage() {
//   const queryClient = useQueryClient();
//   const [editingUser, setEditingUser] = useState<User | null>(null);
//   const [deletingId, setDeletingId] = useState<string | null>(null);
//   const [isAddOpen, setIsAddOpen] = useState(false);
//   const [showDeleteAll, setShowDeleteAll] = useState(false);

//   // Fetch Users
//   const { data, isLoading, isError } = useQuery<UsersResponse>({
//     queryKey: ["admin-users"],
//     queryFn: () => adminGetAllUsers().then((res) => res.data),
//   });

//   // Add User
//   const { mutate: addUser, isPending: isAdding } = useMutation({
//     mutationFn: (data: any) => adminCreateUser(data),
//     onSuccess: () => {
//       toast.success("User created successfully! ✅");
//       setIsAddOpen(false);
//       queryClient.invalidateQueries({ queryKey: ["admin-users"] });
//     },
//     onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to create user!"),
//   });

//   // Update User — General + Security tab
//   const { mutate: updateUser, isPending: isUpdating } = useMutation({
//     mutationFn: ({ id, data }: { id: string; data: any }) => adminUpdateUser(id, data),
//     onSuccess: () => {
//       toast.success("User updated! ✅");
//       queryClient.invalidateQueries({ queryKey: ["admin-users"] });
//       setEditingUser(null);
//     },
//     onError: () => toast.error("Failed to update user!"),
//   });

//   // Change Password
//   const { mutate: changePassword, isPending: isChangingPassword } = useMutation({
//     mutationFn: ({ id, password }: { id: string; password: string }) =>
//       adminUpdateUserPassword(id, password),
//     onSuccess: () => {
//       toast.success("Password updated! 🔐");
//       queryClient.invalidateQueries({ queryKey: ["admin-users"] });
//       setEditingUser(null);
//     },
//     onError: () => toast.error("Failed to update password!"),
//   });

//   // ✅ Assign Role — Role tab
//   const { mutate: assignRole, isPending: isAssigningRole } = useMutation({
//     mutationFn: ({ id, role }: { id: string; role: string }) => adminAssignRole(id, role),
//     onSuccess: () => {
//       toast.success("Role updated! ✅");
//       queryClient.invalidateQueries({ queryKey: ["admin-users"] });
//       setEditingUser(null);
//     },
//     onError: () => toast.error("Failed to update role!"),
//   });

//   // Delete User
//   const { mutate: deleteUser, isPending: isDeleting } = useMutation({
//     mutationFn: (id: string) => adminDeleteUser(id),
//     onSuccess: () => {
//       toast.success("User deleted! 🗑️");
//       queryClient.invalidateQueries({ queryKey: ["admin-users"] });
//       setDeletingId(null);
//     },
//     onError: () => toast.error("Failed to delete user!"),
//   });

//   // Delete All
//   const { mutate: deleteAll, isPending: isDeletingAll } = useMutation({
//     mutationFn: () => adminDeleteAllUsers(),
//     onSuccess: () => {
//       toast.success("All users deleted!");
//       setShowDeleteAll(false);
//       queryClient.invalidateQueries({ queryKey: ["admin-users"] });
//     },
//     onError: () => toast.error("Failed to delete all users!"),
//   });

//   const handleDelete = (id: string) => {
//     setDeletingId(id);
//     deleteUser(id);
//   };



//   return (
//     <ProtectedRoute>
//       {/* Header */}
//       <PageHeader
//         title="Admin Panel"
//         subtitle="Manage all users and roles"
//         titleIcon={<UserCog size={24} />}
//         totalCount={data?.count ?? 0}
//         onAdd={() => setIsAddOpen(true)}
//         onDeleteAll={() => setShowDeleteAll(true)}
//       />

//       {/* Table */}
//       <DynamicTable
//         data={data?.users || []}
//         isLoading={isLoading}
//         isError={isError}
//         columns={[
//           {
//             key: "name",
//             label: "Name",
//             render: (user) => (
//               <div className="flex items-center gap-3">
//                 <div className="w-8 h-8 rounded-full flex items-center justify-center text-black font-bold text-xs"
//                   style={{
//                     background: user?.avatarColor,
//                     backdropFilter: "blur(10px)",
//                     opacity: 0.8,
//                   }}>
//                   {user.name?.charAt(0)?.toUpperCase()}
//                 </div>
//                 <span className="font-medium text-gray-800">
//                   {user.name}
//                 </span>
//               </div>
//             ),
//           },

//           {
//             key: "email",
//             label: "Email",
//             render: (user) => (
//               <span className="text-gray-500">
//                 {user.email}
//               </span>
//             ),
//           },

//           {
//             key: "role",
//             label: "Role",
//             render: (user) => {
//               const roleColor = (role: string) => {
//                 switch (role) {
//                   case "super_admin":
//                     return "bg-yellow-100 text-yellow-700";

//                   case "admin":
//                     return "bg-blue-100 text-blue-700";

//                   case "sales_manager":
//                     return "bg-indigo-100 text-indigo-700";

//                   case "sales_rep":
//                     return "bg-teal-100 text-teal-700";

//                   case "support":
//                     return "bg-pink-100 text-pink-700";

//                   case "user":
//                     return "bg-gray-100 text-gray-600";

//                   default:
//                     return "bg-gray-100 text-gray-600";
//                 }
//               };

//               return (
//                 <span
//                   className={`px-3 py-1 rounded-full text-xs font-medium ${roleColor(user?.role)}`}
//                 >
//                   {user.role}
//                 </span>
//               );
//             },
//           },

//           {
//             key: "createdAt",
//             label: "Joined",
//             render: (user) => (
//               <span className="text-gray-500">
//                 {new Date(user.createdAt).toLocaleDateString()}
//               </span>
//             ),
//           },
//         ]}
//         actions={[
//           {
//             icon: <Pencil size={14} />,
//             label: "Edit",
//             onClick: (user) => setEditingUser(user),
//             disabled: (user: User) => user.role === "admin",
//             className: "hover:bg-blue-50 hover:text-blue-500",
//           },
//           {
//             icon: <Trash2 size={14} />,
//             label: "Delete",
//             onClick: (user) => handleDelete(user._id),
//             disabled: (user: User) => user.role === "admin",
//             className: "hover:bg-red-50 hover:text-red-500",
//           },
//         ]}
//       />

//       {/* Add User Modal */}
//       <Modal
//         isOpen={isAddOpen}
//         onClose={() => setIsAddOpen(false)}
//         title="Add New User"
//         fields={addUserFields}
//         onSubmit={(data) => addUser(data)}
//         isLoading={isAdding}
//         mode="add"
//       />

//       {/* Edit Modal — 3 tabs */}
//       {editingUser && (
//         <Modal
//           isOpen={!!editingUser}
//           onClose={() => setEditingUser(null)}
//           title="Edit User"
//           subtitle={editingUser.name}
//           fields={[]}
//           onSubmit={() => { }}
//           isLoading={isUpdating || isAssigningRole}
//           mode="edit"
//           initialValues={{
//             name: editingUser.name,
//             email: editingUser.email,
//             role: editingUser.role,
//             newPassword: "",
//           }}
//           tabs={[
//             {
//               key: "general",
//               label: "General",
//               fields: [
//                 { name: "name", label: "Name", type: "input", inputType: "text" },
//                 { name: "email", label: "Email", type: "input", inputType: "email", disabled: true },
//               ],
//               // ✅ mutation use karo — direct API nahi
//               onSubmit: (data) => updateUser({
//                 id: editingUser._id,
//                 data: { name: data.name as string },
//               }),
//             },
//             {
//               key: "role",
//               label: "Role",
//               fields: [
//                 { name: "name", label: "Name", type: "input", inputType: "text", disabled: true },
//                 { name: "email", label: "Email", type: "input", inputType: "email", disabled: true },
//                 {
//                   name: "role", label: "Role", type: "select",
//                   options: [
//                     { label: "Sales Manager", value: "sales_manager" },
//                     { label: "Sales Rep", value: "sales_rep" },
//                     { label: "Support", value: "support" },
//                     { label: "User", value: "user" },
//                     {label: "Instructor", value: "instructor"},
//                     { label: "Finance Manager", value: "finance_manager" },
//                   ],
//                 },
//               ],
//               // ✅ mutation use karo
//               onSubmit: (data) => assignRole({
//                 id: editingUser._id,
//                 role: data.role as string,
//               }),
//             },
//             {
//               key: "security",
//               label: "Security",
//               fields: [
//                 {
//                   name: "newPassword",
//                   label: "New Password",
//                   type: "input",
//                   inputType: "password",
//                   placeholder: "Add new password",
//                   autoComplete: "new-password"
//                 },
//               ],
//               onSubmit: (data) => changePassword({
//                 id: editingUser._id,
//                 password: data.newPassword as string,
//               }),
//             },
//           ]}
//         />
//       )}

//       {/* Delete All Danger Popup */}
//       {showDeleteAll && (
//         <Popup
//           isOpen={showDeleteAll}
//           onClose={() => setShowDeleteAll(false)}
//           onConfirm={() => deleteAll()}
//           variant="danger"
//           title="Delete All Users"
//           description={
//             <>
//               Are you sure you want to delete{" "}
//               <span className="font-bold text-red-500">all users</span>?
//               This will permanently remove every account from the system.
//             </>
//           }
//           confirmText="Yes, Delete All"
//           isLoading={isDeletingAll}
//           loadingText="Deleting..."
//         />
//       )}

//     </ProtectedRoute>
//   );
// }


"use client";

import {
  Users, TrendingUp, Calendar,
  UserCog,
} from "lucide-react";
import { StatCard } from "../component/dashboard/stat-card";
import LeadPipeline from "../component/dashboard/lead-pipeline";
import QuickStats from "../component/dashboard/quick-stats";
import SessionsTable from "../component/dashboard/sessions-table";
import PageHeader from "../component/dashboard/page-header";


const stats = [
  {
    title: "Assigned Leads",
    value: "120",
    change: "+10%",
    icon: Users,
    bg: "bg-gray-800",
    text: "text-white",
  },
  {
    title: "Conversions",
    value: "38",
    change: "+8%",
    icon: TrendingUp,
    bg: "bg-yellow-400",
    text: "text-gray-900",
  },
  {
    title: "Today's Sessions",
    value: "6",
    change: "+2",
    icon: Calendar,
    bg: "bg-blue-600",
    text: "text-white",
  },
];

const pipeline = [
  { label: "New Leads", count: 30, color: "bg-gray-800" },
  { label: "Contacted", count: 22, color: "bg-yellow-400" },
  { label: "Qualified", count: 15, color: "bg-yellow-400" },
  { label: "Closed", count: 10, color: "bg-yellow-400" },
];

const sessions = [
  {
    student: "Ali Khan",
    program: "NLP",
    date: "Mar 5, 2026 at 2:00 PM",
    status: "scheduled",
  },
  {
    student: "Sara Ahmed",
    program: "Coaching",
    date: "Mar 5, 2026 at 4:00 PM",
    status: "scheduled",
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <PageHeader
        title="Admin Dashboard"
        subtitle="Overview of platform performance and user activity"
        titleIcon={<UserCog size={24} />}
      // totalCount={data?.count ?? 0}
      // onAdd={() => setIsAddOpen(true)}
      // onDeleteAll={() => setShowDeleteAll(true)}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Pipeline */}
      {/* <LeadPipeline data={pipeline} /> */}

      {/* Quick Stats */}
      {/* <QuickStats
        data={[
          { label: "Conversion Rate", value: "32%", color: "text-green-600" },
          { label: "Follow-ups Today", value: "12", color: "text-blue-600" },
        ]}
      /> */}

      {/* Sessions */}
      {/* <SessionsTable data={sessions} /> */}

    </div>
  );
}