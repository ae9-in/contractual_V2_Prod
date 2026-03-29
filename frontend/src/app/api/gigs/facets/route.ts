import { GigStatus, Prisma } from "@prisma/client"
import type { NextRequest } from "next/server"
import { z } from "zod"
import { jsonOk, zodErrorResponse } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

const querySchema = z.object({
  q: z.string().optional(),
  search: z.string().optional(),
})

type FacetCount = { name: string; count: number }

export async function GET(req: NextRequest) {
  const raw = Object.fromEntries(req.nextUrl.searchParams.entries())
  const parsed = querySchema.safeParse(raw)
  if (!parsed.success) return zodErrorResponse(parsed.error)

  const searchText = parsed.data.search ?? parsed.data.q
  const now = new Date()

  const where: Prisma.GigWhereInput = {
    status: GigStatus.OPEN,
    AND: [{ OR: [{ deadline: null }, { deadline: { gte: now } }] }] as Prisma.GigWhereInput[],
  }

  if (searchText) {
    ;(where.AND as Prisma.GigWhereInput[]).push({
      OR: [
        { title: { contains: searchText, mode: "insensitive" } },
        { description: { contains: searchText, mode: "insensitive" } },
      ],
    })
  }

  const [categories, levels, urgentCount] = await prisma.$transaction([
    prisma.gig.groupBy({
      by: ["category"],
      where,
      _count: { _all: true },
    }),
    prisma.gig.groupBy({
      by: ["experienceLevel"],
      where,
      _count: { _all: true },
    }),
    prisma.gig.count({
      where: { ...where, isUrgent: true },
    }),
  ])

  const categoryCounts: FacetCount[] = categories
    .map((c) => ({ name: c.category, count: c._count._all }))
    .filter((c) => c.name)
    .sort((a, b) => b.count - a.count)

  const levelCounts: FacetCount[] = levels
    .map((l) => ({ name: l.experienceLevel, count: l._count._all }))
    .filter((l) => l.name)
    .sort((a, b) => b.count - a.count)

  return jsonOk({
    categories: categoryCounts,
    experienceLevels: levelCounts,
    urgentCount,
  })
}

