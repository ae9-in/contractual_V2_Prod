
import { DashboardLayout } from "@/components/dashboard/layout"
import { NotificationsPage } from "@/views/Notifications"

export default function AdminNotificationsRoute() {
  return (
    <DashboardLayout userType="admin" userName="Ops Admin">
      <NotificationsPage userType="admin" />
    </DashboardLayout>
  )
}

