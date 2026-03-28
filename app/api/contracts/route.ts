import { type NextRequest } from "next/server"
import { auth } from "@/auth"
import { jsonErr, jsonOk } from "@/lib/api-response"
import { parsePagination } from "@/lib/pagination"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)

  const { skip, page, limit } = parsePagination(req.nextUrl.searchParams)
  const uid = session.user.id

  const where = {
    OR: [{ freelancerId: uid }, { businessId: uid }],
  }

  const [total, rows] = await prisma.$transaction([
    prisma.contract.count({ where }),
    prisma.contract.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
      include: {
        gig: { select: { id: true, title: true, category: true } },
        freelancer: { select: { id: true, name: true, image: true } },
        business: { select: { id: true, name: true, image: true, companyName: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
            isRead: true,
          },
        },
        _count: {
          select: {
            messages: true,
            submissions: true,
          },
        },
      },
    }),
  ])

  return jsonOk(rows, { total, page, limit })
}
