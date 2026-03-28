"use client"

import type { ReactNode } from "react"
import { BusinessSidebar } from "./business-sidebar"
import { BusinessTopbar } from "./business-topbar"

export type BusinessUser = {
  name: string
  email: string
  image: string | null
}

export function BusinessShell({
  children,
  user,
}: {
  children: ReactNode
  user: BusinessUser
}) {
  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#f8fafc]">
      <BusinessSidebar user={user} />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="fixed left-[220px] right-0 top-0 z-40">
          <BusinessTopbar user={user} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto bg-[#f8fafc] px-6 pb-6 pt-[80px]">
          {children}
        </div>
      </div>
    </div>
  )
}
