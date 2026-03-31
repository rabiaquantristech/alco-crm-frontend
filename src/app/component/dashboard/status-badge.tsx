import { StatusBadgeProps } from "@/types/dasboard";


export default function StatusBadge({ status }: StatusBadgeProps) {
  const getColor = () => {
    switch (status) {
      case "paid": return "text-green-600 bg-green-100";
      case "pending": return "text-yellow-600 bg-yellow-100";
      case "failed": return "text-red-600 bg-red-100";
      case "scheduled": return "text-blue-600 bg-blue-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColor()}`}>
      {status}
    </span>
  );
}