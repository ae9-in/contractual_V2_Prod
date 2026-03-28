"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { NotificationsPage } from "@/src/views/Notifications"

export default function BusinessNotificationsRoute() {
  return (
    <DashboardLayout userType="business" userName="Alex Rivera">
      <NotificationsPage userType="business" />
    </DashboardLayout>
  )
}
