import { NotificationType } from "@prisma/client"
import { type NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { jsonErr, jsonOk, zodErrorResponse } from "@/lib/api-response"
import { getContractForUser } from "@/lib/contract-access"
import { createAndEmitNotification } from "@/lib/notifications"
import { parsePagination } from "@/lib/pagination"
import { prisma } from "@/lib/prisma"
import { SOCKET_EVENTS } from "@/lib/realtime/socket-events"
import { emitToContractRoom } from "@/lib/socket-emitter"

const postSchema = z.object({
  content: z.string().min(1),
  attachmentUrl: z.string().url().optional(),
  attachmentName: z.string().optional(),
})

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  const { id: contractId } = await ctx.params

  const access = await getContractForUser(contractId, session.user.id, session.user.role ?? "FREELANCER")
  if (!access) return jsonErr("Not found", 404)

  const { skip, page, limit } = parsePagination(req.nextUrl.searchParams)
  const [total, rows] = await prisma.$transaction([
    prisma.message.count({ where: { contractId } }),
    prisma.message.findMany({
      where: { contractId },
      orderBy: { createdAt: "asc" },
      skip,
      take: limit,
      include: { sender: { select: { id: true, name: true, image: true } } },
    }),
  ])

  return jsonOk(rows, { total, page, limit })
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  const { id: contractId } = await ctx.params

  const access = await getContractForUser(contractId, session.user.id, session.user.role ?? "FREELANCER")
  if (!access) return jsonErr("Not found", 404)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonErr("Invalid JSON", 400)
  }
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) return zodErrorResponse(parsed.error)

  const recipientId =
    access.freelancerId === session.user.id ? access.businessId : access.freelancerId

  const message = await prisma.message.create({
    data: {
      contractId,
      senderId: session.user.id,
      content: parsed.data.content,
      attachmentUrl: parsed.data.attachmentUrl,
      attachmentName: parsed.data.attachmentName,
    },
    include: { sender: { select: { id: true, name: true, image: true } } },
  })

  await createAndEmitNotification({
    userId: recipientId,
    type: NotificationType.MESSAGE_RECEIVED,
    title: "New message",
    message: parsed.data.content.slice(0, 160),
    link: `/contracts/${contractId}`,
  })

  emitToContractRoom(contractId, SOCKET_EVENTS.MESSAGE_NEW, { message })

  return jsonOk(message, undefined, 201)
}
