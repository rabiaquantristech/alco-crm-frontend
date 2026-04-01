"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCog,
  BookOpen,
  Calendar,
  CreditCard,
  Award,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import MiniLogo from "@/assets/mini-logo-white.webp";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/dashboard/leads", icon: Users },
  { label: "Enrollments", href: "/dashboard/enrollments", icon: BookOpen },
  { label: "Students", href: "/dashboard/students", icon: UserCog },
  { label: "Sessions", href: "/dashboard/sessions", icon: Calendar },
  { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { label: "Certifications", href: "/dashboard/certifications", icon: Award },
  { label: "Reports", href: "/dashboard/reports", icon: BarChart2 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center gap-3">

          {/* Logo */}
          <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center shrink-0">
            <Image
              src={MiniLogo}
              alt="ALCO CRM Logo"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>

          {/* Text */}
          <div className="flex flex-col leading-tight">
            <span className="text-white font-semibold text-sm truncate">
              Arslan Larik & Company
            </span>
            <span className="text-gray-400 text-xs">
              CRM of the company
            </span>
          </div>

        </div>
      </div>
      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                ? "bg-yellow-400 text-gray-900 font-semibold"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
            >
              <Icon size={18} />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all w-full"
        >
          <LogOut size={18} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}