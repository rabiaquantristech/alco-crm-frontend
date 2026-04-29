// components/ui/InstallmentPaymentModal.tsx
"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markInstallmentPaid } from "@/utils/api";
import toast from "react-hot-toast";
import { X, CheckCircle2, Clock, AlertCircle, ChevronRight, Zap } from "lucide-react";

interface Installment {
  _id: string;
  label: string;
  amount: number;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  isAdvance: boolean;
  paidAmount?: number;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  installments: Installment[];
  user?: { name: string; email: string };
}

interface Props {
  invoice: Invoice | null;
  onClose: () => void;
}

const formatDate = (d: string) =>
  d
    ? new Date(d).toLocaleDateString("en-PK", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const formatAmt = (n: number) => Number(n || 0).toLocaleString("en-PK");

export default function InstallmentPaymentModal({ invoice, onClose }: Props) {
  const queryClient = useQueryClient();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const { mutate: payInstallment, isPending } = useMutation({
    mutationFn: ({ installmentId }: { installmentId: string }) =>
      markInstallmentPaid(invoice!._id, installmentId),
    onSuccess: (res) => {
      const msg = res.data?.message || "Installment marked as paid!";
      toast.success(msg);
      setConfirmingId(null);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["my-invoices"] });
      // Close if fully paid
      if (res.data?.data?.status === "PAID") onClose();
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Failed to mark installment!"),
  });

  if (!invoice) return null;

  const paidCount     = invoice.installments.filter((i) => i.status === "PAID").length;
  const totalCount    = invoice.installments.length;
  const progressPct   = Math.round((paidCount / totalCount) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase mb-1">
                Payment Schedule
              </p>
              <h2 className="text-white text-lg font-bold leading-tight">
                {invoice.invoiceNumber}
              </h2>
              {invoice.user && (
                <p className="text-slate-300 text-sm mt-0.5">
                  {invoice.user.name}
                  <span className="text-slate-500 mx-1.5">·</span>
                  <span className="text-slate-400 text-xs">{invoice.user.email}</span>
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-slate-400 text-xs">
                {paidCount} of {totalCount} installments paid
              </span>
              <span className="text-slate-300 text-xs font-semibold">{progressPct}%</span>
            </div>
            <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Summary Strip */}
        <div className="grid grid-cols-3 border-b border-slate-100">
          <div className="px-5 py-3 border-r border-slate-100">
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Total</p>
            <p className="text-slate-800 text-sm font-bold">Rs {formatAmt(invoice.totalAmount)}</p>
          </div>
          <div className="px-5 py-3 border-r border-slate-100">
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Paid</p>
            <p className="text-emerald-600 text-sm font-bold">Rs {formatAmt(invoice.paidAmount)}</p>
          </div>
          <div className="px-5 py-3">
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Remaining</p>
            <p className={`text-sm font-bold ${invoice.remainingAmount > 0 ? "text-rose-500" : "text-emerald-600"}`}>
              Rs {formatAmt(invoice.remainingAmount)}
            </p>
          </div>
        </div>

        {/* Installments List */}
        <div className="px-4 py-3 max-h-[340px] overflow-y-auto">
          <div className="space-y-2">
            {invoice.installments.map((inst, idx) => {
              const isPaid      = inst.status === "PAID";
              const isConfirming = confirmingId === inst._id;

              return (
                <div
                  key={inst._id}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isPaid
                      ? "border-emerald-100 bg-emerald-50/60"
                      : isConfirming
                        ? "border-amber-200 bg-amber-50"
                        : inst.isAdvance
                          ? "border-amber-100 bg-amber-50/40 hover:border-amber-200"
                          : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    {/* Index / Status Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isPaid
                        ? "bg-emerald-100"
                        : inst.isAdvance
                          ? "bg-amber-100"
                          : "bg-slate-100"
                    }`}>
                      {isPaid ? (
                        <CheckCircle2 size={16} className="text-emerald-600" />
                      ) : inst.isAdvance ? (
                        <Zap size={15} className="text-amber-600" />
                      ) : (
                        <Clock size={14} className="text-slate-400" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-semibold ${isPaid ? "text-slate-500" : "text-slate-800"}`}>
                          {inst.isAdvance ? "Advance Payment" : inst.label || `Installment ${idx + 1}`}
                        </span>
                        {inst.isAdvance && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                            Advance
                          </span>
                        )}
                        {isPaid && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full">
                            Paid
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-slate-400">
                          Due: {formatDate(inst.dueDate)}
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          Rs {formatAmt(inst.amount)}
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    {!isPaid && (
                      <div className="flex-shrink-0">
                        {!isConfirming ? (
                          <button
                            onClick={() => setConfirmingId(inst._id)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                              inst.isAdvance
                                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            Mark Paid
                            <ChevronRight size={12} />
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setConfirmingId(null)}
                              className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => payInstallment({ installmentId: inst._id })}
                              disabled={isPending}
                              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all disabled:opacity-60 flex items-center gap-1"
                            >
                              {isPending ? (
                                <span className="flex items-center gap-1">
                                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Processing
                                </span>
                              ) : (
                                <>
                                  <CheckCircle2 size={12} />
                                  Confirm
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Confirm Warning Strip */}
                  {isConfirming && (
                    <div className="px-4 pb-3 flex items-start gap-2">
                      <AlertCircle size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-700">
                        Mark <strong>Rs {formatAmt(inst.amount)}</strong> as paid?
                        {inst.isAdvance && (
                          <span className="block text-amber-600 mt-0.5">
                            This will activate the student enrollment.
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}