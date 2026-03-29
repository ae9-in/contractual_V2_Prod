"use client"

import { useSocketContextSafe } from "@/providers/SocketProvider"

/**
 * Access the authenticated Socket.IO client (or null if logged out / still connecting).
 */
export function useSocket() {
  const ctx = useSocketContextSafe()
  if (!ctx) {
    return { socket: null as null, connected: false }
  }
  return ctx
}
