"use client"

import { ReactNode, useState } from "react"
import { DashboardSidebar } from "./sidebar"
import { DashboardHeader } from "./header"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: ReactNode
  userType: "freelancer" | "business" | "admin"
  userName?: string
  /** Business dashboard renders its own top bar inside the page */
  hideHeader?: boolean
}

export function DashboardLayout({ children, userType, userName, hideHeader = false }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className={cn("min-h-screen", userType === "admin" ? "bg-[var(--dark-surface)]" : "bg-bg-alt")}>
      <DashboardSidebar userType={userType} />
      {!hideHeader && (
        <DashboardHeader
          userType={userType}
          userName={userName}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          hideHeader ? "pt-0" : "pt-16",
          sidebarCollapsed ? "pl-[72px]" : "pl-[240px]",
          userType === "admin" ? "bg-[var(--dark-surface)]" : ""
        )}
      >
        <div className={cn("p-6 lg:p-8", userType === "admin" && "text-white")}>{children}</div>
      </main>
    </div>
  )
}
