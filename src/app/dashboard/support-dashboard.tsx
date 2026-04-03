"use client";
import ProtectedRoute from "@/app/component/protected-route";
import { UserCog } from "lucide-react";




export default function SupportDashboard() {
 

  return (
    <ProtectedRoute>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserCog size={24} />
            Support Dashboard
          </h1>
          <p className="text-gray-400 text-sm">Manage your support activities and performance</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}