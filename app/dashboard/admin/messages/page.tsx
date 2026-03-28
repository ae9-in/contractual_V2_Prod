"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { MessagesPage } from "@/src/views/Messages"

export default function AdminMessagesRoute() {
  return (
    <DashboardLayout userType="admin" userName="Ops Admin">
      <MessagesPage userType="admin" />
    </DashboardLayout>
  )
}
