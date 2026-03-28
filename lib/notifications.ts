import type { Notification, NotificationType } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { emitToUser } from "@/lib/socket-emitter"
import { SOCKET_EVENTS } from "@/lib/realtime/socket-events"

export type NotificationInput = {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string | null
}

export async function createAndEmitNotification(input: NotificationInput): Promise<Notification> {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link ?? undefined,
    },
  })
  emitToUser(input.userId, SOCKET_EVENTS.NOTIFICATION_NEW, notification)
  return notification
}
