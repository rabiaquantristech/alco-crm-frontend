"use client";
import ProtectedRoute from "@/app/component/protected-route";
import { UserCog } from "lucide-react";
import PageHeader from "@/app/component/dashboard/page-header";




export default function SupportDashboard() {


  return (
    <ProtectedRoute>
      {/* Header */}
      <PageHeader
        title="Support Dashboard"
        subtitle="Manage your support activities and performance"
        titleIcon={<UserCog size={24} />}
      // totalCount={data?.count ?? 0}
      // onAdd={() => setIsAddOpen(true)}
      // onDeleteAll={() => setShowDeleteAll(true)}
      />
    </ProtectedRoute>
  );
}