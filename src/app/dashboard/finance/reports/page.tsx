"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRevenueReport, getMonthlyCollections, getPendingReport } from "@/utils/api";
import PageHeader from "@/app/component/dashboard/page-header";
import { TrendingUp } from "lucide-react";

function StatBox({ label, value, sub, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || "text-gray-800"}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function ReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: revenue, isLoading: loadingRevenue } = useQuery({
    queryKey: ["report-revenue"],
    queryFn: () => getRevenueReport().then((r) => r.data.data),
  });

  const { data: monthly, isLoading: loadingMonthly } = useQuery({
    queryKey: ["report-monthly", year],
    queryFn: () => getMonthlyCollections(year).then((r) => r.data.data),
  });

  const { data: pending, isLoading: loadingPending } = useQuery({
    queryKey: ["report-pending"],
    queryFn: () => getPendingReport().then((r) => r.data.data),
  });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const maxMonthly = Math.max(...(monthly || []).map((m: any) => m.totalCollected), 1);

  return (
    <>
      <PageHeader title="Financial Reports" subtitle="Revenue, collections & outstanding analysis" titleIcon={<TrendingUp size={24} />} />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatBox label="Total Revenue" value={`Rs ${(revenue?.summary?.totalRevenue || 0).toLocaleString()}`} color="text-teal-600" />
        <StatBox label="Total Collected" value={`Rs ${(revenue?.summary?.totalCollected || 0).toLocaleString()}`} color="text-green-600" />
        <StatBox label="Outstanding" value={`Rs ${(pending?.totalOutstanding || 0).toLocaleString()}`} sub={`${pending?.count || 0} invoices`} color="text-rose-500" />
        <StatBox label="Total Invoices" value={revenue?.summary?.totalInvoices || 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Monthly Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Monthly Collections</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setYear(y => y - 1)} className="w-7 h-7 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm">‹</button>
              <span className="text-sm font-medium text-gray-700 w-12 text-center">{year}</span>
              <button onClick={() => setYear(y => y + 1)} className="w-7 h-7 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm">›</button>
            </div>
          </div>

          {loadingMonthly ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {(monthly || []).map((d: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative">
                    <div className="hidden group-hover:block absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] rounded px-2 py-0.5 whitespace-nowrap z-10">
                      Rs {d.totalCollected.toLocaleString()}
                    </div>
                  </div>
                  <div
                    className="w-full bg-yellow-400 rounded-t transition-all duration-500 hover:bg-yellow-500"
                    style={{ height: `${Math.max((d.totalCollected / maxMonthly) * 140, d.totalCollected > 0 ? 6 : 2)}px`, minHeight: "2px" }}
                  />
                  <span className="text-[9px] text-gray-400">{months[i]}</span>
                  {d.paymentCount > 0 && <span className="text-[8px] text-gray-300">{d.paymentCount}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoice Status Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">By Status</h3>
          {loadingRevenue ? (
            <div className="text-sm text-gray-400">Loading...</div>
          ) : (
            <div className="space-y-4">
              {(revenue?.byStatus || []).map((s: any) => {
                const pct = revenue?.summary?.totalInvoices ? Math.round((s.count / revenue.summary.totalInvoices) * 100) : 0;
                return (
                  <div key={s._id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">{s._id}</span>
                      <span className="text-xs text-gray-400">{s.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-yellow-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Rs {(s.amount || 0).toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pending Invoices Table */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Outstanding Invoices</h3>
        {loadingPending ? (
          <div className="text-sm text-gray-400 py-6 text-center">Loading...</div>
        ) : pending?.invoices?.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No outstanding invoices 🎉</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-3 text-gray-500 font-medium">Student</th>
                  <th className="text-left pb-3 text-gray-500 font-medium">Program</th>
                  <th className="text-left pb-3 text-gray-500 font-medium">Total</th>
                  <th className="text-left pb-3 text-gray-500 font-medium">Remaining</th>
                  <th className="text-left pb-3 text-gray-500 font-medium">Due Date</th>
                  <th className="text-left pb-3 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pending?.invoices?.map((inv: any) => (
                  <tr key={inv._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3">
                      <p className="font-medium text-gray-800">{inv.user?.name || "—"}</p>
                      <p className="text-xs text-gray-400">{inv.user?.email}</p>
                    </td>
                    <td className="py-3 text-gray-600">{inv.enrollment?.program?.name || "—"}</td>
                    <td className="py-3 font-medium text-gray-800">Rs {(inv.totalAmount || 0).toLocaleString()}</td>
                    <td className="py-3 font-bold text-rose-500">Rs {(inv.remainingAmount || 0).toLocaleString()}</td>
                    <td className="py-3 text-gray-500">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        inv.status === "OVERDUE" ? "bg-rose-100 text-rose-700" : "bg-yellow-100 text-yellow-700"
                      }`}>{inv.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}