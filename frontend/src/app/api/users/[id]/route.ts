import { Role } from "@prisma/client"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { jsonErr, jsonOk, zodErrorResponse } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().optional(),
  headline: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional(),
  image: z.string().url().optional(),
  hourlyRate: z.number().optional(),
  availability: z.string().optional(),
  companyName: z.string().optional(),
  companyDesc: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
})

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  const { id } = await ctx.params

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      skills: true,
      portfolio: true,
      education: true,
      certifications: true,
      languages: true,
    },
  })
  if (!user) return jsonErr("Not found", 404)

  const { passwordHash: _, ...safe } = user
  return jsonOk(safe)
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  const { id } = await ctx.params
  if (id !== session.user.id && session.user.role !== Role.ADMIN) {
    return jsonErr("Forbidden", 403)
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonErr("Invalid JSON", 400)
  }
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return zodErrorResponse(parsed.error)

  const d = parsed.data
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...d,
      website: d.website === "" ? null : d.website,
    },
    include: {
      skills: true,
      portfolio: true,
    },
  })
  const { passwordHash: _, ...safe } = user
  return jsonOk(safe)
}
