import { UserRole } from "@/types/apiType";
import { Pencil, Trash2 } from "lucide-react";

type User = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

type Props = {
  users: User[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  deletingId?: string | null;
  isDeleting?: boolean;
  disableRole?: string; // "super_admin" | "admin"
};

export default function UsersTable({
  users,
  isLoading,
  isError,
  onEdit,
  onDelete,
  deletingId,
  isDeleting,
  disableRole = "super_admin",
}: Props) {
  const roleColor = (role: string) => {
    if (role === "super_admin")
      return "bg-yellow-100 text-yellow-700";
    if (role === "admin")
      return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-600";
  };

  return (
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
            {users?.map((user, index) => {
              const isDisabled = user.role === disableRole;

              return (
                <tr
                  key={user._id}
                  className="border-b last:border-0 hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 text-gray-400">{index + 1}</td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">
                        {user.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-gray-500">{user.email}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${roleColor(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(user)}
                        disabled={isDisabled}
                        className={`p-2 rounded-lg text-gray-400 ${
                          !isDisabled &&
                          "hover:text-yellow-600 hover:bg-yellow-50"
                        } transition`}
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        onClick={() => onDelete(user._id)}
                        disabled={
                          isDisabled ||
                          (isDeleting && deletingId === user._id)
                        }
                        className={`p-2 rounded-lg text-gray-400 ${
                          !isDisabled &&
                          "hover:text-red-500 hover:bg-red-50"
                        } transition disabled:opacity-50`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}