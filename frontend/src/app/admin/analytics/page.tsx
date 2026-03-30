
import { DashboardLayout } from "@/components/dashboard/layout"
import dynamic from "next/dynamic"

const AdminAnalyticsPage = dynamic(() => import("@/views/admin/ExtraAdminPages").then((mod) => mod.AdminAnalyticsPage), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-2xl bg-white/5" />,
})

export default function Page() {
  return (
    <DashboardLayout userType="admin" userName="Ops Admin">
      <AdminAnalyticsPage />
    </DashboardLayout>
  )
}

