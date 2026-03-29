import { ContractStatus, GigStatus, Role } from "@prisma/client"
import { endOfMonth, format, startOfDay, startOfMonth, subMonths } from "date-fns"
import { auth } from "@/lib/auth"
import { assertApprovedBusiness } from "@/lib/approval-guards"
import { jsonErr, jsonOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

function gigStatusLabel(s: GigStatus): "Active" | "Paused" | "Closed" | "Draft" {
  if (s === GigStatus.OPEN) return "Active"
  if (s === GigStatus.PAUSED) return "Paused"
  if (s === GigStatus.DRAFT) return "Draft"
  return "Closed"
}

const ACTIVE_CONTRACT: ContractStatus[] = [
  ContractStatus.PENDING,
  ContractStatus.IN_PROGRESS,
  ContractStatus.SUBMITTED,
  ContractStatus.UNDER_REVIEW,
  ContractStatus.REVISION_REQUESTED,
]

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  if (session.user.role !== Role.BUSINESS) return jsonErr("Forbidden", 403)
  const ap = await assertApprovedBusiness(session.user.id)
  if (!ap.ok) return ap.res

  const bid = session.user.id
  const now = new Date()
  const dayStart = startOfDay(now)
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const [
    totalGigsPosted,
    gigsThisWeek,
    totalApplications,
    applicationsToday,
    activeContracts,
    contractsEndingSoon,
    spentCompleted,
    gigsRows,
    notificationsFeed,
    monthlyRows,
  ] = await Promise.all([
    prisma.gig.count({ where: { businessId: bid } }),
    prisma.gig.count({
      where: { businessId: bid, createdAt: { gte: weekStart } },
    }),
    prisma.application.count({
      where: { gig: { businessId: bid } },
    }),
    prisma.application.count({
      where: {
        gig: { businessId: bid },
        createdAt: { gte: dayStart },
      },
    }),
    prisma.contract.count({
      where: { businessId: bid, status: { in: ACTIVE_CONTRACT } },
    }),
    prisma.contract.count({
      where: {
        businessId: bid,
        status: { in: ACTIVE_CONTRACT },
        deadline: {
          not: null,
          lte: new Date(now.getTime() + 14 * 86400000),
          gte: now,
        },
      },
    }),
    prisma.contract.aggregate({
      where: { businessId: bid, status: ContractStatus.COMPLETED },
      _sum: { agreedPrice: true },
    }),
    prisma.gig.findMany({
      where: { businessId: bid },
      orderBy: { updatedAt: "desc" },
      take: 12,
      include: {
        _count: { select: { applications: true } },
      },
    }),
    prisma.notification.findMany({
      where: { userId: bid },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.contract.findMany({
      where: {
        businessId: bid,
        status: ContractStatus.COMPLETED,
        completedAt: { not: null },
      },
      select: { agreedPrice: true, completedAt: true },
    }),
  ])

  const totalSpent = spentCompleted._sum.agreedPrice ?? 0

  const monthBuckets: { month: string; v: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const m = subMonths(now, i)
    const start = startOfMonth(m)
    const end = endOfMonth(m)
    let v = 0
    for (const c of monthlyRows) {
      if (!c.completedAt) continue
      const t = c.completedAt.getTime()
      if (t >= start.getTime() && t <= end.getTime()) {
        v += c.agreedPrice
      }
    }
    monthBuckets.push({ month: format(m, "MMM"), v: Math.round(v) })
  }

  const appsForApplicants = await prisma.application.findMany({
    where: { gig: { businessId: bid } },
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      freelancer: {
        select: {
          id: true,
          name: true,
          headline: true,
          hourlyRate: true,
          image: true,
          reviewsReceived: { select: { rating: true } },
        },
      },
    },
  })

  const seen = new Set<string>()
  const topApplicants: {
    id: string
    name: string
    skill: string
    rate: string
    rating: string
    initials: string
  }[] = []

  for (const a of appsForApplicants) {
    const f = a.freelancer
    if (seen.has(f.id)) continue
    seen.add(f.id)
    const ratings = f.reviewsReceived.map((r) => r.rating)
    const avg =
      ratings.length > 0
        ? ratings.reduce((s, x) => s + x, 0) / ratings.length
        : null
    const nm = f.name.trim().split(/\s+/)
    const initials =
      nm.length >= 2 ? (nm[0]![0] + nm[1]![0]).toUpperCase() : f.name.slice(0, 2).toUpperCase()
    topApplicants.push({
      id: f.id,
      name: f.name,
      skill: f.headline?.trim() || "Freelancer",
      rate:
        f.hourlyRate != null
          ? `₹${Math.round(f.hourlyRate)}/hr`
          : "—",
      rating: avg != null ? avg.toFixed(1) : "—",
      initials,
    })
    if (topApplicants.length >= 6) break
  }

  const gigsTable = gigsRows.map((g) => {
    let budgetLabel = `₹${g.budgetAmount.toLocaleString("en-IN")}`
    if (g.budgetType === "HOURLY") {
      budgetLabel = `₹${g.budgetAmount.toLocaleString("en-IN")}/hr`
    } else if (g.minBudget != null && g.maxBudget != null && g.minBudget !== g.maxBudget) {
      budgetLabel = `₹${g.minBudget.toLocaleString("en-IN")} - ₹${g.maxBudget.toLocaleString("en-IN")}`
    }
    return {
      id: g.id,
      title: g.title,
      applications: g._count.applications,
      status: gigStatusLabel(g.status),
      budget: budgetLabel,
    }
  })

  const activity = notificationsFeed.map((n) => ({
    id: n.id,
    title: n.title,
    sub: n.message,
    time: format(n.createdAt, "MMM d, h:mm a"),
    dot: n.isRead ? "#94a3b8" : "#3b82f6",
  }))

  const firstName = (session.user.name ?? "there").split(/\s+/)[0] ?? "there"

  return jsonOk({
    user: { firstName, name: session.user.name ?? "Business" },
    stats: {
      totalGigsPosted,
      gigsThisWeek,
      totalApplications,
      applicationsToday,
      activeContracts,
      contractsEndingSoon,
      totalSpent,
    },
    trends: {
      gigsWeek: gigsThisWeek > 0 ? `+${gigsThisWeek} this week` : "No new gigs this week",
      appsToday:
        applicationsToday > 0
          ? `+${applicationsToday} today`
          : "No new applications today",
      contractsSoon:
        contractsEndingSoon > 0
          ? `${contractsEndingSoon} ending soon`
          : "None ending soon",
      spendMonth:
        monthBuckets[monthBuckets.length - 1]?.v != null
          ? `₹${monthBuckets[monthBuckets.length - 1]!.v.toLocaleString("en-IN")} this month`
          : "—",
    },
    gigs: gigsTable,
    topApplicants,
    activity,
    monthlySpend: monthBuckets,
  })
}
