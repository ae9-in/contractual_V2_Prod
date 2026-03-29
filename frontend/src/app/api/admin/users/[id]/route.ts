import { Role, ApprovalStatus, NotificationType } from "@prisma/client"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { jsonErr, jsonOk, zodErrorResponse } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { createAndEmitNotification } from "@/lib/notifications"
import { logPlatformActivity } from "@/lib/platform-activity"

const patchSchema = z.object({
  isSuspended: z.boolean().optional(),
  approvalStatus: z.nativeEnum(ApprovalStatus).optional(),
  rejectionReason: z.string().optional(),
  adminNotes: z.string().optional(),
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

  const { approvalStatus, isSuspended, rejectionReason, adminNotes } = parsed.data

  const user = await prisma.user.update({
    where: { id },
    data: { 
      isSuspended, 
      approvalStatus, 
      rejectionReason, 
      adminNotes,
      approvedAt: approvalStatus === ApprovalStatus.APPROVED ? new Date() : undefined,
      approvedBy: approvalStatus === ApprovalStatus.APPROVED ? session.user.id : undefined,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isSuspended: true,
      approvalStatus: true,
    },
  })

  // Log activity and notify
  if (approvalStatus) {
    await logPlatformActivity({
      type: "USER_APPROVAL_UPDATE",
      userId: id,
      message: `User ${user.email} status set to ${approvalStatus} by admin`,
    })

    if (approvalStatus === ApprovalStatus.APPROVED) {
      await createAndEmitNotification({
        userId: id,
        type: NotificationType.APPLICATION_ACCEPTED, // Closest matching type for now
        title: "Profile Approved",
        message: "Your business profile has been approved! You can now start posting gigs.",
        link: "/business/dashboard"
      })
    }
  }

  return jsonOk(user)
}
