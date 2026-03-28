import { Role } from "@prisma/client"
import { auth } from "@/auth"
import { jsonErr, jsonOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

/** Unread contract messages where current user is not the sender. */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  if (session.user.role !== Role.FREELANCER && session.user.role !== Role.BUSINESS) {
    return jsonErr("Forbidden", 403)
  }

  const uid = session.user.id

  const contracts = await prisma.contract.findMany({
    where:
      session.user.role === Role.FREELANCER
        ? { freelancerId: uid }
        : { businessId: uid },
    select: { id: true },
  })
  const ids = contracts.map((c) => c.id)
  if (ids.length === 0) return jsonOk({ count: 0 })

  const count = await prisma.message.count({
    where: {
      contractId: { in: ids },
      senderId: { not: uid },
      isRead: false,
    },
  })

  return jsonOk({ count })
}
