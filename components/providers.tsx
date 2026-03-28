"use client"

import { SessionProvider } from "next-auth/react"
import { QueryProvider } from "@/providers/QueryProvider"
import { SocketProvider } from "@/providers/SocketProvider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        <SocketProvider>{children}</SocketProvider>
      </QueryProvider>
    </SessionProvider>
  )
}
