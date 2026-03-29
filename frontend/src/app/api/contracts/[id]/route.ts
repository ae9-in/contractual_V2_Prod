import { auth } from "@/lib/auth"
import { jsonErr, jsonOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)

  const { id: contractId } = await ctx.params

  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      gig: { select: { id: true, title: true, description: true, status: true, budgetAmount: true, minBudget: true, maxBudget: true, currency: true } },
      business: { select: { id: true, name: true, companyName: true, image: true, email: true } },
      freelancer: { select: { id: true, name: true, image: true, email: true } },
      submissions: {
        orderBy: { createdAt: "desc" },
        include: { attachments: true }
      },
      activityLogs: { orderBy: { createdAt: "desc" } }
    }
  })

  if (!contract) return jsonErr("Contract not found", 404)

  const role = session.user.role ?? "FREELANCER"
  if (role !== "ADMIN" && contract.businessId !== session.user.id && contract.freelancerId !== session.user.id) {
    return jsonErr("Forbidden", 403)
  }

  return jsonOk(contract)
}
