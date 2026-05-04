"use client";
import { UserCog } from "lucide-react"; 
import ProtectedRoute from "@/app/component/protected-route";
import PageHeader from "@/app/component/dashboard/page-header";


export default function FinanceManagerDashboard() {


  return (
    <ProtectedRoute>
      {/* Header */}
      <PageHeader
        title="Finance Manager Dashboard"
        subtitle="Manage your finance activities and performance"
        titleIcon={<UserCog size={24} />}
      // totalCount={data?.count ?? 0}
      // onAdd={() => setIsAddOpen(true)}
      // onDeleteAll={() => setShowDeleteAll(true)}
      />
    </ProtectedRoute>
  );
}