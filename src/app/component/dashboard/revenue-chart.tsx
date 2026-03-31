import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

export default function RevenueChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h2 className="font-semibold text-gray-800 mb-4">Revenue Overview</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="revenue" fill="#FACC15" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}