"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Bell, ChevronDown, MessageSquare, Search, LogOut, Settings, User } from "lucide-react"
import { signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { qk } from "@/lib/realtime/query-keys"
import type { BusinessUser } from "./business-shell"

const TITLE_MAP: Record<string, { title: string; crumb: string }> = {
  "/business/dashboard": { title: "Dashboard", crumb: "Business / Overview" },
  "/business/my-gigs": { title: "My Gigs", crumb: "Business / Gigs" },
  "/business/post-gig": { title: "Post a Gig", crumb: "Business / Gigs" },
  "/business/applications": { title: "Applications", crumb: "Business / Hiring" },
  "/business/contracts": { title: "Contracts", crumb: "Business / Hiring" },
  "/business/messages": { title: "Messages", crumb: "Business / Account" },
  "/business/billing": { title: "Payments", crumb: "Business / Account" },
  "/business/reviews": { title: "Reviews", crumb: "Business" },
  "/business/profile": { title: "Profile", crumb: "Business / Account" },
  "/business/notifications": { title: "Notifications", crumb: "Business" },
}

function titleForPath(pathname: string) {
  if (TITLE_MAP[pathname]) return TITLE_MAP[pathname]
  if (pathname.startsWith("/business/applications/"))
    return { title: "Applications", crumb: "Business / Hiring" }
  return { title: "Business", crumb: "Business" }
}

function initials(name: string) {
  const p = name.trim().split(/\s+/)
  if (p.length >= 2) return (p[0]![0] + p[1]![0]).toUpperCase()
  return name.slice(0, 2).toUpperCase() || "?"
}

export function BusinessTopbar({ user }: { user: BusinessUser }) {
  const pathname = usePathname()
  const { title, crumb } = titleForPath(pathname)

  const { data: notifMeta } = useQuery({
    queryKey: [...qk.notifications(), "meta"],
    queryFn: async () => {
      const res = await fetch("/api/notifications?limit=1")
      const j = (await res.json()) as { meta?: { unread?: number } }
      if (!res.ok) throw new Error("notifications")
      return j.meta
    },
    refetchInterval: 30_000,
  })

  const unreadNotif = notifMeta?.unread ?? 0

  return (
    <header
      className="business-topbar flex h-14 w-full shrink-0 items-center justify-between border-b bg-white px-6"
      style={{ borderColor: "#e2e8f0", height: 56 }}
    >
      <div>
        <h1 className="text-[15px] font-semibold leading-tight" style={{ color: "#0f172a" }}>
          {title}
        </h1>
        <p className="mt-0.5 text-[11px]" style={{ color: "#94a3b8" }}>
          {crumb}
        </p>
      </div>

      <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 md:block">
        <div className="pointer-events-auto relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
            style={{ color: "#94a3b8" }}
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search..."
            className="h-[34px] w-[280px] rounded-lg border bg-[#f8fafc] py-0 pl-9 pr-3 text-[13px] outline-none transition-[box-shadow,border-color,background]"
            style={{ borderColor: "#e2e8f0", color: "#0f172a" }}
            onFocus={(e) => {
              e.target.style.borderColor = "#6d9c9f"
              e.target.style.background = "#fff"
              e.target.style.boxShadow = "0 0 0 2px rgba(109,156,159,0.15)"
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e2e8f0"
              e.target.style.background = "#f8fafc"
              e.target.style.boxShadow = "none"
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/business/notifications"
          className="relative flex h-[34px] w-[34px] items-center justify-center rounded-lg border bg-white transition-colors hover:border-[#6d9c9f] hover:bg-[#f8fafc]"
          style={{ borderColor: "#e2e8f0" }}
          aria-label="Notifications"
        >
          <Bell className="h-[15px] w-[15px]" style={{ color: "#64748b" }} />
          {unreadNotif > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef4444] px-0.5 text-[9px] font-bold text-white">
              {unreadNotif > 99 ? "99+" : unreadNotif}
            </span>
          )}
        </Link>
        <Link
          href="/business/messages"
          className="relative flex h-[34px] w-[34px] items-center justify-center rounded-lg border bg-white transition-colors hover:border-[#6d9c9f] hover:bg-[#f8fafc]"
          style={{ borderColor: "#e2e8f0" }}
          aria-label="Messages"
        >
          <MessageSquare className="h-[15px] w-[15px]" style={{ color: "#64748b" }} />
        </Link>
        <div className="mx-1 h-5 w-px shrink-0 bg-[#e2e8f0]" aria-hidden />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-[#f8fafc] outline-none"
            >
              <div
                className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                style={{ background: "#6d9c9f" }}
              >
                {initials(user.name)}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-[13px] font-semibold leading-tight" style={{ color: "#0f172a" }}>
                  {user.name}
                </p>
                <p className="text-[11px] leading-tight" style={{ color: "#94a3b8" }}>
                  Business
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 sm:ml-1" style={{ color: "#94a3b8" }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-[#e2e8f0] bg-white mt-1">
            <div className="px-2 py-2">
              <p className="text-sm font-semibold text-[#0f172a]">{user.name}</p>
              <p className="text-xs text-[#94a3b8]">{user.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/business/profile" className="flex w-full items-center gap-2">
                <User className="h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/business/settings" className="flex w-full items-center gap-2">
                <Settings className="h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
