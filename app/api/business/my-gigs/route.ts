import { ApplicationStatus, GigStatus, Role } from "@prisma/client"
import { format, formatDistanceToNow } from "date-fns"
import { auth } from "@/auth"
import { assertApprovedBusiness } from "@/lib/approval-guards"
import { jsonErr, jsonOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

type GigUiFilter = "active" | "paused" | "draft" | "closed"

function uiStatus(status: GigStatus): GigUiFilter {
  if (status === GigStatus.OPEN) return "active"
  if (status === GigStatus.PAUSED) return "paused"
  if (status === GigStatus.DRAFT) return "draft"
  return "closed"
}

function formatBudget(
  budgetType: string,
  budgetAmount: number,
  currency: string,
  minBudget?: number | null,
  maxBudget?: number | null
): { label: string; min: number; max: number } {
  const sym = "₹"
  const min = minBudget ?? budgetAmount
  const max = maxBudget ?? budgetAmount
  if (budgetType === "HOURLY") {
    const hr = Math.round(budgetAmount)
    return {
      label: `${sym}${hr.toLocaleString("en-IN")}/hr`,
      min: hr,
      max: hr,
    }
  }
  if (min !== max && (minBudget != null || maxBudget != null)) {
    return {
      label: `${sym}${Math.round(min).toLocaleString("en-IN")} – ${sym}${Math.round(max).toLocaleString("en-IN")}`,
      min,
      max,
    }
  }
  return {
    label: `${sym}${Math.round(budgetAmount).toLocaleString("en-IN")}`,
    min: budgetAmount,
    max: budgetAmount,
  }
}

function urgentOpen(deadline: Date | null, status: GigStatus): boolean {
  if (!deadline || status !== GigStatus.OPEN) return false
  const now = Date.now()
  const t = deadline.getTime()
  if (t < now) return false
  return t - now <= 3 * 86400000
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  if (session.user.role !== Role.BUSINESS) return jsonErr("Forbidden", 403)
  const ap = await assertApprovedBusiness(session.user.id)
  if (!ap.ok) return ap.res

  const businessId = session.user.id

  const gigs = await prisma.gig.findMany({
    where: { businessId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      budgetType: true,
      budgetAmount: true,
      minBudget: true,
      maxBudget: true,
      currency: true,
      isUrgent: true,
      deadline: true,
      createdAt: true,
      viewCount: true,
    },
  })

  const gigIds = gigs.map((g) => g.id)
  if (gigIds.length === 0) {
    return jsonOk({
      counts: {
        all: 0,
        active: 0,
        paused: 0,
        draft: 0,
        closed: 0,
      },
      stats: {
        totalGigs: 0,
        activeGigs: 0,
        totalApplicants: 0,
        totalViews: 0,
      },
      gigs: [] as unknown[],
    })
  }

  const [applicantsRows, pendingRows, contractsRows] = await Promise.all([
    prisma.application.groupBy({
      by: ["gigId"],
      where: {
        gigId: { in: gigIds },
        status: { not: ApplicationStatus.WITHDRAWN },
      },
      _count: true,
    }),
    prisma.application.groupBy({
      by: ["gigId"],
      where: {
        gigId: { in: gigIds },
        status: ApplicationStatus.PENDING,
      },
      _count: true,
    }),
    prisma.contract.groupBy({
      by: ["gigId"],
      where: { gigId: { in: gigIds }, businessId },
      _count: true,
    }),
  ])

  const applicantsMap = new Map(
    applicantsRows.map((r) => [r.gigId, r._count])
  )
  const pendingMap = new Map(pendingRows.map((r) => [r.gigId, r._count]))
  const contractsMap = new Map(
    contractsRows.map((r) => [r.gigId, r._count])
  )

  let totalApplicants = 0
  let totalViews = 0
  let activeGigs = 0
  let paused = 0
  let draftCount = 0
  let closed = 0

  const list = gigs.map((g) => {
    const filter = uiStatus(g.status)
    totalViews += g.viewCount
    if (g.status === GigStatus.OPEN) activeGigs++
    else if (g.status === GigStatus.PAUSED) paused++
    else if (g.status === GigStatus.DRAFT) draftCount++
    else closed++

    const applicants = applicantsMap.get(g.id) ?? 0
    totalApplicants += applicants

    const budget = formatBudget(
      g.budgetType,
      g.budgetAmount,
      g.currency,
      g.minBudget,
      g.maxBudget
    )
    const posted = formatDistanceToNow(g.createdAt, { addSuffix: true })

    return {
      id: g.id,
      title: g.title,
      category: g.category,
      status: filter,
      budget,
      applicants,
      shortlisted: pendingMap.get(g.id) ?? 0,
      hired: contractsMap.get(g.id) ?? 0,
      views: g.viewCount,
      posted,
      deadline: g.deadline
        ? format(g.deadline, "MMM d, yyyy")
        : "No deadline",
      urgent: g.isUrgent || urgentOpen(g.deadline, g.status),
      featured: false,
    }
  })

  return jsonOk({
    counts: {
      all: gigs.length,
      active: activeGigs,
      paused,
      draft: draftCount,
      closed,
    },
    stats: {
      totalGigs: gigs.length,
      activeGigs,
      totalApplicants,
      totalViews,
    },
    gigs: list,
  })
}
