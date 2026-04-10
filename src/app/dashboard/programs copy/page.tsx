"use client";
import ProtectedRoute from "@/app/component/protected-route";
import AdminPrograms from "./components/admin-programs";

export default function ProgramsPage() {
  return (
    <ProtectedRoute>
      <AdminPrograms />
    </ProtectedRoute>
  );
}