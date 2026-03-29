
import { DashboardLayout } from "@/components/dashboard/layout"
import { AdminPaymentsPage } from "@/views/admin/ExtraAdminPages"

export default function Page() {
  return (
    <DashboardLayout userType="admin" userName="Ops Admin">
      <AdminPaymentsPage />
    </DashboardLayout>
  )
}

