import { ApprovalStatus, NotificationType, Role } from "@prisma/client"
import { z } from "zod"
import { jsonErr, jsonOk, zodErrorResponse } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { logPlatformActivity } from "@/lib/platform-activity"
import { requireWorkspaceAdmin } from "@/lib/workspace-admin/require-admin-api"

const bodySchema = z.object({
  reason: z.string().min(3).max(2000),
})

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await requireWorkspaceAdmin()
  if (!admin.ok) return jsonErr(admin.error, 401)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonErr("Invalid JSON", 400)
  }
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return zodErrorResponse(parsed.error)

  const { id } = await ctx.params
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user || user.role !== Role.BUSINESS) return jsonErr("Not found", 404)

  await prisma.user.update({
    where: { id },
    data: {
      approvalStatus: ApprovalStatus.REJECTED,
      rejectionReason: parsed.data.reason,
      approvedAt: null,
      approvedBy: null,
    },
  })

  await prisma.notification.create({
    data: {
      userId: id,
      type: NotificationType.BUSINESS_REJECTED,
      title: "Business application update",
      message: `Your application was not approved. Reason: ${parsed.data.reason}`,
      link: "/auth/signin",
    },
  })

  await logPlatformActivity({
    type: "BUSINESS_REJECTED",
    userId: id,
    message: `${user.name} rejected`,
    metadata: { adminEmail: admin.email, reason: parsed.data.reason },
  })

  await prisma.adminAuditLog.create({
    data: {
      action: "REJECT_BUSINESS",
      targetId: id,
      targetType: "USER",
      details: parsed.data.reason,
      adminEmail: admin.email,
    },
  })

  return jsonOk({ success: true })
}
