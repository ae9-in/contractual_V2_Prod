import { Role } from "@prisma/client"
import { z } from "zod"
import { auth } from "@/auth"
import { jsonErr, jsonOk, zodErrorResponse } from "@/lib/api-response"
import { computeProfileCompleteness } from "@/lib/profile-completeness"
import { prisma } from "@/lib/prisma"

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  headline: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  hourlyRate: z.number().positive().optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal("")),
  image: z.string().url().optional().nullable(),
  availability: z.string().optional().nullable(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  if (session.user.role !== Role.FREELANCER) return jsonErr("Forbidden", 403)

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      skills: true,
      portfolio: true,
      reviewsReceived: {
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { reviewer: { select: { id: true, name: true, image: true } } },
      },
      _count: {
        select: {
          contractsAsFreelancer: true,
          applications: true,
        },
      },
    },
  })
  if (!user) return jsonErr("Not found", 404)

  const completed = await prisma.contract.count({
    where: { freelancerId: user.id, status: "COMPLETED" },
  })

  const ratings = await prisma.review.aggregate({
    where: { revieweeId: user.id },
    _avg: { rating: true },
    _count: { _all: true },
  })

  const profileCompleteness = computeProfileCompleteness(user)
  const { passwordHash: _p, ...safe } = user

  return jsonOk({
    ...safe,
    completedContracts: completed,
    avgRating: ratings._avg.rating,
    reviewCount: ratings._count._all,
    profileCompleteness,
  })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  if (session.user.role !== Role.FREELANCER) return jsonErr("Forbidden", 403)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonErr("Invalid JSON", 400)
  }
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return zodErrorResponse(parsed.error)

  const d = parsed.data
  const data: Record<string, unknown> = {}
  if (d.name !== undefined) data.name = d.name
  if (d.headline !== undefined) data.headline = d.headline || null
  if (d.bio !== undefined) data.bio = d.bio || null
  if (d.location !== undefined) data.location = d.location || null
  if (d.hourlyRate !== undefined) data.hourlyRate = d.hourlyRate
  if (d.website !== undefined) data.website = d.website || null
  if (d.image !== undefined) data.image = d.image
  if (d.availability !== undefined) data.availability = d.availability || null

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    include: { skills: true, portfolio: true },
  })

  const { passwordHash: _pw, ...safe } = user
  return jsonOk({
    ...safe,
    profileCompleteness: computeProfileCompleteness(user),
  })
}
