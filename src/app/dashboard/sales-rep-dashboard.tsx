"use client";
import ProtectedRoute from "@/app/component/protected-route";
import { UserCog } from "lucide-react";
import PageHeader from "../component/dashboard/page-header";




export default function SalesRepDashboard() {
 

  return (
    <ProtectedRoute>
      {/* Header */}
      <PageHeader
              title="Sales Representative Dashboard"
              subtitle="Manage your leads and sessions efficiently"
              titleIcon={<UserCog size={24} />}
            // totalCount={data?.count ?? 0}
            // onAdd={() => setIsAddOpen(true)}
            // onDeleteAll={() => setShowDeleteAll(true)}
            />
    </ProtectedRoute>
  );
}