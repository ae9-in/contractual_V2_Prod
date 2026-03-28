import { type NextRequest } from "next/server"
import { auth } from "@/auth"
import { jsonErr, jsonOk } from "@/lib/api-response"
import { parsePagination } from "@/lib/pagination"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  const { id: userId } = await ctx.params

  const { skip, page, limit } = parsePagination(req.nextUrl.searchParams)
  const where = { revieweeId: userId }

  const [total, rows] = await prisma.$transaction([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        reviewer: { select: { id: true, name: true, image: true } },
        contract: { select: { id: true, gig: { select: { title: true } } } },
      },
    }),
  ])

  return jsonOk(rows, { total, page, limit })
}
