import { ApplicationStatus, GigStatus, Role } from "@prisma/client"
import { z } from "zod"
import { auth } from "@/auth"
import { jsonErr, jsonOk, zodErrorResponse } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: z.string().optional(),
  budgetAmount: z.number().positive().optional(),
  deadline: z.string().datetime().nullable().optional(),
  experienceLevel: z.enum(["BEGINNER", "INTERMEDIATE", "EXPERT"]).optional(),
  status: z.nativeEnum(GigStatus).optional(),
})

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const session = await auth()

  const gig = await prisma.gig.findUnique({
    where: { id },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          image: true,
          isVerified: true,
          companyName: true,
          companyDesc: true,
          industry: true,
          phone: true,
        },
      },
      requiredSkills: true,
      attachments: true,
      _count: { select: { applications: true } },
    },
  })
  if (!gig) return jsonErr("Not found", 404)

  await prisma.gig.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  })

  let viewerApplication: { id: string; status: ApplicationStatus } | null = null
  if (session?.user?.id && session.user.role === Role.FREELANCER) {
    const app = await prisma.application.findUnique({
      where: {
        freelancerId_gigId: { freelancerId: session.user.id, gigId: id },
      },
      select: { id: true, status: true },
    })
    viewerApplication = app
  }

  return jsonOk({ ...gig, viewerApplication })
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  const { id } = await ctx.params

  const gig = await prisma.gig.findUnique({ where: { id } })
  if (!gig) return jsonErr("Not found", 404)
  if (gig.businessId !== session.user.id && session.user.role !== Role.ADMIN) {
    return jsonErr("Forbidden", 403)
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonErr("Invalid JSON", 400)
  }
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return zodErrorResponse(parsed.error)

  const u = parsed.data
  const updated = await prisma.gig.update({
    where: { id },
    data: {
      ...u,
      deadline: u.deadline === undefined ? undefined : u.deadline ? new Date(u.deadline) : null,
    },
    include: {
      business: { select: { id: true, name: true, image: true, companyName: true } },
      requiredSkills: true,
      _count: { select: { applications: true } },
    },
  })
  return jsonOk(updated)
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  const { id } = await ctx.params

  const gig = await prisma.gig.findUnique({ where: { id } })
  if (!gig) return jsonErr("Not found", 404)
  if (gig.businessId !== session.user.id && session.user.role !== Role.ADMIN) {
    return jsonErr("Forbidden", 403)
  }

  await prisma.gig.delete({ where: { id } })
  return jsonOk({ id, deleted: true })
}
