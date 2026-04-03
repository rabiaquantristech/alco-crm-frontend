import React from 'react'
import PageHeader from '@/app/component/dashboard/page-header'
import ProtectedRoute from '@/app/component/protected-route'
import { BookOpen } from 'lucide-react'

export default function Enrollments() {
  return (
    <ProtectedRoute>
          {/* Header */}
          <PageHeader
            title="Enrollments"
            subtitle="Manage all enrollments"
            titleIcon={<BookOpen size={24} />}
            totalCount={6}
          // onAdd={() => setIsAddOpen(true)}
          // onDeleteAll={() => setShowDeleteAll(true)}
          />
        </ProtectedRoute>
  )
}
