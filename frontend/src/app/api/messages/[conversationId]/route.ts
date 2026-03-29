import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { jsonErr, jsonOk, zodErrorResponse } from "@/lib/api-response"
import { z } from "zod"
import { MessageType } from "@prisma/client"

const messageSchema = z.object({
  content: z.string().max(2000).optional(),
  imageUrl: z.string().url().max(500).optional(),
  imageName: z.string().max(200).optional(),
  imageSize: z.number().int().max(2097152).optional(), // 2MB
  type: z.enum([MessageType.TEXT, MessageType.IMAGE]).default(MessageType.TEXT),
})

async function verifyAccess(conversationId: string, userId: string) {
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { freelancerId: true, businessId: true },
  })
  if (!conv) throw new Error("NOT_FOUND")
  if (conv.freelancerId !== userId && conv.businessId !== userId)
    throw new Error("FORBIDDEN")
  return conv
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) return jsonErr("Unauthorized", 401)

    const { conversationId } = await params
    const userId = session.user.id

    try {
      await verifyAccess(conversationId, userId)
    } catch (e: any) {
      if (e.message === "NOT_FOUND") return jsonErr("Not found", 404)
      return jsonErr("Forbidden", 403)
    }

    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get("cursor")
    const take = 30

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: take + 1,
      include: {
        sender: {
          select: { id: true, name: true, image: true, role: true },
        },
      },
    })

    const hasMore = messages.length > take
    if (hasMore) messages.pop()

    await prisma.$executeRaw`
      UPDATE "Message" SET "readBy" = array_append("readBy", ${userId})
      WHERE "conversationId" = ${conversationId}
        AND "senderId" != ${userId}
        AND NOT (${userId} = ANY("readBy"))
    `

    messages.reverse()

    return jsonOk({
      messages,
      hasMore,
      nextCursor: hasMore ? messages[0]?.createdAt?.toISOString() : null,
    })
  } catch (e: any) {
    console.error("[GET /api/messages/[conversationId]]", e)
    return jsonErr("Internal server error", 500)
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) return jsonErr("Unauthorized", 401)

    const { conversationId } = await params
    const userId = session.user.id

    try {
      await verifyAccess(conversationId, userId)
    } catch (e: any) {
      if (e.message === "NOT_FOUND") return jsonErr("Not found", 404)
      return jsonErr("Forbidden", 403)
    }

    const body = await req.json()
    const parsed = messageSchema.safeParse(body)
    if (!parsed.success) return zodErrorResponse(parsed.error)
    
    const { content, imageUrl, imageName, imageSize, type } = parsed.data

    if (type === "TEXT" && !content?.trim()) {
      return jsonErr("Content is required for text messages", 400)
    }
    if (type === "IMAGE" && !imageUrl) {
      return jsonErr("Image URL required", 400)
    }

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          content: content?.trim() || null,
          imageUrl: imageUrl || null,
          imageName: imageName || null,
          imageSize: imageSize || null,
          type,
          readBy: [userId],
        },
        include: {
          sender: {
            select: { id: true, name: true, image: true, role: true },
          },
        },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      }),
    ])

    try {
      const { emitToUser } = await import("@/lib/socket-emitter")
      const conv = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { freelancerId: true, businessId: true },
      })
      if (conv) {
        const recipientId =
          conv.freelancerId === userId ? conv.businessId : conv.freelancerId
        emitToUser(recipientId, "message:new", {
          conversationId,
          message,
        })
      }
    } catch (err) {
      console.warn("[Socket emit Error]:", err)
    }

    return jsonOk(message)
  } catch (e: any) {
    console.error("[POST /api/messages/[conversationId]]", e)
    return jsonErr("Internal server error", 500)
  }
}
