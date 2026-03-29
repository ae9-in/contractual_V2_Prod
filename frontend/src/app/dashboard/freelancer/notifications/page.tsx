
import { DashboardLayout } from "@/components/dashboard/layout"
import { NotificationsPage } from "@/views/Notifications"

export default function FreelancerNotificationsRoute() {
  return (
    <DashboardLayout userType="freelancer" userName="Jordan Lee">
      <NotificationsPage userType="freelancer" />
    </DashboardLayout>
  )
}

