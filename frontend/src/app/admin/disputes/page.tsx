
import { DashboardLayout } from "@/components/dashboard/layout"
import { AdminDisputesPage } from "@/views/admin/ExtraAdminPages"

export default function Page() {
  return (
    <DashboardLayout userType="admin" userName="Ops Admin">
      <AdminDisputesPage />
    </DashboardLayout>
  )
}

