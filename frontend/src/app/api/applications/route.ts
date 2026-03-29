import {
  ApplicationStatus,
  GigStatus,
  NotificationType,
  Role,
} from "@prisma/client"
import { type NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { jsonErr, jsonOk, zodErrorResponse } from "@/lib/api-response"
import { createAndEmitNotification } from "@/lib/notifications"
import { parsePagination } from "@/lib/pagination"
import { prisma } from "@/lib/prisma"
import { SOCKET_EVENTS } from "@/lib/realtime/socket-events"
import { emitToUser } from "@/lib/socket-emitter"

const applySchema = z.object({
  gigId: z.string().min(1),
  proposal: z.string().min(100),
  proposedPrice: z.number().positive().optional(),
  deliveryDays: z.number().int().positive().optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  if (session.user.role !== Role.FREELANCER) return jsonErr("Forbidden", 403)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonErr("Invalid JSON", 400)
  }
  const parsed = applySchema.safeParse(body)
  if (!parsed.success) return zodErrorResponse(parsed.error)

  const { gigId, proposal, proposedPrice, deliveryDays } = parsed.data

  const gig = await prisma.gig.findUnique({ where: { id: gigId } })
  if (!gig || gig.status !== GigStatus.OPEN) return jsonErr("Gig not available", 400)

  const existing = await prisma.application.findUnique({
    where: { freelancerId_gigId: { freelancerId: session.user.id, gigId } },
  })
  if (existing) return jsonErr("Already applied", 409)

  const application = await prisma.application.create({
    data: {
      gigId,
      freelancerId: session.user.id,
      proposal,
      proposedPrice,
      deliveryDays,
      status: ApplicationStatus.PENDING,
    },
    include: {
      freelancer: { select: { id: true, name: true, image: true } },
      gig: { select: { id: true, title: true, businessId: true } },
    },
  })

  await createAndEmitNotification({
    userId: gig.businessId,
    type: NotificationType.APPLICATION_RECEIVED,
    title: "New application",
    message: `${application.freelancer.name} applied to ${gig.title}`,
    link: `/business/applications/${gig.id}`,
  })

  emitToUser(gig.businessId, SOCKET_EVENTS.APPLICATION_NEW, {
    gigId: gig.id,
    applicationId: application.id,
    freelancerId: application.freelancerId,
  })

  return jsonOk(application, undefined, 201)
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  if (session.user.role !== Role.FREELANCER) return jsonErr("Forbidden", 403)

  const { skip, page, limit } = parsePagination(req.nextUrl.searchParams)
  const where = { freelancerId: session.user.id }

  const [total, rows] = await prisma.$transaction([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        gig: {
          include: {
            business: { select: { id: true, name: true, image: true, companyName: true } },
            requiredSkills: true,
          },
        },
        contract: { select: { id: true, status: true } },
      },
    }),
  ])

  return jsonOk(rows, { total, page, limit })
}
