import { Stat } from "@/types/dasboard";


export default function QuickStats({ data }: { data: Stat[] }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm space-y-3">
      <h2 className="font-semibold text-gray-800">Quick Stats</h2>
      <p className="text-gray-400 text-xs">Key metrics at a glance</p>

      {data.map((item) => (
        <div key={item.label} className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">{item.label}</p>
          <p className={`text-xl font-bold ${item.color}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}