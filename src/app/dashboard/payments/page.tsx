"use client";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks";
import ProtectedRoute from "@/app/component/protected-route";
import PageHeader from "@/app/component/dashboard/page-header";
import { CreditCard, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { getMyInvoices } from "@/utils/api";

// ── API ───────────────────────────────────────────────────────


// ── Helpers ───────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PAID:    { label: "Paid",     color: "bg-green-100 text-green-700",  icon: CheckCircle  },
  PARTIAL: { label: "Partial",  color: "bg-yellow-100 text-yellow-700", icon: Clock       },
  PENDING: { label: "Pending",  color: "bg-sky-100 text-sky-700",      icon: Clock        },
  OVERDUE: { label: "Overdue",  color: "bg-rose-100 text-rose-700",    icon: AlertCircle  },
  EXTENDED:{ label: "Extended", color: "bg-indigo-100 text-indigo-700", icon: Clock       },
  BLOCKED: { label: "Blocked",  color: "bg-gray-100 text-gray-600",    icon: AlertCircle  },
};

const installmentStatus: Record<string, string> = {
  PAID:    "bg-green-100 text-green-700",
  PENDING: "bg-sky-100 text-sky-700",
  OVERDUE: "bg-rose-100 text-rose-700",
};

function fmt(n: number) {
  return `Rs ${(n || 0).toLocaleString()}`;
}

function daysLeft(date: string) {
  const diff = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { text: `${Math.abs(diff)} days overdue`, overdue: true };
  if (diff === 0) return { text: "Due today", overdue: true };
  return { text: `${diff} days left`, overdue: false };
}

