import React from 'react'
import PageHeader from '@/app/component/dashboard/page-header'
import ProtectedRoute from '@/app/component/protected-route'
import { CreditCard } from 'lucide-react'

export default function Payments() {
  return (
      <ProtectedRoute>
          {/* Header */}
          <PageHeader
            title="Payments"
            subtitle="Manage all Payments"
            titleIcon={<CreditCard size={24} />}
            totalCount={6}
          // onAdd={() => setIsAddOpen(true)}
          // onDeleteAll={() => setShowDeleteAll(true)}
          />
        </ProtectedRoute>
  )
}
