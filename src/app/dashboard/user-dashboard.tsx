// "use client";
// import {
//   Users, TrendingUp, DollarSign, Award,
// } from "lucide-react";
// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
// } from "recharts";

// const stats = [
//   { title: "Total Leads", value: "284", change: "+22.5% from last month", icon: Users, bg: "bg-gray-800", text: "text-white" },
//   { title: "Active Students", value: "142", change: "+18% from last month", icon: TrendingUp, bg: "bg-yellow-400", text: "text-gray-900" },
//   { title: "Monthly Revenue", value: "$48,350", change: "+12% from last month", icon: DollarSign, bg: "bg-blue-600", text: "text-white" },
//   { title: "Pending Certifications", value: "18", change: "-5.1% from last month", icon: Award, bg: "bg-white", text: "text-gray-900" },
// ];

// const pipeline = [
//   { label: "New Leads", count: 45, color: "bg-gray-800" },
//   { label: "Contacted", count: 32, color: "bg-yellow-400" },
//   { label: "Qualified", count: 25, color: "bg-yellow-400" },
//   { label: "Enrolled", count: 21, color: "bg-yellow-400" },
// ];

// const sessions = [
//   { student: "Sarah Mitchell", program: "NLP Certification", date: "Mar 3, 2025 at 2:00 PM", status: "scheduled" },
//   { student: "Michael Chen", program: "Timeline Therapy", date: "Mar 3, 2025 at 10:00 AM", status: "scheduled" },
//   { student: "Emma Rodriguez", program: "Transformational Coaching", date: "Mar 4, 2025 at 3:00 PM", status: "scheduled" },
//   { student: "James Wilson", program: "NLP Certification", date: "Mar 4, 2025 at 11:00 AM", status: "scheduled" },
//   { student: "Lisa Anderson", program: "Timeline Therapy", date: "Mar 5, 2025 at 1:00 PM", status: "scheduled" },
// ];

// const payments = [
//   { student: "Sarah Mitchell", amount: "$2,500", date: "Feb 28, 2026", status: "paid" },
//   { student: "Michael Chen", amount: "$3,200", date: "Feb 27, 2026", status: "paid" },
//   { student: "Emma Rodriguez", amount: "$2,500", date: "Feb 26, 2026", status: "pending" },
//   { student: "James Wilson", amount: "$2,500", date: "Feb 25, 2026", status: "paid" },
//   { student: "Lisa Anderson", amount: "$3,000", date: "Feb 24, 2026", status: "failed" },
// ];

// const chartData = [
//   { month: "Jan", revenue: 30000 },
//   { month: "Feb", revenue: 38000 },
//   { month: "Mar", revenue: 48350 },
//   { month: "Apr", revenue: 42000 },
//   { month: "May", revenue: 51000 },
//   { month: "Jun", revenue: 47000 },
// ];

// const statusColor = (status: string) => {
//   switch (status) {
//     case "paid": return "text-green-600 bg-green-100";
//     case "pending": return "text-yellow-600 bg-yellow-100";
//     case "failed": return "text-red-600 bg-red-100";
//     case "scheduled": return "text-blue-600 bg-blue-100";
//     default: return "text-gray-600 bg-gray-100";
//   }
// };

// export default function UserDashboard() {
//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
//         <p className="text-gray-500 text-sm">Welcome back! Here&apos;s what&apos;s happening with your coaching business.</p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-4 gap-4">
//         {stats.map((stat) => {
//           const Icon = stat.icon;
//           return (
//             <div key={stat.title} className={`${stat.bg} ${stat.text} rounded-xl p-5 shadow-sm`}>
//               <div className="flex justify-between items-start">
//                 <p className="text-sm opacity-80">{stat.title}</p>
//                 <Icon size={18} className="opacity-70" />
//               </div>
//               <p className="text-3xl font-bold mt-2">{stat.value}</p>
//               <p className="text-xs opacity-70 mt-1">{stat.change}</p>
//             </div>
//           );
//         })}
//       </div>

//       {/* Lead Pipeline + Quick Stats */}
//       <div className="grid grid-cols-3 gap-4">
//         <div className="col-span-2 bg-white rounded-xl p-5 shadow-sm">
//           <h2 className="font-semibold text-gray-800">Lead Pipeline</h2>
//           <p className="text-gray-400 text-xs mb-4">Current status of your leads</p>
//           <div className="space-y-3">
//             {pipeline.map((item) => (
//               <div key={item.label}>
//                 <div className="flex justify-between text-sm mb-1">
//                   <span className="text-gray-600">{item.label}</span>
//                   <span className="text-gray-500">{item.count} leads</span>
//                 </div>
//                 <div className="w-full bg-gray-100 rounded-full h-2">
//                   <div className={`${item.color} h-2 rounded-full`} style={{ width: `${(item.count / 45) * 100}%` }}></div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="bg-white rounded-xl p-5 shadow-sm space-y-3">
//           <h2 className="font-semibold text-gray-800">Quick Stats</h2>
//           <p className="text-gray-400 text-xs">Key metrics at a glance</p>
//           <div className="bg-gray-50 rounded-lg p-3">
//             <p className="text-xs text-gray-500">Conversion Rate</p>
//             <p className="text-xl font-bold text-green-600">32%</p>
//           </div>
//           <div className="bg-gray-50 rounded-lg p-3">
//             <p className="text-xs text-gray-500">Avg. Deal Size</p>
//             <p className="text-xl font-bold text-blue-600">$2,780</p>
//           </div>
//           <div className="bg-gray-50 rounded-lg p-3">
//             <p className="text-xs text-gray-500">Active Programs</p>
//             <p className="text-xl font-bold text-purple-600">8</p>
//           </div>
//         </div>
//       </div>

