import { ApplicationStatus, Role } from "@prisma/client"
import { auth } from "@/auth"
import { assertApprovedBusiness } from "@/lib/approval-guards"
import { jsonErr, jsonOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

/** Pending applications + unread contract messages for business sidebar. */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  if (session.user.role !== Role.BUSINESS) return jsonErr("Forbidden", 403)
  const ap = await assertApprovedBusiness(session.user.id)
  if (!ap.ok) return ap.res

  const bid = session.user.id

  const [pendingApplications, contracts] = await Promise.all([
    prisma.application.count({
      where: {
        status: ApplicationStatus.PENDING,
        gig: { businessId: bid },
      },
    }),
    prisma.contract.findMany({
      where: { businessId: bid },
      select: { id: true },
    }),
  ])

  const ids = contracts.map((c) => c.id)
  const unreadMessages =
    ids.length === 0
      ? 0
      : await prisma.message.count({
          where: {
            contractId: { in: ids },
            senderId: { not: bid },
            isRead: false,
          },
        })

  return jsonOk({
    pendingApplications,
    unreadMessages,
  })
}
