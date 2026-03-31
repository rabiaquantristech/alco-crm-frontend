"use client";
import { X } from "lucide-react";
import Input from "@/app/component/ui/inputField";
import Select from "@/app/component/ui/select";
import Textarea from "@/app/component/ui/textarea";
import Checkbox from "@/app/component/ui/checkbox";
import Button from "@/app/component/ui/button";
import { useState } from "react";
import { ModalField, ModalProps } from "@/types/ui";

export default function Modal({
  isOpen,
  onClose,
  title,
  fields,
  initialValues = {},
  onSubmit,
  isLoading = false,
  mode = "add",
}: ModalProps) {
  const [form, setForm] = useState<Record<string, string | boolean>>(
    fields.reduce((acc, field) => {
      acc[field.name] = initialValues[field.name] ?? (field.type === "checkbox" ? false : "");
      return acc;
    }, {} as Record<string, string | boolean>)
  );

  // initialValues change hone pe form reset karo
  const handleOpen = () => {
    setForm(
      fields.reduce((acc, field) => {
        acc[field.name] = initialValues[field.name] ?? (field.type === "checkbox" ? false : "");
        return acc;
      }, {} as Record<string, string | boolean>)
    );
  };

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(form);
  };

  const renderField = (field: ModalField) => {
    switch (field.type) {
      case "input":
        return (
          <Input
            key={field.name}
            label={field.label}
            type={field.inputType || "text"}
            placeholder={field.placeholder}
            value={form[field.name] as string}
            onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
          />
        );

      case "select":
        return (
          <Select
            key={field.name}
            label={field.label}
            options={field.options || []}
            value={form[field.name] as string}
            onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
          />
        );

      case "textarea":
        return (
          <Textarea
            key={field.name}
            label={field.label}
            placeholder={field.placeholder}
            value={form[field.name] as string}
            onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
          />
        );

      case "checkbox":
        return (
          <Checkbox
            key={field.name}
            label={field.label}
            checked={form[field.name] as boolean}
            onChange={(e) => setForm({ ...form, [field.name]: e.target.checked })}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* Fields */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {fields.map((field) => renderField(field))}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            fullWidth
            isLoading={isLoading}
            loadingText={mode === "edit" ? "Saving..." : "Adding..."}
            onClick={handleSubmit}
          >
            {mode === "edit" ? "Save Changes" : "Add"}
          </Button>
        </div>

      </div>
    </div>
  );
}