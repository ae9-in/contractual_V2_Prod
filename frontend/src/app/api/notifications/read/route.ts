import { auth } from "@/lib/auth"
import { jsonErr, jsonOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

export async function PATCH() {
  const session = await auth()
  if (!session?.user?.id) return jsonErr("Unauthorized", 401)

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  })

  return jsonOk({ ok: true })
}
