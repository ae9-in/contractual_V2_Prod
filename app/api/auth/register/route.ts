import bcrypt from "bcryptjs"
import { ApprovalStatus, Role } from "@prisma/client"
import { z } from "zod"
import { jsonErr, jsonOk, zodErrorResponse } from "@/lib/api-response"
import { logPlatformActivity } from "@/lib/platform-activity"
import { prisma } from "@/lib/prisma"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(["FREELANCER", "BUSINESS"]),
  companyName: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return zodErrorResponse(parsed.error)
    const { email, password, name, role, companyName } = parsed.data
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) return jsonErr("Email already registered", 409)
    const passwordHash = await bcrypt.hash(password, 12)
    const isBusiness = role === "BUSINESS"
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash,
        role: isBusiness ? Role.BUSINESS : Role.FREELANCER,
        companyName: isBusiness ? companyName : undefined,
        approvalStatus: isBusiness ? ApprovalStatus.PENDING : ApprovalStatus.APPROVED,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
        approvalStatus: true,
      },
    })

    await logPlatformActivity({
      type: isBusiness ? "BUSINESS_REGISTERED" : "USER_REGISTERED",
      userId: user.id,
      message: isBusiness
        ? `New business registration (pending): ${user.name} <${user.email}>`
        : `New freelancer: ${user.name} <${user.email}>`,
    })

    return jsonOk({
      ...user,
      pendingApproval: isBusiness,
    })
  } catch {
    return jsonErr("Server error", 500)
  }
}
