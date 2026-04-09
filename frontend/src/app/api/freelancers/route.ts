import { Role, Prisma } from "@prisma/client"
import { type NextRequest } from "next/server"
import { z } from "zod"
import { jsonOk, zodErrorResponse } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

const querySchema = z.object({
  q: z.string().optional(),
  skills: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams.entries()))
  if (!parsed.success) return zodErrorResponse(parsed.error)
  const { page, limit, q, skills } = parsed.data
  const skip = (page - 1) * limit

  const where: Prisma.UserWhereInput = {
    role: Role.FREELANCER,
    isSuspended: false,
    approvalStatus: "APPROVED",
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { bio: { contains: q, mode: "insensitive" } },
      { headline: { contains: q, mode: "insensitive" } },
    ]
  }

  if (skills) {
    const skillNames = skills.split(",").map(s => s.trim()).filter(Boolean)
    if (skillNames.length > 0) {
      where.skills = {
        some: {
          name: { in: skillNames, mode: "insensitive" }
        }
      }
    }
  }

  const [total, rows] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        image: true,
        headline: true,
        bio: true,
        isVerified: true,
        hourlyRate: true,
        location: true,
        skills: {
          select: {
            name: true,
            level: true,
          }
        },
      },
    }),
  ])

  return jsonOk(rows, { total, page, limit })
}
