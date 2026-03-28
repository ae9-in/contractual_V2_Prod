import { Role } from "@prisma/client"
import { auth } from "@/auth"
import { jsonErr, jsonOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

/** Increment profile views when someone views a freelancer public profile (not self). */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const { id: profileUserId } = await ctx.params

  const target = await prisma.user.findUnique({
    where: { id: profileUserId },
    select: { id: true, role: true },
  })
  if (!target || target.role !== Role.FREELANCER) return jsonErr("Not found", 404)

  if (session?.user?.id === profileUserId) {
    return jsonOk({ profileViews: await prisma.user.findUnique({ where: { id: profileUserId } }).then((u) => u?.profileViews ?? 0) })
  }

  const u = await prisma.user.update({
    where: { id: profileUserId },
    data: { profileViews: { increment: 1 } },
    select: { profileViews: true },
  })
  return jsonOk({ profileViews: u.profileViews })
}
