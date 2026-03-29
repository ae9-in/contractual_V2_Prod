import { auth } from "@/lib/auth"
import { jsonErr, jsonOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { subDays, startOfDay } from "date-fns"
import { Role, ApprovalStatus, GigStatus, ContractStatus } from "@prisma/client"
import { getCached, setCached } from "@/lib/cache"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== Role.ADMIN) return jsonErr("Unauthorized", 401)

  const cacheKey = "admin:dashboard:summary"
  const cached = getCached<any>(cacheKey)
  if (cached) return jsonOk(cached)

  const now = new Date()
  const todayStart = startOfDay(now)
  const last7Days = subDays(todayStart, 7)

  const [
    totalUsers,
    activeGigs,
    contractsToday,
    revenueSum,
    pendingDisputes,
    pendingBusinesses,
    flaggedGigs,
    recentActivity,
    weeklyRevenue,
    topGigs
  ] = await Promise.all([
    prisma.user.count(),
    prisma.gig.count({ where: { status: GigStatus.OPEN } }),
    prisma.contract.count({
      where: { createdAt: { gte: todayStart } }
    }),
    prisma.contract.aggregate({
      where: { status: ContractStatus.COMPLETED },
      _sum: { agreedPrice: true }
    }),
    prisma.dispute.count({ where: { status: "OPEN" } }),
    prisma.user.count({ 
      where: { role: Role.BUSINESS, approvalStatus: ApprovalStatus.PENDING } 
    }),
    prisma.gig.count({ where: { status: GigStatus.FLAGGED } }),
    prisma.platformActivityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { name: true, role: true } } }
    }),
    prisma.contract.findMany({
      where: { 
        status: ContractStatus.COMPLETED,
        completedAt: { gte: last7Days }
      },
      select: { agreedPrice: true, completedAt: true }
    }),
    prisma.gig.findMany({
      take: 5,
      orderBy: { applications: { _count: "desc" } },
      select: { 
        id: true, 
        title: true, 
        budgetAmount: true, 
        currency: true,
        _count: { select: { applications: true } }
      }
    })
  ])

  const payload = {
    stats: {
      totalUsers,
      activeGigs,
      contractsToday,
      totalRevenue: revenueSum._sum.agreedPrice || 0,
      pendingDisputes,
      pendingBusinesses,
      flaggedGigs
    },
    recentActivity: recentActivity.map(a => ({
      id: a.id,
      type: a.type,
      message: a.message,
      createdAt: a.createdAt,
      user: a.user
    })),
    topGigs,
    weeklyRevenue
  }

  setCached(cacheKey, payload, 30) // 30s TTL
  return jsonOk(payload)
}
