import { SelectProps } from "@/types/ui";


export default function Select({ label, options, error, ...props }: SelectProps) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
      <select
        {...props}
        className={`w-full px-4 py-2.5 rounded-lg border text-sm text-gray-900 outline-none transition
          ${error ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-yellow-400"}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
}