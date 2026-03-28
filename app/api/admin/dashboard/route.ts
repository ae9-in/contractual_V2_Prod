import { auth } from "@/auth"
import { jsonErr, jsonOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { Role, ApprovalStatus, GigStatus, ContractStatus } from "@prisma/client"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== Role.ADMIN) return jsonErr("Unauthorized", 401)

  const [
    totalUsers,
    activeGigs,
    contractsToday,
    totalRevenue,
    pendingDisputes,
    pendingBusinesses,
    flaggedGigs,
    recentActivity
  ] = await Promise.all([
    prisma.user.count(),
    prisma.gig.count({ where: { status: GigStatus.OPEN } }),
    prisma.contract.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    prisma.contract.aggregate({
      where: { status: ContractStatus.COMPLETED },
      _sum: { agreedPrice: true }
    }),
    prisma.dispute.count({ where: { status: "OPEN" } }),
    prisma.user.count({ 
      where: { 
        role: Role.BUSINESS, 
        approvalStatus: ApprovalStatus.PENDING 
      } 
    }),
    prisma.gig.count({ where: { status: GigStatus.FLAGGED } }),
    prisma.platformActivityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { name: true, role: true } } }
    })
  ])

  return jsonOk({
    stats: {
      totalUsers,
      activeGigs,
      contractsToday,
      totalRevenue: totalRevenue._sum.agreedPrice || 0,
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
    }))
  })
}
