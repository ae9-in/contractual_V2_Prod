import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { jsonErr, jsonOk } from "@/lib/api-response"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return jsonErr("Unauthorized", 401)

    const userId = session.user.id

    // Count messages NOT sent by current user AND not in their readBy array
    const count = await prisma.message.count({
      where: {
        conversation: {
          OR: [{ freelancerId: userId }, { businessId: userId }],
        },
        NOT: { senderId: userId },
        readBy: { isEmpty: true }, // Fallback: count messages with empty readBy
      },
    })

    // More accurate: count messages where readBy doesn't contain userId
    // Prisma doesn't support NOT has easily on scalar lists with count,
    // so we do a raw count
    const result = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM "Message" m
      JOIN "Conversation" c ON m."conversationId" = c.id
      WHERE (c."freelancerId" = ${userId} OR c."businessId" = ${userId})
        AND m."senderId" != ${userId}
        AND NOT (${userId} = ANY(m."readBy"))
    `
    const unreadCount = Number(result[0]?.count ?? 0)

    return jsonOk({ count: unreadCount })
  } catch (e: any) {
    console.error("[GET /api/messages/unread-count]", e)
    return jsonErr(e.message || "Internal error", 500)
  }
}
