import { DashboardLayout } from "@/components/dashboard/layout"
import dynamic from "next/dynamic"

const BusinessDashboardPage = dynamic(() => import("@/views/business/Dashboard").then((mod) => mod.BusinessDashboardPage), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-2xl bg-[var(--bg-alt)]" />,
})

export default function BusinessDashboardRoute() {
  return (
    <DashboardLayout userType="business" userName="Alex Johnson" hideHeader>
      <BusinessDashboardPage />
    </DashboardLayout>
  )
}

