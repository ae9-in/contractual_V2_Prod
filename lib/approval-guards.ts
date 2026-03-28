import { ApprovalStatus, Role } from "@prisma/client"
import { jsonErr } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

export async function assertApprovedBusiness(userId: string) {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, approvalStatus: true },
  })
  if (!u || u.role !== Role.BUSINESS) {
    return { ok: false as const, res: jsonErr("Forbidden", 403) }
  }
  if (u.approvalStatus !== ApprovalStatus.APPROVED) {
    return { ok: false as const, res: jsonErr("Account pending approval", 403) }
  }
  return { ok: true as const }
}
