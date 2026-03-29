import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { jsonErr, jsonOk } from "@/lib/api-response"

const typingTimestamps = new Map<string, number>()

export async function POST(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) return jsonErr("Unauthorized", 401)

    const { conversationId } = await params
    const userId = session.user.id

    // Verify access
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { freelancerId: true, businessId: true },
    })
    if (!conv) return jsonErr("Not found", 404)
    if (conv.freelancerId !== userId && conv.businessId !== userId) {
      return jsonErr("Forbidden", 403)
    }

    // Rate limit: max 1 event per 2 seconds per user
    const key = `${userId}:${conversationId}`
    const lastTime = typingTimestamps.get(key) || 0
    const now = Date.now()
    if (now - lastTime < 2000) {
      return jsonOk({ throttled: true })
    }
    typingTimestamps.set(key, now)

    const body = await req.json()
    const { isTyping } = body

    // Emit socket event
    try {
      const { emitToUser } = await import("@/lib/socket-emitter")
      const recipientId =
        conv.freelancerId === userId ? conv.businessId : conv.freelancerId
      emitToUser(recipientId, isTyping ? "typing:start" : "typing:stop", {
        conversationId,
        userId,
        userName: session.user.name || "User",
      })
    } catch {
      // Fire and forget
    }

    return jsonOk({ ok: true })
  } catch (e: any) {
    console.error("[POST /api/messages/[conversationId]/typing]", e)
    return jsonErr(e.message || "Internal error", 500)
  }
}
