"use client";
import React from 'react';
import PageHeader from '@/app/component/dashboard/page-header';
import ProtectedRoute from '@/app/component/protected-route';
import { useAppSelector } from '@/store/hooks';
import { Users } from 'lucide-react';
import SalesManagerLeads from './components/sales-manager-leads';
import SalesRepLeads from './components/sales-rep-leads';
import AdminLeads from './components/admin-leads';

// Role based components — alag alag views


export default function Leads() {
  const { user } = useAppSelector((state) => state.auth);

  const renderLeads = () => {
    switch (user?.role) {
      case "super_admin":
      case "admin":
        return <AdminLeads />;
      case "sales_manager":
        return <SalesManagerLeads />;
      case "sales_rep":
        return <SalesRepLeads />;
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      {renderLeads()}
    </ProtectedRoute>
  );
}