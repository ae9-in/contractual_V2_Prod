import { Role } from "@prisma/client"
import { auth } from "@/lib/auth"
import { jsonErr, jsonOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, context: any) {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  if (session.user.role !== Role.BUSINESS) return jsonErr("Forbidden", 403)

  const { gigId } = await context.params;

  const gig = await prisma.gig.findUnique({
    where: { id: gigId, businessId: session.user.id },
    select: { title: true, budgetType: true, budgetAmount: true, minBudget: true, maxBudget: true, currency: true }
  })

  const applications = await prisma.application.findMany({
    where: { gigId, gig: { businessId: session.user.id } },
    orderBy: { createdAt: "desc" },
    include: {
      freelancer: {
        select: {
          id: true,
          name: true,
          image: true,
          headline: true,
          location: true,
          isVerified: true,
          skills: { select: { name: true } },
          reviewsReceived: { select: { rating: true } },
          contractsAsFreelancer: { select: { agreedPrice: true } }
        },
      },
    },
  })

  const rows = applications.map((a) => {
    const rev = a.freelancer.reviewsReceived
    const reviewCount = rev.length
    const reviewAvg = reviewCount > 0 ? rev.reduce((s, r) => s + r.rating, 0) / reviewCount : null
    const earnings = a.freelancer.contractsAsFreelancer.reduce((s, c) => s + c.agreedPrice, 0)
    return {
      id: a.id,
      status: a.status,
      proposal: a.proposal,
      proposedPrice: a.proposedPrice,
      deliveryDays: a.deliveryDays,
      createdAt: a.createdAt.toISOString(),
      freelancer: {
        id: a.freelancer.id,
        name: a.freelancer.name,
        image: a.freelancer.image,
        headline: a.freelancer.headline,
        location: a.freelancer.location,
        isVerified: a.freelancer.isVerified,
        skills: a.freelancer.skills.map((s: any) => s.name),
        reviewAvg,
        reviewCount,
        earnings,
      },
    }
  })

  return jsonOk({ gig, rows })
}
