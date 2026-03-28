import { io, type Socket } from "socket.io-client"

/**
 * Browser-side Socket.IO client. Prefer `useSocket()` from `@/hooks/useSocket` in components.
 */
export function createRealtimeSocket(url: string, token: string): Socket {
  return io(url, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnectionAttempts: 8,
    reconnectionDelay: 800,
  })
}

export function defaultSocketUrl() {
  if (typeof window !== "undefined" && !process.env.NEXT_PUBLIC_SOCKET_URL) {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3000"
}
