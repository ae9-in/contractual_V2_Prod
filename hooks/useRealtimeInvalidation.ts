"use client"

import { useEffect } from "react"
import { useSocket } from "@/hooks/useSocket"
import { SOCKET_EVENTS } from "@/lib/realtime/socket-events"

/**
 * Optional per-screen callbacks on top of global `SocketProvider` cache invalidation.
 * Does not duplicate query invalidation — use for UI side effects (toasts, scroll, etc.).
 */
export function useRealtimeInvalidation(
  extra?: (event: (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS], payload: unknown) => void
) {
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket || !extra) return

    const events = Object.values(SOCKET_EVENTS)
    const fns = events.map((ev) => {
      const fn = (payload: unknown) => extra(ev, payload)
      socket.on(ev, fn)
      return { ev, fn }
    })

    return () => {
      for (const { ev, fn } of fns) {
        socket.off(ev, fn)
      }
    }
  }, [socket, extra])
}
