
import { DashboardLayout } from "@/components/dashboard/layout"
import { MessagesPage } from "@/views/Messages"

export default function BusinessMessagesRoute() {
  return (
    <DashboardLayout userType="business" userName="Alex Rivera">
      <MessagesPage userType="business" />
    </DashboardLayout>
  )
}

