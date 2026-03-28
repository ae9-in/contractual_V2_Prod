import { ApprovalStatus, NotificationType, Role } from "@prisma/client"
import { jsonErr, jsonOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { logPlatformActivity } from "@/lib/platform-activity"
import { requireWorkspaceAdmin } from "@/lib/workspace-admin/require-admin-api"

export async function PATCH(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await requireWorkspaceAdmin()
  if (!admin.ok) return jsonErr(admin.error, 401)

  const { id } = await ctx.params
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user || user.role !== Role.BUSINESS) return jsonErr("Not found", 404)

  await prisma.user.update({
    where: { id },
    data: {
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: admin.email,
      rejectionReason: null,
    },
  })

  await prisma.notification.create({
    data: {
      userId: id,
      type: NotificationType.BUSINESS_APPROVED,
      title: "Business account approved",
      message: "Your business account is approved. You can sign in and post gigs.",
      link: "/business/dashboard",
    },
  })

  await logPlatformActivity({
    type: "BUSINESS_APPROVED",
    userId: id,
    message: `${user.name} approved`,
    metadata: { adminEmail: admin.email },
  })

  await prisma.adminAuditLog.create({
    data: {
      action: "APPROVE_BUSINESS",
      targetId: id,
      targetType: "USER",
      details: `Approved business ${user.email}`,
      adminEmail: admin.email,
    },
  })

  return jsonOk({ success: true })
}
