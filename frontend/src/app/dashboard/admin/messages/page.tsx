
import { DashboardLayout } from "@/components/dashboard/layout"
import { MessagesPage } from "@/views/Messages"

export default function AdminMessagesRoute() {
  return (
    <DashboardLayout userType="admin" userName="Ops Admin">
      <MessagesPage userType="admin" />
    </DashboardLayout>
  )
}

