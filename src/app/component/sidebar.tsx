
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
  GraduationCap,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import MiniLogo from "@/assets/mini-logo-white.webp";
import Popup from "@/app/component/ui/popup/popup";
import { useState } from "react";
import { useAppSelector } from "@/store/hooks";

interface MenuItem {
  label: string;
  href?: string;
  icon: any;
  roles: string[];
  children?: { label: string; href: string }[];
}

interface MenuSection {
  title: string;
  roles: string[];
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: "CRM",
    roles: ["super_admin", "admin", "sales_manager", "sales_rep"],
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["super_admin", "admin", "sales_manager", "sales_rep"] },

      { label: "Leads", href: "/dashboard/leads", icon: Users, roles: ["super_admin", "admin", "sales_manager", "sales_rep"] },

      { label: "Programs", href: "/dashboard/programs", icon: GraduationCap, roles: ["super_admin", "admin"] },

      { label: "Enrollments", href: "/dashboard/enrollments", icon: BookOpen, roles: ["super_admin", "admin"] },

      { label: "Students", href: "/dashboard/students", icon: UserCog, roles: ["super_admin", "admin"] },

      { label: "Sessions", href: "/dashboard/sessions", icon: Calendar, roles: ["super_admin", "admin"] },

      { label: "Payments", href: "/dashboard/payments", icon: CreditCard, roles: ["super_admin", "admin"] },

      { label: "Certifications", href: "/dashboard/certifications", icon: Award, roles: ["super_admin", "admin"] },

      { label: "Reports", href: "/dashboard/reports", icon: BarChart2, roles: ["super_admin", "admin"] },

      { label: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["super_admin", "admin"] },
    ],
  },
  {
    title: "Website",
    roles: ["super_admin", "admin"],
    items: [
      {
        label: "Blogs",
        icon: BookOpen,
        roles: ["super_admin", "admin"],
        children: [
          { label: "All Blogs", href: "/dashboard/blogs" },
          { label: "Create Blog", href: "/dashboard/blogs/create" },
          // { label: "Categories", href: "/dashboard/blogs/categories" },
        ],
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user: authUser } = useAppSelector((state) => state.auth);
  const role = authUser?.role;

  const [showLogout, setShowLogout] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (label: any) => {
    setOpenMenus((prev: any) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">

      {/* Logo */}
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center shrink-0">
            <Image
              src={MiniLogo}
              alt="ALCO CRM Logo"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-white font-semibold text-sm truncate">
              Arslan Larik & Company
            </span>
            <span className="text-gray-400 text-xs">CRM of the company</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {menuSections
          .filter((section) => section.roles.includes(role))
          .map((section) => {
            const visibleItems = section.items.filter((item) =>
              item.roles.includes(role)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title}>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">
                  {section.title}
                </p>

                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;

                    if (item.children) {
                      const isOpen = !!openMenus[item.label];
                      const isChildActive = item.children.some(
                        (child) => pathname === child.href
                      );

                      return (
                        <div key={item.label}>
                          <button
                            onClick={() => toggleMenu(item.label)}
                            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all ${isChildActive
                                ? "text-yellow-400"
                                : "text-gray-400 hover:bg-gray-800 hover:text-white"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon size={18} />
                              <span className="text-sm">{item.label}</span>
                            </div>
                            {isOpen ? (
                              <ChevronDown size={14} />
                            ) : (
                              <ChevronRight size={14} />
                            )}
                          </button>

                          {isOpen && (
                            <div className="ml-7 mt-1 space-y-1 border-l border-gray-700 pl-3">
                              {item.children.map((child) => {
                                const isActive = pathname === child.href;
                                return (
                                  <Link
                                    key={child.href}
                                    href={child.href}
                                    className={`block px-3 py-2 rounded-md text-sm transition-all ${isActive
                                        ? "bg-yellow-400 text-gray-900 font-semibold"
                                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                      }`}
                                  >
                                    {child.label}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (!item.href) return null;

                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                            ? "bg-yellow-400 text-gray-900 font-semibold"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                          }`}
                      >
                        <Icon size={18} />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => setShowLogout(true)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all w-full"
        >
          <LogOut size={18} />
          <span className="text-sm">Logout</span>
        </button>
      </div>

      <Popup
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={handleLogout}
        variant="info"
        title="Log Out"
        description="Are you sure you want to log out? You will need to sign in again to access your dashboard."
        confirmText="Yes, Log Out"
        cancelText="Stay"
      />
    </div>
  );
}

// "use client";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   LayoutDashboard,
//   Users,
//   UserCog,
//   BookOpen,
//   Calendar,
//   CreditCard,
//   Award,
//   BarChart2,
//   Settings,
//   LogOut,
//   GraduationCap,
// } from "lucide-react";
// import Image from "next/image";
// import MiniLogo from "@/assets/mini-logo-white.webp";
// import Popup from "@/app/component/ui/popup/popup";
// import { useState } from "react";
// import { useAppSelector } from "@/store/hooks";

// // const menuItems = [
// //   { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
// //   { label: "Leads", href: "/dashboard/leads", icon: Users },
// //   { label: "Programs", href: "/dashboard/programs", icon: GraduationCap },
// //   { label: "Enrollments", href: "/dashboard/enrollments", icon: BookOpen },
// //   { label: "Students", href: "/dashboard/students", icon: UserCog },
// //   { label: "Sessions", href: "/dashboard/sessions", icon: Calendar },
// //   { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
// //   { label: "Certifications", href: "/dashboard/certifications", icon: Award },
// //   { label: "Reports", href: "/dashboard/reports", icon: BarChart2 },
// //   { label: "Settings", href: "/dashboard/settings", icon: Settings },
// // ];

// const menuItems = [
//   { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["super_admin", "admin", "sales_manager", "sales_rep"] },

//   { label: "Leads", href: "/dashboard/leads", icon: Users, roles: ["super_admin", "admin", "sales_manager", "sales_rep"] },

//   { label: "Programs", href: "/dashboard/programs", icon: GraduationCap, roles: ["super_admin", "admin"] },

//   { label: "Enrollments", href: "/dashboard/enrollments", icon: BookOpen, roles: ["super_admin", "admin"] },

//   { label: "Students", href: "/dashboard/students", icon: UserCog, roles: ["super_admin", "admin"] },

//   { label: "Sessions", href: "/dashboard/sessions", icon: Calendar, roles: ["super_admin", "admin"] },

//   { label: "Payments", href: "/dashboard/payments", icon: CreditCard, roles: ["super_admin", "admin"] },

//   { label: "Certifications", href: "/dashboard/certifications", icon: Award, roles: ["super_admin", "admin"] },

//   { label: "Reports", href: "/dashboard/reports", icon: BarChart2, roles: ["super_admin", "admin"] },

//   { label: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["super_admin", "admin"] },
// ];

// export default function Sidebar() {
//   const pathname = usePathname();
//   const { user: authUser } = useAppSelector((state) => state.auth);

//   const role = authUser?.role;

//   const filteredMenu = menuItems.filter((item) =>
//     item.roles.includes(role)
//   );
//   const [showLogout, setShowLogout] = useState(false);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     window.location.href = "/login";
//   };

//   return (
//     <div className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
//       {/* Logo */}
//       <div className="p-5 border-b border-gray-700">
//         <div className="flex items-center gap-3">

//           {/* Logo */}
//           <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center shrink-0">
//             <Image
//               src={MiniLogo}
//               alt="ALCO CRM Logo"
//               width={28}
//               height={28}
//               className="object-contain"
//             />
//           </div>

//           {/* Text */}
//           <div className="flex flex-col leading-tight">
//             <span className="text-white font-semibold text-sm truncate">
//               Arslan Larik & Company
//             </span>
//             <span className="text-gray-400 text-xs">
//               CRM of the company
//             </span>
//           </div>

//         </div>
//       </div>
//       {/* Menu Items */}
//       <nav className="flex-1 p-4 space-y-1">
//         {filteredMenu.map((item) => {
//           const Icon = item.icon;
//           const isActive = pathname === item.href;
//           return (
//             <Link
//               key={item.href}
//               href={item.href}
//               className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
//                 ? "bg-yellow-400 text-gray-900 font-semibold"
//                 : "text-gray-400 hover:bg-gray-800 hover:text-white"
//                 }`}
//             >
//               <Icon size={18} />
//               <span className="text-sm">{item.label}</span>
//             </Link>
//           );
//         })}
//       </nav>

//       {/* Logout */}
//       <div className="p-4 border-t border-gray-700">
//         <button
//           onClick={() => setShowLogout(true)}
//           className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all w-full"
//         >
//           <LogOut size={18} />
//           <span className="text-sm">Logout</span>
//         </button>
//       </div>

//       <Popup
//         isOpen={showLogout}
//         onClose={() => setShowLogout(false)}
//         onConfirm={handleLogout}
//         variant="info"
//         title="Log Out"
//         description="Are you sure you want to log out? You will need to sign in again to access your dashboard."
//         confirmText="Yes, Log Out"
//         cancelText="Stay"
//       />
//     </div>
//   );
// }