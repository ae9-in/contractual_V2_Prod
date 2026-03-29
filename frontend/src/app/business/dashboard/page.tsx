import { auth } from "@/lib/auth"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import { BusinessDashboardHome } from "@/components/business/business-dashboard-home"
import { prisma } from "@/lib/prisma"
import { assertApprovedBusiness } from "@/lib/approval-guards"
import { endOfMonth, format, startOfDay, startOfMonth, subMonths } from "date-fns"

export default async function BusinessDashboardRoute() {
  const session = await auth()
  if (!session?.user?.id) return redirect("/login")
  if (session.user.role !== Role.BUSINESS) return redirect("/")

  const ap = await assertApprovedBusiness(session.user.id)
  if (!ap.ok) return redirect("/business/profile") // or appropriate pending page

  const bid = session.user.id
  const now = new Date()
  const dayStart = startOfDay(now)
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const ACTIVE_CONTRACT = ["PENDING", "IN_PROGRESS", "SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED"]

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
    prisma.gig.count({ where: { businessId: bid, createdAt: { gte: weekStart } } }),
    prisma.application.count({ where: { gig: { businessId: bid } } }),
    prisma.application.count({ where: { gig: { businessId: bid }, createdAt: { gte: dayStart } } }),
    prisma.contract.count({ where: { businessId: bid, status: { in: ACTIVE_CONTRACT as any } } }),
    prisma.contract.count({
      where: {
        businessId: bid,
        status: { in: ACTIVE_CONTRACT as any },
        deadline: {
          not: null,
          lte: new Date(now.getTime() + 14 * 86400000),
          gte: now,
        },
      },
    }),
    prisma.contract.aggregate({
      where: { businessId: bid, status: "COMPLETED" },
      _sum: { agreedPrice: true },
    }),
    prisma.gig.findMany({
      where: { businessId: bid },
      orderBy: { updatedAt: "desc" },
      take: 12,
      include: { _count: { select: { applications: true } } },
    }),
    prisma.notification.findMany({
      where: { userId: bid },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.contract.findMany({
      where: { businessId: bid, status: "COMPLETED", completedAt: { not: null } },
      select: { agreedPrice: true, completedAt: true },
    }),
  ])

  // Fetch top applicants - missing in current logic
  const appsForApplicants = await prisma.application.findMany({
    where: { gig: { businessId: bid } },
    orderBy: { createdAt: "desc" },
    take: 30,
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
  const topApplicants: any[] = []
  for (const a of appsForApplicants) {
    const f = a.freelancer
    if (seen.has(f.id)) continue
    seen.add(f.id)
    const ratings = f.reviewsReceived.map((r) => r.rating)
    const avg = ratings.length > 0 ? ratings.reduce((s, x) => s + x, 0) / ratings.length : null
    const nm = f.name.trim().split(/\s+/)
    const initials = nm.length >= 2 ? (nm[0]![0] + nm[1]![0]).toUpperCase() : f.name.slice(0, 2).toUpperCase()
    topApplicants.push({
      id: f.id,
      name: f.name,
      skill: f.headline?.trim() || "Freelancer",
      rate: f.hourlyRate != null ? `₹${Math.round(f.hourlyRate)}/hr` : "—",
      rating: avg != null ? avg.toFixed(1) : "—",
      initials,
    })
    if (topApplicants.length >= 6) break
  }

  // Process data for frontend
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
        v += (c.agreedPrice || 0)
      }
    }
    monthBuckets.push({ month: format(m, "MMM"), v: Math.round(v) })
  }

  const payload = JSON.parse(JSON.stringify({
    user: { firstName: (session.user.name ?? "").split(" ")[0], name: session.user.name },
    stats: {
      totalGigsPosted,
      gigsThisWeek,
      totalApplications,
      applicationsToday,
      activeContracts,
      contractsEndingSoon,
      totalSpent: spentCompleted._sum.agreedPrice || 0,
    },
    trends: {
      gigsWeek: gigsThisWeek > 0 ? `+${gigsThisWeek} this week` : "No new gigs this week",
      appsToday: applicationsToday > 0 ? `+${applicationsToday} today` : "No new applications today",
      contractsSoon: contractsEndingSoon > 0 ? `${contractsEndingSoon} ending soon` : "None ending soon",
      spendMonth: monthBuckets[monthBuckets.length - 1]?.v != null 
        ? `₹${monthBuckets[monthBuckets.length - 1]!.v.toLocaleString("en-IN")} this month` 
        : "—",
    },
    topApplicants,
    gigs: gigsRows.map(g => ({
      id: g.id,
      title: g.title,
      applications: g._count.applications,
      status: g.status === "OPEN" ? "Active" : g.status === "PAUSED" ? "Paused" : "Closed",
      budget: (g.minBudget != null && g.maxBudget != null && (g.minBudget !== g.maxBudget || g.minBudget > 0))
        ? (g.minBudget === g.maxBudget 
            ? `₹${g.minBudget.toLocaleString("en-IN")}${g.budgetType === "HOURLY" ? "/hr" : ""}`
            : `₹${g.minBudget.toLocaleString("en-IN")} - ₹${g.maxBudget.toLocaleString("en-IN")}${g.budgetType === "HOURLY" ? "/hr" : ""}`)
        : `₹${g.budgetAmount.toLocaleString("en-IN")}${g.budgetType === "HOURLY" ? "/hr" : ""}`,
    })),
    activity: notificationsFeed.map(n => ({
      id: n.id,
      title: n.title,
      sub: n.message,
      time: format(n.createdAt, "MMM d, h:mm a"),
      dot: n.isRead ? "#94a3b8" : "#3b82f6",
    })),
    monthlySpend: monthBuckets,
  }))

  return <BusinessDashboardHome initialData={payload} />
}
