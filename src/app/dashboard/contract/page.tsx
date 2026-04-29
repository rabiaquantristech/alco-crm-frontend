"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyLeadContract, submitLeadContract } from "@/utils/api";
import toast from "react-hot-toast";
import { FileText, CheckCircle, PenLine, Type, RotateCcw, Loader2, Lock, Clock } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import PageHeader from "@/app/component/dashboard/page-header";
import ContractPDFGenerator from "@/app/component/dashboard/contract-pdf-generator";

// ── Signature Canvas ─────────────────────────────────────────
function SignatureCanvas({ onSave }: { onSave: (data: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setIsEmpty(false);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1a1a2e";
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = () => setIsDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;
    onSave(canvas.toDataURL("image/png"));
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={460}
        height={140}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
        className="w-full border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 cursor-crosshair touch-none"
        style={{ height: 140 }}
      />
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={clear}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          <RotateCcw size={11} /> Clear
        </button>
        <button
          type="button"
          onClick={save}
          disabled={isEmpty}
          className="flex items-center gap-1.5 text-xs text-teal-600 font-semibold px-3 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-50 disabled:opacity-40"
        >
          <CheckCircle size={11} /> Use This Signature
        </button>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────
export default function MyContractPage() {
  const queryClient = useQueryClient();
  const { user: authUser } = useAppSelector((state) => state.auth);

  const { data, isLoading } = useQuery({
    queryKey: ["my-contract"],
    queryFn: () => getMyLeadContract().then((r) => r.data),
  });

  const lead = data?.data;
  const contract = lead?.contractDetails;
  const paymentPlan = lead?.paymentPlan;
  const alreadySigned = contract?.status === "signed";

  console.log("Contract Data:", { contract });

  const [form, setForm] = useState({
    fatherHusbandName: "",
    cnic: "",
    bankAccountNumber: "",
    currentAddress: "",
    emergencyContactName: "",
    occupation: "",
    participationAgreement: false,
    photoVideoRelease: false,
  });

  const [signatureType, setSignatureType] = useState<"draw" | "type">("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [drawnSignature, setDrawnSignature] = useState("");
  const [signatureSaved, setSignatureSaved] = useState(false);

  // Pre-fill from existing contractDetails
  useEffect(() => {
    if (contract) {
      setForm({
        fatherHusbandName: contract.fatherHusbandName || "",
        cnic: contract.cnic || "",
        bankAccountNumber: contract.bankAccountNumber || "",
        currentAddress: contract.currentAddress || "",
        emergencyContactName: contract.emergencyContactName || "",
        occupation: contract.occupation || "",
        participationAgreement: contract.participationAgreement || false,
        photoVideoRelease: contract.photoVideoRelease || false,
      });
    }
  }, [contract]);

  const { mutate: submitContract, isPending: isSubmitting } = useMutation({
    mutationFn: (data: any) => submitLeadContract(lead._id, data),
    onSuccess: () => {
      toast.success("Contract submitted successfully! ✅");
      queryClient.invalidateQueries({ queryKey: ["my-contract"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to submit!"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.participationAgreement || !form.photoVideoRelease) {
      toast.error("Please agree to both agreements");
      return;
    }
    const signatureData = signatureType === "type" ? typedSignature : drawnSignature;
    if (!signatureData) {
      toast.error("Please provide your signature");
      return;
    }
    submitContract({
      ...form,
      signatureType,
      signatureData,
    });
  };

  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const formatAmount = (n: number) => `Rs ${Number(n || 0).toLocaleString("en-PK")}`;

  // ── Loading ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-yellow-400" />
      </div>
    );
  }

  // ── No contract ──────────────────────────────────────────────
  if (!lead || !contract) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Contract" subtitle="Your enrollment agreement" titleIcon={<FileText size={24} />} />
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <Clock size={24} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-600">No Contract Yet</p>
          <p className="text-sm text-gray-400 text-center max-w-sm">
            Your contract will appear here once your application has been shortlisted. Please wait for our team to contact you.
          </p>
        </div>
      </div>
    );
  }

  // ── Already Signed ───────────────────────────────────────────
  if (alreadySigned) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Contract" subtitle="Your enrollment agreement" titleIcon={<FileText size={24} />} />
        <div className="max-w-5xl ">
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 text-center">
            <CheckCircle size={36} className="text-teal-500 mx-auto mb-3" />
            <p className="font-semibold text-teal-700 text-lg">Contract Signed ✅</p>
            <p className="text-sm text-teal-600 mt-1">
              Signed on {formatDate(contract.signedAt)} — Our team will contact you soon regarding payment.
            </p>
          </div>

          {/* Payment Plan view */}
          {paymentPlan && (
            <div className="mt-6 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 text-sm">Your Payment Plan</h3>
                <p className="text-xs text-gray-400 mt-0.5">Total: {formatAmount(paymentPlan.totalAmount)}</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 text-left">#</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 text-left">Description</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 text-left">Due Date</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-50 bg-amber-50/40">
                    <td className="px-5 py-3 text-xs font-mono text-gray-400">00</td>
                    <td className="px-5 py-3 font-medium text-gray-700">
                      Advance Payment
                      <span className="ml-2 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase">Advance</span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs font-mono">{formatDate(paymentPlan.advanceDueDate)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-xs font-mono">{formatAmount(paymentPlan.advanceAmount)}</td>
                  </tr>
                  {paymentPlan.installments?.map((inst: any, idx: number) => (
                    <tr key={idx} className="border-t border-gray-50">
                      <td className="px-5 py-3 text-xs font-mono text-gray-400">{String(idx + 1).padStart(2, "0")}</td>
                      <td className="px-5 py-3 font-medium text-gray-700">{inst.label}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs font-mono">{formatDate(inst.dueDate)}</td>
                      <td className="px-5 py-3 text-right font-semibold text-xs font-mono">{formatAmount(inst.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Contract Form ────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Contract"
        subtitle="Please fill in your details and sign the agreement"
        titleIcon={<FileText size={24} />}
      />

      <div className="max-w-5xl space-y-5">

        {/* Payment Plan Preview */}
        {paymentPlan && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-3">Your Payment Plan</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white rounded-xl py-3 px-2">
                <p className="text-xs text-gray-400 mb-1">Total Fee</p>
                <p className="font-bold text-gray-800 text-sm">{formatAmount(paymentPlan.totalAmount)}</p>
              </div>
              <div className="bg-white rounded-xl py-3 px-2">
                <p className="text-xs text-gray-400 mb-1">Advance</p>
                <p className="font-bold text-amber-600 text-sm">{formatAmount(paymentPlan.advanceAmount)}</p>
              </div>
              <div className="bg-white rounded-xl py-3 px-2">
                <p className="text-xs text-gray-400 mb-1">Installments</p>
                <p className="font-bold text-gray-800 text-sm">{paymentPlan.installments?.length || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* No Payment Plan yet */}
        {!paymentPlan && (
          <div className="bg-sky-50 border border-sky-200 rounded-2xl px-5 py-4 flex items-center gap-3">
            <Clock size={18} className="text-sky-500 shrink-0" />
            <p className="text-sm text-sky-700">
              Your payment plan is being prepared. You can still fill in your details now.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Section 1: Auto-filled Info ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Program Information</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Full Name</label>
                <p className="text-sm font-medium text-gray-800 bg-gray-50 rounded-lg px-3 py-2">{lead.fullName || authUser?.name || "—"}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Email</label>
                <p className="text-sm font-medium text-gray-800 bg-gray-50 rounded-lg px-3 py-2">{lead.email || authUser?.email || "—"}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Phone</label>
                <p className="text-sm font-medium text-gray-800 bg-gray-50 rounded-lg px-3 py-2">{lead.phone || "—"}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Program</label>
                <p className="text-sm font-medium text-gray-800 bg-gray-50 rounded-lg px-3 py-2">{lead.program_id?.name || contract.programName || "—"}</p>
              </div>
            </div>
          </div>

          {/* ── Section 2: User fills ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Personal Details</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Father / Husband Name <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  value={form.fatherHusbandName}
                  onChange={(e) => setForm((p) => ({ ...p, fatherHusbandName: e.target.value }))}
                  placeholder="Enter name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">CNIC Number <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  value={form.cnic}
                  onChange={(e) => setForm((p) => ({ ...p, cnic: e.target.value }))}
                  placeholder="XXXXX-XXXXXXX-X"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Current Address <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  value={form.currentAddress}
                  onChange={(e) => setForm((p) => ({ ...p, currentAddress: e.target.value }))}
                  placeholder="Enter your full address"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Bank Account Number</label>
                <input
                  type="text"
                  value={form.bankAccountNumber}
                  onChange={(e) => setForm((p) => ({ ...p, bankAccountNumber: e.target.value }))}
                  placeholder="Account number"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Emergency Contact <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  value={form.emergencyContactName}
                  onChange={(e) => setForm((p) => ({ ...p, emergencyContactName: e.target.value }))}
                  placeholder="Name (next to kin)"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Occupation / Company</label>
                <input
                  type="text"
                  value={form.occupation}
                  onChange={(e) => setForm((p) => ({ ...p, occupation: e.target.value }))}
                  placeholder="e.g. Software Engineer at XYZ, Student at ABC"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* ── Section 3: Agreements ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Agreements</p>
            <div className="space-y-4">

              {/* Participation Agreement */}
              <div className={`border rounded-xl p-4 transition-colors ${form.participationAgreement ? "border-teal-200 bg-teal-50/40" : "border-gray-100 bg-gray-50"}`}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="participation"
                    checked={form.participationAgreement}
                    onChange={(e) => setForm((p) => ({ ...p, participationAgreement: e.target.checked }))}
                    className="mt-0.5 w-4 h-4 accent-teal-500"
                  />
                  <label htmlFor="participation" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
                    <span className="font-semibold block mb-1">Participation Agreement</span>
                    I understand that the information contained in this training is useful in creating rapid and lasting change.
                    I hereby agree to use this information only for the purpose of self-improvement and to achieve a positive outcome.
                    I certify that my participation is of my own free will and I accept complete responsibility for my well-being.
                  </label>
                </div>
              </div>

              {/* Photo/Video Release */}
              <div className={`border rounded-xl p-4 transition-colors ${form.photoVideoRelease ? "border-teal-200 bg-teal-50/40" : "border-gray-100 bg-gray-50"}`}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="photoRelease"
                    checked={form.photoVideoRelease}
                    onChange={(e) => setForm((p) => ({ ...p, photoVideoRelease: e.target.checked }))}
                    className="mt-0.5 w-4 h-4 accent-teal-500"
                  />
                  <label htmlFor="photoRelease" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
                    <span className="font-semibold block mb-1">Photo / Video Release</span>
                    I understand that portions of this training may be photographed and/or recorded on video or audio.
                    I agree that no compensation will be paid to me for any products or revenue derived from these photographs or recordings.
                    I waive all rights I may be entitled to from the use of such images or recordings.
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 4: Signature ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Signature</p>

            {/* Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-4">
              <button
                type="button"
                onClick={() => { setSignatureType("draw"); setSignatureSaved(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${signatureType === "draw" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <PenLine size={12} /> Draw
              </button>
              <button
                type="button"
                onClick={() => { setSignatureType("type"); setSignatureSaved(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${signatureType === "type" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Type size={12} /> Type
              </button>
            </div>

            {/* Draw signature */}
            {signatureType === "draw" && (
              <div>
                {drawnSignature && signatureSaved ? (
                  <div className="relative">
                    <img src={drawnSignature} alt="Signature" className="w-full rounded-xl border border-teal-200 bg-gray-50" style={{ height: 140, objectFit: "contain" }} />
                    <div className="absolute top-2 right-2 bg-teal-100 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle size={10} /> Saved
                    </div>
                    <button
                      type="button"
                      onClick={() => { setDrawnSignature(""); setSignatureSaved(false); }}
                      className="mt-2 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                    >
                      <RotateCcw size={11} /> Redo signature
                    </button>
                  </div>
                ) : (
                  <SignatureCanvas onSave={(data) => { setDrawnSignature(data); setSignatureSaved(true); }} />
                )}
              </div>
            )}

            {/* Type signature */}
            {signatureType === "type" && (
              <div>
                <input
                  type="text"
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  placeholder="Type your full name as signature"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-yellow-400 text-gray-800 placeholder:text-gray-300"
                  style={{ fontFamily: "'Dancing Script', cursive, serif" }}
                />
                {typedSignature && (
                  <p className="text-xs text-teal-600 mt-1.5 flex items-center gap-1">
                    <CheckCircle size={11} /> Typed signature ready
                  </p>
                )}
              </div>
            )}
          </div>

           {alreadySigned && (
            <ContractPDFGenerator
              mode="preview"
              contractData={{
                fullName: lead.fullName,
                email: lead.email,
                phone: lead.phone,
                programName: lead.program_id?.name || contract.programName,
                fatherHusbandName: contract.fatherHusbandName,
                cnic: contract.cnic,
                bankAccountNumber: contract.bankAccountNumber,
                currentAddress: contract.currentAddress,
                emergencyContactName: contract.emergencyContactName,
                occupation: contract.occupation,
                participationAgreement: contract.participationAgreement,
                photoVideoRelease: contract.photoVideoRelease,
                signatureData: contract.signatureData,
                signedAt: contract.signedAt,
                paymentPlan: paymentPlan,
              }}
              // onGenerated={() => {}}
            />
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !form.participationAgreement || !form.photoVideoRelease}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold text-sm hover:from-yellow-500 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {isSubmitting ? (
              <><Loader2 size={16} className="animate-spin" /> Submitting...</>
            ) : (
              <><FileText size={16} /> Submit Signed Contract</>
            )}
          </button>

         

          <p className="text-xs text-gray-400 text-center pb-4">
            By submitting, you confirm that all information provided is accurate and you agree to the terms above.
          </p>
        </form>
      </div>
    </div>
  );
}