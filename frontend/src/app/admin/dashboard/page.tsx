import { DashboardLayout } from "@/components/dashboard/layout"
import dynamic from "next/dynamic"

const AdminDashboardPage = dynamic(() => import("@/views/admin/Dashboard").then((mod) => mod.AdminDashboardPage), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-2xl bg-white/5" />,
})

export default function AdminDashboardRoute() {
  return (
    <DashboardLayout userType="admin" userName="Ops Admin">
      <AdminDashboardPage />
    </DashboardLayout>
  )
}

