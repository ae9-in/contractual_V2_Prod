"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { AdminPaymentsPage } from "@/src/views/admin/ExtraAdminPages"

export default function Page() {
  return (
    <DashboardLayout userType="admin" userName="Ops Admin">
      <AdminPaymentsPage />
    </DashboardLayout>
  )
}
