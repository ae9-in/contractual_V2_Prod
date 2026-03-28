import { prisma } from "@/lib/prisma"

export async function logPlatformActivity(input: {
  type: string
  userId?: string | null
  message: string
  metadata?: Record<string, unknown>
}) {
  try {
    await prisma.platformActivityLog.create({
      data: {
        type: input.type,
        userId: input.userId ?? undefined,
        message: input.message,
        metadata: input.metadata ?? undefined,
      },
    })
  } catch (e) {
    console.error("[platform-activity]", e)
  }
}
