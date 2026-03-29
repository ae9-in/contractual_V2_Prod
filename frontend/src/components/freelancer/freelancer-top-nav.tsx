"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { useEffect } from "react"
import { useSocketContext } from "@/providers/SocketProvider"
import { SOCKET_EVENTS } from "@/lib/realtime/socket-events"
import {
  Bell,
  Briefcase,
  FileText,
  LayoutGrid,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  User,
  HelpCircle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { qk } from "@/lib/realtime/query-keys"
import { cn } from "@/lib/utils"
import type { FreelancerUser } from "./freelancer-shell"

const NAV = [
  { href: "/freelancer/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/freelancer/browse-gigs", label: "Browse Gigs", icon: Search },
  { href: "/freelancer/proposals", label: "Proposals", icon: FileText },
  { href: "/freelancer/contracts", label: "Contracts", icon: Briefcase },
  { href: "/freelancer/messages", label: "Messages", icon: MessageSquare },
  { href: "/freelancer/profile", label: "Profile", icon: User },
] as const

function pathActive(pathname: string, href: string) {
  if (href === "/freelancer/dashboard") return pathname === href
  if (href === "/freelancer/browse-gigs")
    return pathname === href || pathname.startsWith("/freelancer/browse-gigs/")
  return pathname === href || pathname.startsWith(`${href}/`)
}

function initials(name: string) {
  const p = name.trim().split(/\s+/)
  if (p.length >= 2) return (p[0]![0] + p[1]![0]).toUpperCase()
  return name.slice(0, 2).toUpperCase() || "?"
}

export function FreelancerTopNav({ user }: { user: FreelancerUser }) {
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const { socket } = useSocketContext()

  useEffect(() => {
    if (!socket) return
    const onNotif = () => queryClient.invalidateQueries({ queryKey: qk.notifications() })
    const onMsg = () => queryClient.invalidateQueries({ queryKey: qk.messagesUnread() })
    
    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, onNotif)
    socket.on(SOCKET_EVENTS.MESSAGE_NEW, onMsg)
    
    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION_NEW, onNotif)
      socket.off(SOCKET_EVENTS.MESSAGE_NEW, onMsg)
    }
  }, [socket, queryClient])

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

  const { data: msgUnread } = useQuery({
    queryKey: qk.messagesUnread(),
    queryFn: async () => {
      const res = await fetch("/api/messages/unread-count")
      const j = (await res.json()) as { data?: { count?: number } }
      if (!res.ok) throw new Error("unread")
      return j.data?.count ?? 0
    },
    refetchInterval: 30_000,
  })

  const unreadNotif = notifMeta?.unread ?? 0
  const unreadMsg = msgUnread ?? 0
  const bellCount = unreadNotif + unreadMsg

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 flex h-[60px] items-center justify-between border-b bg-white px-4 shadow-[0_1px_12px_rgba(0,0,0,0.06)] md:px-8"
      style={{ borderColor: "#e8ecf0" }}
    >
      <Link href="/" className="flex shrink-0 items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="shrink-0">
          <path
            d="M12 2L20 7V17L12 22L4 17V7L12 2Z"
            fill="#6d9c9f"
            stroke="#5a8a8d"
            strokeWidth="0.5"
          />
        </svg>
        <span className="font-bricolage text-base font-bold text-[#0f172a]">Contractual</span>
      </Link>

      <nav
        className="mx-2 hidden min-w-0 max-w-[min(100%,720px)] flex-1 justify-center md:flex"
        aria-label="Freelancer"
      >
        <div
          className="flex gap-0.5 rounded-full border p-1"
          style={{ background: "#f4f6f9", borderColor: "#e8ecf0" }}
        >
          {NAV.map((item) => {
            const active = pathActive(pathname, item.href)
            const msgTab = item.href === "/freelancer/messages" && unreadMsg > 0
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-[7px] text-[13px] font-medium transition-colors duration-200 md:px-[18px]",
                  active ? "text-[#0f172a]" : "text-[#64748b] hover:bg-black/[0.04] hover:text-[#0f172a]"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="freelancer-nav-pill"
                    className="absolute inset-0 rounded-full bg-white shadow-[0_1px_8px_rgba(0,0,0,0.1),0_0_0_1px_#e8ecf0]"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <item.icon className="h-3.5 w-3.5 shrink-0 md:h-[14px] md:w-[14px]" strokeWidth={2} />
                  <span className="hidden sm:inline">{item.label}</span>
                  {msgTab && (
                    <span className="relative flex h-2 w-2 shrink-0 sm:ml-0.5">
                      <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#ef4444]" />
                    </span>
                  )}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      <nav
        className="flex max-w-[min(50vw,280px)] flex-1 justify-center gap-0.5 overflow-x-auto md:hidden"
        aria-label="Freelancer mobile"
      >
        {NAV.map((item) => {
          const active = pathActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors",
                active
                  ? "border-[#e8ecf0] bg-white text-[#0f172a] shadow-[0_1px_6px_rgba(0,0,0,0.08)]"
                  : "border-transparent text-[#64748b] hover:bg-black/[0.04]"
              )}
            >
              <item.icon className="h-[15px] w-[15px]" strokeWidth={2} />
            </Link>
          )
        })}
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/freelancer/notifications"
          className="relative flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border bg-white transition-colors hover:border-[#6d9c9f] hover:bg-[#f4f6f9]"
          style={{ borderColor: "#e8ecf0" }}
          aria-label="Notifications"
        >
          <Bell className="h-[15px] w-[15px] text-[#64748b]" />
          {bellCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef4444] px-0.5 text-[10px] font-bold text-white">
              {bellCount > 99 ? "99+" : bellCount}
            </span>
          )}
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#6d9c9f] to-[#2d7a7e] text-[13px] font-bold text-white outline-none ring-offset-2 transition-shadow hover:ring-2 hover:ring-[#6d9c9f]"
              aria-label="Account menu"
            >
              {user.image ? (
                <Image src={user.image} alt="" width={36} height={36} className="h-full w-full object-cover" unoptimized />
              ) : (
                initials(user.name)
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-[#e8ecf0] bg-white">
            <div className="px-2 py-2">
              <p className="text-sm font-semibold text-[#0f172a]">{user.name}</p>
              <p className="text-xs text-[#94a3b8]">{user.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer text-[#0f172a]">
              <Link href="/freelancer/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" /> View Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer text-[#0f172a]">
              <Link href="/freelancer/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer text-[#0f172a]">
              <Link href="/help" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" /> Support
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
