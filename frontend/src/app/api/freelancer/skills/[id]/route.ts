import { Role } from "@prisma/client"
import { auth } from "@/lib/auth"
import { jsonErr, jsonOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  if (session.user.role !== Role.FREELANCER) return jsonErr("Forbidden", 403)

  const { id } = await ctx.params
  const row = await prisma.skill.findUnique({ where: { id } })
  if (!row || row.userId !== session.user.id) return jsonErr("Not found", 404)

  await prisma.skill.delete({ where: { id } })
  return jsonOk({ ok: true })
}
