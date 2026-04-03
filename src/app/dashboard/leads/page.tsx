import React from 'react'
import PageHeader from '@/app/component/dashboard/page-header'
import ProtectedRoute from '@/app/component/protected-route'
import { Users } from 'lucide-react'

export default function Leads() {
  return (
    <ProtectedRoute>
      {/* Header */}
      <PageHeader
        title="Leads"
        subtitle="Manage all leads"
        titleIcon={<Users size={24} />}
        totalCount={6}
      // onAdd={() => setIsAddOpen(true)}
      // onDeleteAll={() => setShowDeleteAll(true)}
      />
    </ProtectedRoute>
  )
}
