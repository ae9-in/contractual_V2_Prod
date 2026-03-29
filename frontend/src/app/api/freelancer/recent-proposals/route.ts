import { Role } from "@prisma/client"
import { auth } from "@/lib/auth"
import { jsonErr, jsonOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  if (session.user.role !== Role.FREELANCER) return jsonErr("Forbidden", 403)

  const rows = await prisma.application.findMany({
    where: { freelancerId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      gig: {
        select: {
          title: true,
          budgetAmount: true,
          currency: true,
          business: { select: { name: true, companyName: true, image: true } },
        },
      },
    },
  })

  const data = rows.map((a) => ({
    id: a.id,
    gigTitle: a.gig.title,
    company: a.gig.business.companyName || a.gig.business.name,
    bidAmount: a.proposedPrice ?? a.gig.budgetAmount,
    currency: a.gig.currency,
    status: a.status,
    createdAt: a.createdAt,
  }))

  return jsonOk(data)
}
