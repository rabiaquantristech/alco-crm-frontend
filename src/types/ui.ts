import { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";

export type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: FieldError;
  rightIcon?: React.ReactNode;
  disabled?: boolean
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
  disabled?: boolean;
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

export type FieldType = "input" | "select" | "textarea" | "checkbox" | "custom";

export type ModalField = {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  inputType?: string; // "text" | "email" | "password" | "number"
  options?: { label: string; value: string, disabled?: boolean }[]; // select ke liye
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string; 
  render?: (value: string | boolean, onChange: (updatedValue: string | boolean) => void) => React.ReactNode; // custom field ke liye
};

export type ModalTab = {
  key: string;
  label: string;
  fields: ModalField[];
  onSubmit?: (data: Record<string, string | boolean>) => void;
};

export  type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  subtitle?: string; 
  title: string;
  fields: ModalField[];
  initialValues?: Record<string, string | boolean>;
  onSubmit: (data: Record<string, string | boolean>) => void;
  isLoading?: boolean;
  mode?: "add" | "edit";
  step?: "forgot" | "reset";  
  onBack?: () => void;  
  tabs?: ModalTab[];       
};

