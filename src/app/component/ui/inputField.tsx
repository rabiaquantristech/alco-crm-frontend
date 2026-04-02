import { InputFieldProps } from "@/types/ui";

export default function InputField({ label, error, rightIcon, disabled, ...props }: InputFieldProps) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 block">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition
           text-gray-900 placeholder:text-gray-400 ${disabled && "cursor-not-allowed"}
          ${rightIcon ? "pr-10" : ""}
           ${error
              ? "border-red-400 focus:border-red-400"
              : "border-gray-200 focus:border-yellow-400"
            }`}
            disabled={disabled}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error.message}</p>
      )}
    </div>
  );
}