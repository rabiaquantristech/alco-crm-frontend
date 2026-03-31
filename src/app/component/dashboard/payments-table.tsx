import { Payment } from "@/types/dasboard";
import StatusBadge from "./status-badge";




export default function PaymentsTable({ data }: { data: Payment[] }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h2 className="font-semibold text-gray-800">Recent Payments</h2>
      <p className="text-gray-400 text-xs mb-4">
        Latest payment transactions
      </p>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 text-left border-b">
            <th className="pb-2">Student</th>
            <th className="pb-2">Amount</th>
            <th className="pb-2">Date</th>
            <th className="pb-2">Status</th>
          </tr>
        </thead>

        <tbody>
          {data.map((p, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="py-2 text-gray-700">{p.student}</td>
              <td className="py-2 text-gray-700 font-medium">
                {p.amount}
              </td>
              <td className="py-2 text-gray-500">{p.date}</td>
              <td className="py-2">
                <StatusBadge status={p.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}