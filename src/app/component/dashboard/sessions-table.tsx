import StatusBadge from "./status-badge";
import { Session } from "@/types/dasboard";


export default function SessionsTable({ data }: { data: Session[] }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h2 className="font-semibold text-gray-800">Upcoming Sessions</h2>
      <p className="text-gray-400 text-xs mb-4">
        Next scheduled training sessions
      </p>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 text-left border-b">
            <th className="pb-2">Student</th>
            <th className="pb-2">Program</th>
            <th className="pb-2">Date & Time</th>
            <th className="pb-2">Status</th>
          </tr>
        </thead>

        <tbody>
          {data.map((s, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="py-2 text-gray-700">{s.student}</td>
              <td className="py-2 text-gray-500">{s.program}</td>
              <td className="py-2 text-gray-500">{s.date}</td>
              <td className="py-2">
                <StatusBadge status={s.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}