import { DashboardLayout } from "@/components/dashboard/layout"
import dynamic from "next/dynamic"

const FreelancerDashboardPage = dynamic(() => import("@/views/freelancer/Dashboard").then((mod) => mod.FreelancerDashboardPage), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-2xl bg-[var(--bg-alt)]" />,
})

export default function FreelancerDashboardRoute() {
  return (
    <DashboardLayout userType="freelancer" userName="Jordan Lee">
      <FreelancerDashboardPage />
    </DashboardLayout>
  )
}

