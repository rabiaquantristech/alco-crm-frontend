import { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { ButtonProps } from "@/types/ui";

const variants = {
  primary: "bg-yellow-400 hover:bg-yellow-500 text-gray-900",
  secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700",
  blue: "bg-blue-500 hover:bg-blue-600 text-white",
  black: "bg-gray-800 hover:bg-gray-900 text-white",
  danger: "bg-red-500 hover:bg-red-600 text-white",
};

export default function Button({
  isLoading,
  loadingText = "Loading...",
  variant = "primary",
  fullWidth = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={isLoading || disabled}
      className={`
        ${variants[variant]}
        ${fullWidth ? "w-full" : ""}
        font-semibold py-2.5 px-5 rounded-lg transition 
        flex items-center justify-center gap-2 
        disabled:opacity-70 disabled:cursor-not-allowed
      `}
    >
      {isLoading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}