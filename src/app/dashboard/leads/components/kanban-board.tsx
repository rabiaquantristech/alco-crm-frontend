import React from 'react'
import { PIPELINE_STAGES, toStageKey } from '../shared/constants';
import KanbanCard from './kanban-card';

export default function KanbanBoard({ leads, programMap, actions }: any) {
  const grouped: Record<string, any[]> = {};
  PIPELINE_STAGES.forEach((s) => { grouped[s.key] = []; });
  (leads || []).forEach((lead: any) => {
    const key = toStageKey(lead.status);
    if (grouped[key]) grouped[key].push(lead);
  });

  const colValue = (key: string) =>
    grouped[key].reduce((sum: number, l: any) => sum + (Number(l.opportunity_value) || 0), 0);

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 min-w-3xl" style={{ scrollbarWidth: "thin" }}>
      {PIPELINE_STAGES.map((stage) => (
        <div key={stage.key} className="flex-shrink-0 w-64 flex flex-col">
          <div className={`rounded-xl border-t-4 ${stage.color} ${stage.bg} px-3 py-2.5 mb-2`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-700">{stage.label}</p>
              <span className="text-xs font-bold text-gray-500 bg-white px-2 py-0.5 rounded-full">
                {grouped[stage.key].length}
              </span>
            </div>
            {colValue(stage.key) > 0 && (
              <p className="text-[11px] text-gray-500 mt-0.5">Rs {colValue(stage.key).toLocaleString()}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            {grouped[stage.key].length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-500 border-2 border-dashed border-gray-100 rounded-xl">No leads</div>
            ) : (
              grouped[stage.key].map((lead: any) => (
                <KanbanCard key={lead._id} lead={lead} programMap={programMap}
                  isLost={lead.status === "lost"} {...actions} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

