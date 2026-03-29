import { redirect } from "next/navigation"
import { AdminDashboardView, AdminStats } from "@/components/admin/admin-dashboard-view"
import { requireWorkspaceAdmin } from "@/lib/workspace-admin/require-admin-api"
import { prisma } from "@/lib/prisma"
import { Role, ApprovalStatus, ContractStatus } from "@prisma/client"
import { startOfDay } from "date-fns"
import { formatCurrency } from "@/lib/currency"

export default async function WorkspaceAdminDashboardPage() {
  const admin = await requireWorkspaceAdmin()
  if (!admin.ok) return redirect("/workspace-admin")

  const now = new Date()
  const dayStart = startOfDay(now)

  const [
    totalUsers,
    usersToday,
    totalBusiness,
    pendingBusiness,
    totalFreelancer,
    activeGigs,
    totalContracts,
    completedContracts,
    revenueAgg,
    revenueMonth,
    pendingList,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: dayStart } } }),
    prisma.user.count({ where: { role: Role.BUSINESS } }),
    prisma.user.count({ where: { role: Role.BUSINESS, approvalStatus: ApprovalStatus.PENDING } }),
    prisma.user.count({ where: { role: Role.FREELANCER } }),
    prisma.gig.count({ where: { status: "OPEN" } }),
    prisma.contract.count(),
    prisma.contract.count({ where: { status: ContractStatus.COMPLETED } }),
    prisma.contract.aggregate({
      where: { status: ContractStatus.COMPLETED },
      _sum: { platformFee: true, agreedPrice: true },
    }),
    prisma.contract.aggregate({
      where: {
        status: ContractStatus.COMPLETED,
        completedAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
      },
      _sum: { platformFee: true },
    }),
    prisma.user.findMany({
      where: { role: Role.BUSINESS, approvalStatus: ApprovalStatus.PENDING },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        createdAt: true,
      },
    }),
  ])

  const totalRevenue = Math.round(revenueAgg._sum.platformFee ?? 0)
  const monthRev = Math.round(revenueMonth._sum.platformFee ?? 0)

  const initialData: AdminStats = JSON.parse(JSON.stringify({
    kpis: {
      totalUsers,
      usersToday,
      totalBusiness,
      pendingBusiness,
      totalFreelancer,
      activeGigs,
      totalContracts,
      completedContracts,
      totalRevenueFormatted: formatCurrency(totalRevenue),
      monthRevenueFormatted: formatCurrency(monthRev),
    },
    pendingBusinesses: pendingList,
  }))

  return <AdminDashboardView initialData={initialData} />
}
