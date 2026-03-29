import { GigStatus, NotificationType, Role } from "@prisma/client"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { jsonErr, jsonOk, zodErrorResponse } from "@/lib/api-response"
import { createAndEmitNotification } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"

const patchSchema = z.object({
  status: z.nativeEnum(GigStatus),
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

  const gig = await prisma.gig.update({
    where: { id },
    data: { status: parsed.data.status },
    include: { business: { select: { id: true } } },
  })

  if (parsed.data.status === GigStatus.FLAGGED) {
    await createAndEmitNotification({
      userId: gig.businessId,
      type: NotificationType.GIG_FLAGGED,
      title: "Gig flagged",
      message: `Your gig "${gig.title}" was flagged by moderation.`,
      link: `/business/my-gigs`,
    })
  }

  return jsonOk(gig)
}
