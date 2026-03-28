import { Role } from "@prisma/client"
import { type NextRequest } from "next/server"
import { auth } from "@/auth"
import { jsonErr, jsonOk } from "@/lib/api-response"
import { parsePagination } from "@/lib/pagination"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  if (session.user.role !== Role.ADMIN) return jsonErr("Forbidden", 403)

  const { skip, page, limit } = parsePagination(req.nextUrl.searchParams)
  const [total, rows] = await prisma.$transaction([
    prisma.contract.count(),
    prisma.contract.findMany({
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
      include: {
        gig: { select: { title: true } },
        freelancer: { select: { id: true, name: true, email: true } },
        business: { select: { id: true, name: true, email: true } },
      },
    }),
  ])

  return jsonOk(rows, { total, page, limit })
}
