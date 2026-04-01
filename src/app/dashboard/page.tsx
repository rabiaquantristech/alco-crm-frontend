"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { loadFromStorage } from "@/store/authSlice";
import AdminDashboard from "./admin-dashboard";
import RMDashboard from "./rm-dashboard";
import UserDashboard from "./user-dashboard";

export default function DashboardPage() {
  const { user, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Pehle localStorage se load karo
    dispatch(loadFromStorage());
    
    const storedToken = localStorage.getItem("token");
    
    if (!storedToken) {
      router.replace("/login");
    } else {
      setChecking(false);
    }
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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

  return <>{renderDashboard()}</>;
}

// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAppSelector } from "@/store/hooks";
// import AdminDashboard from "./admin-dashboard";
// import RMDashboard from "./rm-dashboard";
// import UserDashboard from "./user-dashboard";

// export default function DashboardPage() {
//   const { user, token } = useAppSelector((state) => state.auth);
//   const router = useRouter();

//   useEffect(() => {
//     // localStorage se check karo agar Redux mein nahi hai
//     if (!token) {
//       const storedToken = localStorage.getItem("token");
//       const storedUser = localStorage.getItem("user");
      
//       if (!storedToken || !storedUser) {
//         router.replace("/login");
//       }
//     }
//   }, [token]);

//   const renderDashboard = () => {
//     switch (user?.role) {
//       case "admin":
//         return <AdminDashboard />;
//       case "relationship_manager":
//         return <RMDashboard />;
//       default:
//         return <UserDashboard />;
//     }
//   };

//   return (
//     <>
//       {renderDashboard()}
//     </>
//   );
// }