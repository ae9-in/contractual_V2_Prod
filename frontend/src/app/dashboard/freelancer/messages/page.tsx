
import { DashboardLayout } from "@/components/dashboard/layout"
import { MessagesPage } from "@/views/Messages"

export default function FreelancerMessagesRoute() {
  return (
    <DashboardLayout userType="freelancer" userName="Jordan Lee">
      <MessagesPage userType="freelancer" />
    </DashboardLayout>
  )
}

