import { GigStatus, Role } from "@prisma/client"
import { type NextRequest } from "next/server"
import { jsonOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? ""
  const mode = req.nextUrl.searchParams.get("mode") ?? "jobs" // "jobs" | "talent"

  if (q.length < 2) {
    return jsonOk([])
  }

  if (mode === "jobs") {
    const gigs = await prisma.gig.findMany({
      where: {
        status: GigStatus.OPEN,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: {
        id: true,
        title: true,
        category: true,
        budgetAmount: true,
        currency: true,
      },
    })

    return jsonOk(gigs.map(g => ({
      id: g.id,
      title: g.title,
      subtitle: g.category,
      type: "job",
      price: `${g.currency} ${g.budgetAmount}`,
      url: `/gig/${g.id}`
    })))
  } else {
    const freelancers = await prisma.user.findMany({
      where: {
        role: Role.FREELANCER,
        isSuspended: false,
        approvalStatus: "APPROVED",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { headline: { contains: q, mode: "insensitive" } },
          { bio: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: {
        id: true,
        name: true,
        headline: true,
        image: true,
      },
    })

    return jsonOk(freelancers.map(f => ({
      id: f.id,
      title: f.name,
      subtitle: f.headline || "Freelancer",
      type: "talent",
      image: f.image,
      url: `/freelancer/${f.id}`
    })))
  }
}
