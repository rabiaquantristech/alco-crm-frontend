// app/component/ui/popup.tsx
"use client";

import { AlertTriangle, Trash2, Info, CheckCircle, XCircle, X } from "lucide-react";
import Button from "@/app/component/ui/button";

type PopupVariant = "danger" | "warning" | "info" | "success";

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  variant?: PopupVariant;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  loadingText?: string;
  zIndex?: number;
}

const config: Record<PopupVariant, {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}> = {
  danger: {
    icon: <Trash2 size={18} />,
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  info: {
    icon: <Info size={18} />,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
  },
  success: {
    icon: <CheckCircle size={18} />,
    iconBg: "bg-green-100",
    iconColor: "text-green-500",
  },
};

export default function Popup({
  isOpen,
  onClose,
  onConfirm,
  variant = "danger",
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  loadingText = "Processing...",
  zIndex = 50,
}: PopupProps) {
  if (!isOpen) return null;

  const { icon, iconBg, iconColor } = config[variant];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
              <span className={iconColor}>{icon}</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
              <p className="text-xs text-gray-400 mt-0.5">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-gray-500 transition mt-0.5"
          >
            <X size={16} />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            fullWidth
            isLoading={isLoading}
            loadingText={loadingText}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>

      </div>
    </div>
  );
}