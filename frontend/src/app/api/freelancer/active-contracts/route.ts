import { ApplicationStatus, ContractStatus, Role } from "@prisma/client"
import { auth } from "@/lib/auth"
import { jsonErr, jsonOk } from "@/lib/api-response"
import { contractProgressPercent, contractStatusLabel } from "@/lib/contract-progress"
import { prisma } from "@/lib/prisma"

const ACTIVE: ContractStatus[] = [
  ContractStatus.IN_PROGRESS,
  ContractStatus.SUBMITTED,
  ContractStatus.UNDER_REVIEW,
  ContractStatus.REVISION_REQUESTED,
]

/** Dashboard strip: active contracts tied to accepted applications. */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  if (session.user.role !== Role.FREELANCER) return jsonErr("Forbidden", 403)

  const uid = session.user.id

  const rows = await prisma.contract.findMany({
    where: {
      freelancerId: uid,
      status: { in: ACTIVE },
      application: { is: { status: ApplicationStatus.ACCEPTED } },
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
    include: {
    gig: { select: { id: true, title: true, deadline: true, budgetAmount: true, minBudget: true, maxBudget: true, currency: true } },
    business: { select: { id: true, name: true, companyName: true } },
    application: { select: { id: true, status: true } },
    _count: { select: { submissions: true } },
  },
})

const data = rows.map((c) => ({
  id: c.id,
  contractNumber: c.contractNumber,
  gigTitle: c.gig.title,
  businessName: c.business.companyName || c.business.name,
  budget: c.agreedPrice,
  minBudget: c.gig.minBudget,
  maxBudget: c.gig.maxBudget,
  currency: c.currency,
  deadline: c.deadline ?? c.gig.deadline,
  status: c.status,
  statusLabel: contractStatusLabel(c.status),
  progress: contractProgressPercent(c.status, c._count.submissions),
  startedAt: c.startedAt,
}))

  return jsonOk(data)
}
