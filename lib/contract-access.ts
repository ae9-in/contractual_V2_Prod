import { prisma } from "@/lib/prisma"

export async function getContractForUser(contractId: string, userId: string, role: string) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      gig: true,
      freelancer: { select: { id: true, name: true, image: true, email: true } },
      business: { select: { id: true, name: true, image: true, email: true, companyName: true } },
    },
  })
  if (!contract) return null
  if (role === "ADMIN") return contract
  if (contract.freelancerId === userId || contract.businessId === userId) return contract
  return null
}

export async function assertGigReadable(gigId: string, userId: string, role: string) {
  const gig = await prisma.gig.findUnique({ where: { id: gigId } })
  if (!gig) return null
  if (role === "ADMIN") return gig
  if (gig.businessId === userId) return gig
  return gig
}
