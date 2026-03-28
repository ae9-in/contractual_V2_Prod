import { jsonErr, jsonOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { requireWorkspaceAdmin } from "@/lib/workspace-admin/require-admin-api"

export async function GET() {
  const admin = await requireWorkspaceAdmin()
  if (!admin.ok) return jsonErr(admin.error, 401)

  const rows = await prisma.platformActivityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      user: { select: { name: true, email: true, image: true } },
    },
  })

  return jsonOk(rows)
}
