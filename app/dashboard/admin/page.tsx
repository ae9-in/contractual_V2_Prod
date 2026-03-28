"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { AdminDashboardPage } from "@/src/views/admin/Dashboard"

export default function AdminDashboardRoute() {
  return (
    <DashboardLayout userType="admin" userName="Ops Admin">
      <AdminDashboardPage />
    </DashboardLayout>
  )
}
