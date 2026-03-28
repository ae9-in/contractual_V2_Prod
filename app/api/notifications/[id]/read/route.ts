import { auth } from "@/auth"
import { jsonErr, jsonOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

export async function PATCH(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)
  const { id } = await ctx.params

  const n = await prisma.notification.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!n) return jsonErr("Not found", 404)

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  })
  return jsonOk(updated)
}
