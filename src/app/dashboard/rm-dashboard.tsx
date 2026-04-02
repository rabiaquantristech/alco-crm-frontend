"use client";

import {
  Users, TrendingUp, Calendar,
} from "lucide-react";
import { StatCard }from "../component/dashboard/stat-card";
import LeadPipeline from "../component/dashboard/lead-pipeline";
import QuickStats from "../component/dashboard/quick-stats";
import SessionsTable from "../component/dashboard/sessions-table";


const stats = [
  {
    title: "Assigned Leads",
    value: "120",
    change: "+10%",
    icon: Users,
    bg: "bg-gray-800",
    text: "text-white",
  },
  {
    title: "Conversions",
    value: "38",
    change: "+8%",
    icon: TrendingUp,
    bg: "bg-yellow-400",
    text: "text-gray-900",
  },
  {
    title: "Today's Sessions",
    value: "6",
    change: "+2",
    icon: Calendar,
    bg: "bg-blue-600",
    text: "text-white",
  },
];

const pipeline = [
  { label: "New Leads", count: 30, color: "bg-gray-800" },
  { label: "Contacted", count: 22, color: "bg-yellow-400" },
  { label: "Qualified", count: 15, color: "bg-yellow-400" },
  { label: "Closed", count: 10, color: "bg-yellow-400" },
];

const sessions = [
  {
    student: "Ali Khan",
    program: "NLP",
    date: "Mar 5, 2026 at 2:00 PM",
    status: "scheduled",
  },
  {
    student: "Sara Ahmed",
    program: "Coaching",
    date: "Mar 5, 2026 at 4:00 PM",
    status: "scheduled",
  },
];

export default function RelationshipManagerDashboard() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Relationship Manager Dashboard
        </h1>
        <p className="text-gray-500 text-sm">
          Manage your leads and sessions efficiently
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Pipeline */}
      <LeadPipeline data={pipeline} />

      {/* Quick Stats */}
      <QuickStats
        data={[
          { label: "Conversion Rate", value: "32%", color: "text-green-600" },
          { label: "Follow-ups Today", value: "12", color: "text-blue-600" },
        ]}
      />

      {/* Sessions */}
      {/* <SessionsTable data={sessions} /> */}

    </div>
  );
}