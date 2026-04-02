"use client";

import { useAppSelector } from "@/store/hooks";
import AdminDashboard from "./admin-dashboard";
import RMDashboard from "./rm-dashboard";
import UserDashboard from "./user-dashboard";

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);

  const renderDashboard = () => {
    switch (user?.role) {
      case "admin":
        return <AdminDashboard />;
      case "relationship-manager":
        return <RMDashboard />;
      default:
        return <UserDashboard />;
    }
  };

  return <>{renderDashboard()}</>;
}