//       {/* Chart */}
//       <div className="bg-white rounded-xl p-5 shadow-sm">
//         <h2 className="font-semibold text-gray-800 mb-4">Revenue Overview</h2>
//         <ResponsiveContainer width="100%" height={200}>
//           <BarChart data={chartData}>
//             <XAxis dataKey="month" tick={{ fontSize: 12 }} />
//             <YAxis tick={{ fontSize: 12 }} />
//             <Tooltip />
//             <Bar dataKey="revenue" fill="#FACC15" radius={[4, 4, 0, 0]} />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Sessions */}
//       <div className="bg-white rounded-xl p-5 shadow-sm">
//         <h2 className="font-semibold text-gray-800">Upcoming Sessions</h2>
//         <p className="text-gray-400 text-xs mb-4">Next 5 scheduled training sessions</p>
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="text-gray-400 text-left border-b">
//               <th className="pb-2">Student</th>
//               <th className="pb-2">Program</th>
//               <th className="pb-2">Date & Time</th>
//               <th className="pb-2">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {sessions.map((s, i) => (
//               <tr key={i} className="border-b last:border-0">
//                 <td className="py-2 text-gray-700">{s.student}</td>
//                 <td className="py-2 text-gray-500">{s.program}</td>
//                 <td className="py-2 text-gray-500">{s.date}</td>
//                 <td className="py-2">
//                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(s.status)}`}>{s.status}</span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Payments */}
//       <div className="bg-white rounded-xl p-5 shadow-sm">
//         <h2 className="font-semibold text-gray-800">Recent Payments</h2>
//         <p className="text-gray-400 text-xs mb-4">Latest payment transactions</p>
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="text-gray-400 text-left border-b">
//               <th className="pb-2">Student</th>
//               <th className="pb-2">Amount</th>
//               <th className="pb-2">Date</th>
//               <th className="pb-2">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {payments.map((p, i) => (
//               <tr key={i} className="border-b last:border-0">
//                 <td className="py-2 text-gray-700">{p.student}</td>
//                 <td className="py-2 text-gray-700 font-medium">{p.amount}</td>
//                 <td className="py-2 text-gray-500">{p.date}</td>
//                 <td className="py-2">
//                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(p.status)}`}>{p.status}</span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

"use client";

// import {
//   Users, TrendingUp, DollarSign, Award,
// } from "lucide-react";

import { BookOpen, ClipboardList, Video, TrendingUp, UserCog } from "lucide-react";
import { StatCarduser } from "../component/dashboard/stat-card";
import PageHeader from "../component/dashboard/page-header";



const stats = [
  {
    title: "Enrolled courses", value: "4", sub: "2 in progress · 2 not started", icon: BookOpen, iconBg: "#EEEDFE",
    iconColor: "#534AB7",
  },
  {
    title: "Assignments due", value: "3", sub: "1 overdue · next due Apr 5", icon: ClipboardList, iconBg: "#FAEEDA",
    iconColor: "#854F0B",
  },
  {
    title: "Live sessions", value: "2", sub: "Next: Apr 3 at 2:00 PM", icon: Video, iconBg: "#E1F5EE",
    iconColor: "#0F6E56",
  },
  {
    title: "Overall progress", value: "62%", sub: "70%", icon: TrendingUp,
    iconBg: "#E6F1FB",
    iconColor: "#185FA5",
  },
];

const pipeline = [
  { label: "New Leads", count: 45, color: "bg-gray-800" },
  { label: "Contacted", count: 32, color: "bg-yellow-400" },
  { label: "Qualified", count: 25, color: "bg-yellow-400" },
  { label: "Enrolled", count: 21, color: "bg-yellow-400" },
];

const sessions = [
  { student: "Sarah Mitchell", program: "NLP Certification", date: "Mar 3, 2025 at 2:00 PM", status: "scheduled" },
  { student: "Michael Chen", program: "Timeline Therapy", date: "Mar 3, 2025 at 10:00 AM", status: "scheduled" },
];

const payments = [
  { student: "Sarah Mitchell", amount: "$2,500", date: "Feb 28, 2026", status: "paid" },
  { student: "Emma Rodriguez", amount: "$2,500", date: "Feb 26, 2026", status: "pending" },
];

const chartData = [
  { month: "Jan", revenue: 30000 },
  { month: "Feb", revenue: 38000 },
  { month: "Mar", revenue: 48350 },
];

export default function UserDashboard() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <PageHeader
        title="User Dashboard"
        subtitle="Welcome back! Here's what's happening with your coaching business."
        titleIcon={<UserCog size={24} />}
      // totalCount={data?.count ?? 0}
      // onAdd={() => setIsAddOpen(true)}
      // onDeleteAll={() => setShowDeleteAll(true)}
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCarduser key={stat.title} {...stat} />
        ))}
      </div>

      {/* Pipeline + Quick Stats */}
      {/* <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <LeadPipeline data={pipeline} />
        </div>

        <QuickStats
          data={[
            { label: "Conversion Rate", value: "32%", color: "text-green-600" },
            { label: "Avg. Deal Size", value: "$2,780", color: "text-blue-600" },
            { label: "Active Programs", value: "8", color: "text-purple-600" },
          ]}
        />
      </div> */}

      {/* Chart */}
      {/* <RevenueChart data={chartData} /> */}

      {/* Tables */}
      {/* <SessionsTable data={sessions} />
      <PaymentsTable data={payments} /> */}

    </div>
  );
}