// ── Invoice Card ──────────────────────────────────────────────
function InvoiceCard({ invoice }: { invoice: any }) {
  const [open, setOpen] = useState(false);

  const cfg      = statusConfig[invoice.status] || statusConfig.PENDING;
  const Icon     = cfg.icon;
  const paid     = invoice.paidAmount || 0;
  const total    = invoice.totalAmount || 0;
  const remaining = invoice.remainingAmount || 0;
  const pct      = total > 0 ? Math.round((paid / total) * 100) : 0;
  const due      = invoice.dueDate ? daysLeft(invoice.dueDate) : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── Card Header ── */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="font-semibold text-gray-800 text-base">
              {invoice.enrollment?.program?.name || "Program"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Invoice #{invoice._id?.slice(-6).toUpperCase()}
              {invoice.dueDate && ` · Due: ${new Date(invoice.dueDate).toLocaleDateString()}`}
            </p>
            {due && (
              <p className={`text-xs font-medium mt-1 ${due.overdue ? "text-rose-500" : "text-gray-400"}`}>
                {due.text}
              </p>
            )}
          </div>
          <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full shrink-0 ${cfg.color}`}>
            <Icon size={12} />
            {cfg.label}
          </span>
        </div>

        {/* Amount row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Total</p>
            <p className="font-bold text-gray-800 text-sm">{fmt(total)}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Paid</p>
            <p className="font-bold text-green-600 text-sm">{fmt(paid)}</p>
          </div>
          <div className={`rounded-xl p-3 text-center ${remaining > 0 ? "bg-rose-50" : "bg-gray-50"}`}>
            <p className="text-xs text-gray-400 mb-1">Remaining</p>
            <p className={`font-bold text-sm ${remaining > 0 ? "text-rose-500" : "text-gray-400"}`}>
              {fmt(remaining)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-1">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Payment progress</span>
            <span className="font-medium text-gray-600">{pct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${
                pct >= 100 ? "bg-green-400" : pct > 0 ? "bg-yellow-400" : "bg-gray-200"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Installments toggle */}
        {invoice.installments?.length > 0 && (
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1.5 text-xs text-yellow-700 font-medium mt-3 hover:text-yellow-800 transition-colors"
          >
            {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {open ? "Hide" : "Show"} installments ({invoice.installments.length})
          </button>
        )}
      </div>

      {/* ── Installments ── */}
      {open && invoice.installments?.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="px-5 py-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Installment Plan
            </p>
            <div className="space-y-2">
              {invoice.installments.map((inst: any, idx: number) => {
                const instDue = inst.dueDate ? daysLeft(inst.dueDate) : null;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      inst.status === "PAID"
                        ? "bg-green-50 border-green-100"
                        : inst.status === "OVERDUE"
                        ? "bg-rose-50 border-rose-100"
                        : "bg-white border-gray-100"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Installment {idx + 1}
                      </p>
                      <p className="text-xs text-gray-400">
                        {inst.dueDate
                          ? new Date(inst.dueDate).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </p>
                      {instDue && inst.status !== "PAID" && (
                        <p className={`text-[11px] font-medium mt-0.5 ${instDue.overdue ? "text-rose-500" : "text-gray-400"}`}>
                          {instDue.text}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800 mb-1">{fmt(inst.amount)}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${installmentStatus[inst.status] || "bg-gray-100 text-gray-500"}`}>
                        {inst.status === "PAID" ? "✓ Paid" : inst.status === "OVERDUE" ? "Overdue" : "Pending"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Payment History ── */}
      {invoice.payments?.length > 0 && (
        <div className="border-t border-gray-100 px-5 py-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Payment History
          </p>
          <div className="space-y-2">
            {invoice.payments.map((p: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                  <div>
                    <p className="text-gray-700 font-medium capitalize">{p.method}</p>
                    <p className="text-xs text-gray-400">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                      {p.referenceNumber ? ` · Ref: ${p.referenceNumber}` : ""}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-green-600">{fmt(p.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notice */}
      {invoice.status !== "PAID" && (
        <div className="px-5 pb-4">
          <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2.5 text-center">
            💡 Payment karne ke liye apne finance manager se rabta karein
          </p>
        </div>
      )}
    </div>
  );
}

// ── Summary Stats ─────────────────────────────────────────────
function SummaryStats({ invoices }: { invoices: any[] }) {
  const total     = invoices.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const paid      = invoices.reduce((s, i) => s + (i.paidAmount  || 0), 0);
  const remaining = invoices.reduce((s, i) => s + (i.remainingAmount || 0), 0);
  const overdue   = invoices.filter((i) => i.status === "OVERDUE").length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {[
        { label: "Total Amount",   value: fmt(total),     color: "text-gray-800",  bg: "bg-gray-50"   },
        { label: "Total Paid",     value: fmt(paid),      color: "text-green-600", bg: "bg-green-50"  },
        { label: "Remaining",      value: fmt(remaining), color: "text-rose-500",  bg: "bg-rose-50"   },
        { label: "Overdue",        value: `${overdue} invoice${overdue !== 1 ? "s" : ""}`, color: overdue > 0 ? "text-rose-500" : "text-gray-400", bg: overdue > 0 ? "bg-rose-50" : "bg-gray-50" },
      ].map((s) => (
        <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
          <p className="text-xs text-gray-400 mb-1">{s.label}</p>
          <p className={`font-bold text-base ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
function PaymentsContent() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-invoices"],
    queryFn:  getMyInvoices,
  });

  const invoices = data?.data || [];
  // const active   = invoices.filter((i: any) => i.status !== "PAID");
  // const paid     = invoices.filter((i: any) => i.status === "PAID");

  return (
    <>
      <PageHeader
        title="My Payments"
        subtitle="Apni invoices aur payment history dekhein"
        titleIcon={<CreditCard size={24} />}
        totalCount={invoices.length}
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading payments...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-rose-500 text-sm">Failed to load payments</div>
      ) : !invoices.length ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-yellow-50 flex items-center justify-center">
            <CreditCard size={28} className="text-yellow-400" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-700">Koi invoice nahi mili</p>
            <p className="text-sm text-gray-400 mt-1">Finance manager se rabta karein</p>
          </div>
        </div>
      ) : (
        <>
          <SummaryStats invoices={invoices} />

          {/* Active / Pending invoices */}
          {/* {active.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock size={14} />
                Pending ({active.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {active.map((inv: any) => <InvoiceCard key={inv._id} invoice={inv} />)}
              </div>
            </div>
          )} */}

          {/* Paid invoices */}
          {/* {paid.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle size={14} />
                Paid ({paid.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {paid.map((inv: any) => <InvoiceCard key={inv._id} invoice={inv} />)}
              </div>
            </div>
          )} */}
        </>
      )}
    </>
  );
}

export default function PaymentsPage() {
  return (
    <ProtectedRoute allowedRoles={["user", "admin", "super_admin", "finance_manager"]}>
      <PaymentsContent />
    </ProtectedRoute>
  );
}