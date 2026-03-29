
import { DashboardLayout } from "@/components/dashboard/layout"
import { AdminGigsModerationPage } from "@/views/admin/ExtraAdminPages"

export default function Page() {
  return (
    <DashboardLayout userType="admin" userName="Ops Admin">
      <AdminGigsModerationPage />
    </DashboardLayout>
  )
}

