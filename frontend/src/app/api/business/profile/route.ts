import { Role } from "@prisma/client"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { jsonErr, jsonOk, zodErrorResponse } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
  companyName: z.string().optional().nullable(),
  companyDesc: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  companySize: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  pinCode: z.string().optional().nullable(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  if (session.user.role !== Role.BUSINESS) return jsonErr("Forbidden", 403)

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      image: true,
      companyName: true,
      companyDesc: true,
      industry: true,
      companySize: true,
      website: true,
      location: true,
      address: true,
      city: true,
      state: true,
      country: true,
      pinCode: true,
      approvalStatus: true,
    },
  })

  if (!user) return jsonErr("Not found", 404)
  return jsonOk(user)
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  if (session.user.role !== Role.BUSINESS) return jsonErr("Forbidden", 403)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonErr("Invalid JSON", 400)
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return zodErrorResponse(parsed.error)

  const updateData: Record<string, unknown> = { ...parsed.data }
  for (const k of Object.keys(updateData)) {
    if (updateData[k] === "") updateData[k] = null
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      image: true,
      companyName: true,
      companyDesc: true,
      industry: true,
      companySize: true,
      website: true,
      location: true,
      address: true,
      city: true,
      state: true,
      country: true,
      pinCode: true,
      approvalStatus: true,
    },
  })

  return jsonOk(updated)
}

