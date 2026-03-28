import { Role } from "@prisma/client"
import { type NextRequest } from "next/server"
import { auth } from "@/auth"
import { jsonErr, jsonOk } from "@/lib/api-response"
import { parsePagination } from "@/lib/pagination"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  const { id: gigId } = await ctx.params

  const gig = await prisma.gig.findUnique({ where: { id: gigId } })
  if (!gig) return jsonErr("Not found", 404)
  if (gig.businessId !== session.user.id && session.user.role !== Role.ADMIN) {
    return jsonErr("Forbidden", 403)
  }

  const { skip, page, limit } = parsePagination(req.nextUrl.searchParams)
  const where = { gigId }

  const [total, rows] = await prisma.$transaction([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        freelancer: {
          select: {
            id: true,
            name: true,
            image: true,
            headline: true,
            hourlyRate: true,
          },
        },
        attachments: true,
      },
    }),
  ])

  return jsonOk(rows, { total, page, limit })
}
