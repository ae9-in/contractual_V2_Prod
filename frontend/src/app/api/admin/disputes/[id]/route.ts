import { DisputeStatus, NotificationType, Role } from "@prisma/client"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { jsonErr, jsonOk, zodErrorResponse } from "@/lib/api-response"
import { createAndEmitNotification } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"

const patchSchema = z.object({
  status: z.nativeEnum(DisputeStatus),
  resolution: z.string().optional(),
})

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  if (session.user.role !== Role.ADMIN) return jsonErr("Forbidden", 403)

  const { id } = await ctx.params
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonErr("Invalid JSON", 400)
  }
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return zodErrorResponse(parsed.error)

  const dispute = await prisma.dispute.update({
    where: { id },
    data: {
      status: parsed.data.status,
      resolution: parsed.data.resolution,
    },
    include: {
      contract: true,
    },
  })

  const parties = [dispute.contract.freelancerId, dispute.contract.businessId]
  for (const uid of parties) {
    await createAndEmitNotification({
      userId: uid,
      type: NotificationType.DISPUTE_RESOLVED,
      title: "Dispute updated",
      message: "An admin updated your contract dispute.",
      link: `/contracts/${dispute.contractId}`,
    })
  }

  return jsonOk(dispute)
}
