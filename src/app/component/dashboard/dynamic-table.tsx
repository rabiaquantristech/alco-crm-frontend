import { UserRole } from "@/types/apiType";
import { Pencil, Trash2 } from "lucide-react";

type Column = {
  key: string;
  label: string;
  render?: (item: any, index: number) => React.ReactNode;
};
type Action = {
  icon: React.ReactNode;
  onClick: (item: any) => void;
  show?: (item: any) => boolean;
  className?: string;
};

type Props = {
  data: any[];
  isLoading: boolean;
  isError: boolean;
  columns: Column[];
  actions?: Action[];
}

export default function DynamicTable({
  data,
  isLoading,
  isError,
  columns,
  actions = [],
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-red-500">
          Failed to load data.
        </div>
      ) : (
        <table className="w-full text-sm">
          
          {/* HEADER */}
          <thead className="bg-gray-50 border-b">
            <tr className="text-gray-400 text-left">
              <th className="px-6 py-4 font-medium">#</th>

              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 font-medium">
                  {col.label}
                </th>
              ))}

              {actions.length > 0 && (
                <th className="px-6 py-4 font-medium">Actions</th>
              )}
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {data?.map((item, index) => (
              <tr
                key={item._id || index}
                className="border-b last:border-0 hover:bg-gray-50 transition"
              >
                {/* Index */}
                <td className="px-6 py-4 text-gray-400">
                  {index + 1}
                </td>

                {/* Dynamic Columns */}
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4">
                    {col.render
                      ? col.render(item, index)
                      : item[col.key] || "—"}
                  </td>
                ))}

                {/* Actions */}
                {actions.length > 0 && (
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {actions.map((action, i) => {
                        if (action.show && !action.show(item)) return null;

                        return (
                          <button
                            key={i}
                            onClick={() => action.onClick(item)}
                            className={`p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition ${action.className}`}
                          >
                            {action.icon}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                )}
              </tr>
            ))}

            {/* Empty */}
            {data?.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="text-center py-16 text-gray-400"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}