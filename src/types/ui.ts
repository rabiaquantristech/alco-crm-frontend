import { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";

export type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: FieldError;
  rightIcon?: React.ReactNode;
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "danger" | "blue" | "black";
  fullWidth?: boolean;
};

export type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};


export type Option = {
  label: string;
  value: string;
};

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: Option[];
  error?: FieldError;
};

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: FieldError;
};

export type FieldType = "input" | "select" | "textarea" | "checkbox";

export type ModalField = {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  inputType?: string; // "text" | "email" | "password" | "number"
  options?: { label: string; value: string }[]; // select ke liye
  required?: boolean;
};

export  type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: ModalField[];
  initialValues?: Record<string, string | boolean>;
  onSubmit: (data: Record<string, string | boolean>) => void;
  isLoading?: boolean;
  mode?: "add" | "edit";
};

