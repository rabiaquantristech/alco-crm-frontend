"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import AdminDashboard from "./admin-dashboard";
import RMDashboard from "./rm-dashboard";
import UserDashboard from "./user-dashboard";

export default function DashboardPage() {
  const { user, token } = useAppSelector((state) => state.auth);
  const router = useRouter();

  // useEffect(() => {
  //   // localStorage se check karo agar Redux mein nahi hai
  //   if (!token) {
  //     const storedToken = localStorage.getItem("token");
  //     const storedUser = localStorage.getItem("user");
      
  //     if (!storedToken || !storedUser) {
  //       router.replace("/login");
  //     }
  //   }
  // }, [token]);

  const renderDashboard = () => {
    switch (user?.role) {
      case "admin":
        return <AdminDashboard />;
      case "relationship_manager":
        return <RMDashboard />;
      default:
        return <UserDashboard />;
    }
  };

  return (
    <>
      {renderDashboard()}
    </>
  );
}