"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { toast } from "sonner"
import type { Socket } from "socket.io-client"
import { createRealtimeSocket, defaultSocketUrl } from "@/lib/socket"
import { SOCKET_EVENTS } from "@/lib/realtime/socket-events"
import { invalidateQueriesForSocketEvent } from "@/services/realtime"

type SocketContextValue = {
  socket: Socket | null
  connected: boolean
}

const SocketContext = createContext<SocketContextValue | null>(null)

const SOCKET_EVENT_VALUES = Object.values(SOCKET_EVENTS)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const queryClient = useQueryClient()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  const bindEvents = useCallback(
    (s: Socket) => {
      for (const ev of SOCKET_EVENT_VALUES) {
        s.on(ev, (payload: any) => {
          invalidateQueriesForSocketEvent(queryClient, ev, payload)

          if (ev === SOCKET_EVENTS.NOTIFICATION_NEW && payload?.title) {
            toast.info(payload.title, { description: payload.message })
          } else if (ev === SOCKET_EVENTS.APPLICATION_NEW) {
            toast.success("New Application Received!")
          } else if (ev === SOCKET_EVENTS.MESSAGE_NEW && payload?.text) {
             // Only toast if not on the messages page
             if (typeof window !== "undefined" && !window.location.pathname.includes("/messages")) {
               toast.message(`New Message`, { description: payload.text })
             }
          }
        })
      }
    },
    [queryClient]
  )

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      socketRef.current?.removeAllListeners()
      socketRef.current?.disconnect()
      socketRef.current = null
      setSocket(null)
      setConnected(false)
      return
    }

    let cancelled = false

    ;(async () => {
      const res = await fetch("/api/realtime/token")
      if (!res.ok || cancelled) return
      const json = (await res.json()) as { data?: { token?: string }; token?: string }
      const token = json.data?.token ?? json.token
      if (!token || cancelled) return

      const url = defaultSocketUrl()
      const s = createRealtimeSocket(url, token)
      socketRef.current = s
      setSocket(s)

      s.on("connect", () => setConnected(true))
      s.on("disconnect", () => setConnected(false))
      bindEvents(s)

      s.on("connect_error", (err) => {
        console.warn("[socket] connect_error", err.message)
      })
    })()

    return () => {
      cancelled = true
      const s = socketRef.current
      if (s) {
        s.removeAllListeners()
        s.disconnect()
      }
      socketRef.current = null
      setSocket(null)
      setConnected(false)
    }
  }, [status, session?.user?.id, bindEvents])

  const value = useMemo(
    () => ({ socket, connected }),
    [socket, connected]
  )

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocketContext() {
  const ctx = useContext(SocketContext)
  if (!ctx) {
    throw new Error("useSocketContext must be used within SocketProvider")
  }
  return ctx
}

/** Optional: use when SocketProvider is not mounted (e.g. tests). */
export function useSocketContextSafe() {
  return useContext(SocketContext)
}
