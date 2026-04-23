import React from "react";
import Button from "@/app/component/ui/button";

interface ViewActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  activitiesData: any;
  isLoading: boolean;
}

export default function ViewActivityModal({
  isOpen,
  onClose,
  lead,
  activitiesData,
  isLoading,
}: ViewActivityModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Activities
            </h2>
            <p className="text-xs text-gray-400">
              {lead?.first_name} {lead?.last_name}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activitiesData?.data?.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            No activities yet
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activitiesData?.data?.map((act: any, i: number) => (
              <div key={i} className="border rounded-xl p-4">
                
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800">
                    {act.title}
                  </span>
                  <span className="text-xs text-gray-400 capitalize">
                    {act.activity_type}
                  </span>
                </div>

                {act.description && (
                  <p className="text-xs text-gray-500">
                    {act.description}
                  </p>
                )}

                {act.call_duration_minutes && (
                  <p className="text-xs text-gray-400 mt-1">
                    Duration: {act.call_duration_minutes} mins
                  </p>
                )}

                {act.call_outcome && (
                  <p className="text-xs text-gray-400">
                    Outcome: {act.call_outcome}
                  </p>
                )}

                <p className="text-xs text-gray-300 mt-2">
                  {new Date(act.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}