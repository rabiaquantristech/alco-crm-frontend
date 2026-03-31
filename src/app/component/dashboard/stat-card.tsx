import { StatCardProps } from "@/types/dasboard";


export default function StatCard({ title, value, change, icon: Icon, bg, text }: StatCardProps) {
  return (
    <div className={`${bg} ${text} rounded-xl p-5 shadow-sm`}>
      <div className="flex justify-between items-start">
        <p className="text-sm opacity-80">{title}</p>
        <Icon size={18} className="opacity-70" />
      </div>
      <p className="text-3xl font-bold mt-2">{value}</p>
      <p className="text-xs opacity-70 mt-1">{change}</p>
    </div>
  );
}