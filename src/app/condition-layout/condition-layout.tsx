
"use client";
import ProtectedRoute from "@/app/component/protected-route";
import Sidebar from "@/app/component/sidebar";
import Navbar from "@/app/component/navbar";

import { useAppSelector } from "@/store/hooks";
import { usePathname } from "next/navigation";


export default function ConditionLayout( { children }: { children: React.ReactNode }) {
  const pathname = usePathname();

if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    // <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    // </ProtectedRoute>
  );
}