import { Role, ApplicationStatus } from "@prisma/client"
import { auth } from "@/auth"
import { jsonErr, jsonOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, context: any) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== Role.BUSINESS) {
      return jsonErr("Unauthorized", 401)
    }

    const { status } = await req.json()
    const { applicationId } = await context.params

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { gig: true },
    })

    if (!application || application.gig.businessId !== session.user.id) {
      return jsonErr("Application not found", 404)
    }

    if (!Object.values(ApplicationStatus).includes(status)) {
      return jsonErr("Invalid status", 400)
    }

    // Update status
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    })

    // Create contract if accepted
    if (status === "ACCEPTED" && application.status !== "ACCEPTED") {
      const existing = await prisma.contract.findUnique({ where: { applicationId } })
      if (!existing) {
        await prisma.contract.create({
          data: {
            agreedPrice: application.proposedPrice ?? application.gig.budgetAmount,
            applicationId: application.id,
            gigId: application.gigId,
            freelancerId: application.freelancerId,
            businessId: application.gig.businessId,
            status: "IN_PROGRESS",
          }
        })
      }
    }

    return jsonOk(updated)
  } catch (error: any) {
    return jsonErr(error.message, 500)
  }
}
