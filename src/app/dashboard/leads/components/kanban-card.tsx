"use client";
import React from 'react'
import { qualityColor } from '../shared/constants';
import { Activity, Pencil, Tag, Trash2, UserCheck, UserPlus, XCircle } from 'lucide-react';
import { MdOutlineRemoveRedEye } from "react-icons/md";

const cardStyle = (status: string) => {
  switch (status) {
    case "lost":      return "bg-rose-50/70 border-rose-200";
    case "converted": return "bg-blue-50/70 border-blue-200";
    case "enrolled":  return "bg-green-50/70 border-green-200";
    default:          return "bg-white border-gray-100";
  }
};

export default function KanbanCard({
  lead, programMap,
  onEdit, onActivity, onConvert, onMarkLost, onDelete, onAssign, onViewActivities
}: any) {
  return (
    <div className={`rounded-xl border shadow-sm p-3 hover:shadow-md transition-shadow cursor-pointer group ${cardStyle(lead.status)}`}>

      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-semibold text-gray-800 text-sm leading-tight">
          {lead.first_name} {lead.last_name}
        </p>
        {lead.quality && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${qualityColor(lead.quality)}`}>
            {lead.quality}
          </span>
        )}
      </div>

      {lead.status === "lost" && lead.lost_reason && (
        <p className="text-[10px] text-rose-400 mb-2 italic">{lead.lost_reason}</p>
      )}

      {lead.source && <p className="text-[11px] text-gray-400 mb-2 capitalize">{lead.source}</p>}

      {lead.program_id && (
        <div className="flex items-center gap-1 mb-2">
          <Tag size={10} className="text-gray-400" />
          <span className="text-[11px] text-gray-500 truncate">
            {programMap?.[lead.program_id] || "Program"}
          </span>
        </div>
      )}

      {lead.opportunity_value && (
        <p className={`text-[11px] font-semibold mb-2 ${lead.status === "lost" ? "text-rose-400 line-through" : "text-gray-700"}`}>
          Rs {Number(lead.opportunity_value).toLocaleString()}
        </p>
      )}

      {lead.assigned_to && (
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-[8px] font-bold text-gray-900">
            {lead.assigned_to?.name?.charAt(0) || "?"}
          </div>
          <span className="text-[10px] text-gray-400">{lead.assigned_to?.name}</span>
        </div>
      )}

      <div className="flex items-center gap-1 pt-2 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button onClick={() => onEdit(lead)} title="Edit" className="p-1 rounded hover:bg-yellow-50 hover:text-yellow-600 text-gray-400"><Pencil size={11} /></button>
        )}
        {onAssign && (
          <button onClick={() => onAssign(lead)} title="Assign" className="p-1 rounded hover:bg-blue-50 hover:text-blue-600 text-gray-400"><UserPlus size={11} /></button>
        )}
        {onActivity && (
          <button onClick={() => onActivity(lead)} title="Activity" className="p-1 rounded hover:bg-indigo-50 hover:text-indigo-600 text-gray-400"><Activity size={11} /></button>
        )}
        {onViewActivities && lead.activities?.length > 0 && (
          <button onClick={() => onViewActivities(lead)} title="View" className="p-1 rounded hover:bg-indigo-50 hover:text-indigo-600 text-gray-400"><MdOutlineRemoveRedEye size={11} /></button>
        )}
        {onConvert && lead.status !== "converted" && lead.status !== "lost" && (
          <button onClick={() => onConvert(lead)} title="Convert" className="p-1 rounded hover:bg-teal-50 hover:text-teal-600 text-gray-400"><UserCheck size={11} /></button>
        )}
        {onMarkLost && lead.status !== "converted" && lead.status !== "lost" && (
          <button onClick={() => onMarkLost(lead)} title="Lost" className="p-1 rounded hover:bg-rose-50 hover:text-rose-500 text-gray-400"><XCircle size={11} /></button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(lead)} title="Delete" className="p-1 rounded hover:bg-rose-50 hover:text-rose-500 text-gray-400 ml-auto"><Trash2 size={11} /></button>
        )}
      </div>
    </div>
  );
}