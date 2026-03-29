
import { DashboardLayout } from "@/components/dashboard/layout"
import { AdminContractsPage } from "@/views/admin/ExtraAdminPages"

export default function Page() {
  return (
    <DashboardLayout userType="admin" userName="Ops Admin">
      <AdminContractsPage />
    </DashboardLayout>
  )
}

