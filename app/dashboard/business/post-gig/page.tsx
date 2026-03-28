"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { PostGigWizardPage } from "@/src/views/business/PostGig"

export default function PostGigRoute() {
  return (
    <DashboardLayout userType="business" userName="Alex Rivera">
      <PostGigWizardPage />
    </DashboardLayout>
  )
}
