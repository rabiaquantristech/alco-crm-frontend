import { PipelineItem } from "@/types/dasboard";


export default function LeadPipeline({ data }: { data: PipelineItem[] }) {
  const max = Math.max(...data.map((i) => i.count));

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h2 className="font-semibold text-gray-800">Lead Pipeline</h2>
      <p className="text-gray-400 text-xs mb-4">
        Current status of your leads
      </p>

      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{item.label}</span>
              <span className="text-gray-500">{item.count} leads</span>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`${item.color} h-2 rounded-full`}
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}