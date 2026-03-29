import { prisma } from "@/lib/prisma"
import { jsonOk } from "@/lib/api-response"
import { Role, ApprovalStatus } from "@prisma/client"

export async function GET() {
  const users = await prisma.user.findMany({
    where: { email: 'bness@gmail.com' },
    select: {
      id: true,
      email: true,
      role: true,
      approvalStatus: true,
      name: true,
      createdAt: true
    }
  })
  return jsonOk(users)
}
