"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import {
  Briefcase,
  ChevronDown,
  CreditCard,
  FileCheck,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  PlusCircle,
  Settings,
  User,
  Users,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { qk } from "@/lib/realtime/query-keys"
import { cn } from "@/lib/utils"
import type { BusinessUser } from "./business-shell"

const NAVY = "#0f172a"

const SIDEBAR_BG = `
  radial-gradient(ellipse 125% 95% at 0% -5%, rgba(125, 191, 194, 0.2) 0%, transparent 55%),
  radial-gradient(ellipse 95% 75% at 100% 100%, rgba(109, 156, 159, 0.18) 0%, transparent 52%),
  linear-gradient(165deg, #3d5266 0%, #33485a 28%, #2a3d4f 55%, #1f3345 100%)
`

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; badgeKey?: "apps" | "msgs" }

const mainNav: NavItem[] = [
  { href: "/business/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/business/my-gigs", label: "My Gigs", icon: Briefcase },
  { href: "/business/post-gig", label: "Post a Gig", icon: PlusCircle },
]

const hiringNav: NavItem[] = [
  { href: "/business/applications", label: "Applications", icon: Users, badgeKey: "apps" },
  { href: "/business/contracts", label: "Contracts", icon: FileCheck },
]

const accountNav: NavItem[] = [
  { href: "/business/messages", label: "Messages", icon: MessageSquare, badgeKey: "msgs" },
  { href: "/business/profile", label: "Profile", icon: User },
  { href: "/business/billing", label: "Payments", icon: CreditCard },
  { href: "/business/settings", label: "Settings", icon: Settings },
]

function isActive(pathname: string, href: string) {
  if (href === "/business/dashboard") return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavLink({
  item,
  counts,
}: {
  item: NavItem
  counts: { pendingApplications: number; unreadMessages: number }
}) {
  const pathname = usePathname()
  const active = isActive(pathname, item.href)
  const badge =
    item.badgeKey === "apps"
      ? counts.pendingApplications > 0
        ? counts.pendingApplications
        : undefined
      : item.badgeKey === "msgs"
        ? counts.unreadMessages > 0
          ? counts.unreadMessages
          : undefined
        : undefined

  return (
    <Link
      href={item.href}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-[13.5px] transition-all duration-150",
        active
          ? "bg-[rgba(109,156,159,0.28)] font-semibold text-[#c5ebe8] shadow-[inset_0_0_0_1px_rgba(125,191,194,0.35)]"
          : "font-medium text-slate-300 hover:bg-white/10 hover:text-white"
      )}
    >
      <item.icon className="h-[15px] w-[15px] shrink-0" strokeWidth={2} />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {badge != null && (
        <span
          className="ml-auto shrink-0 rounded-full px-1.5 py-px text-[10px] font-bold"
          style={{ background: "#f59e0b", color: NAVY }}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.08em]"
      style={{ color: "rgba(226, 232, 240, 0.55)" }}
    >
      {children}
    </p>
  )
}

function initials(name: string) {
  const p = name.trim().split(/\s+/)
  if (p.length >= 2) return (p[0]![0] + p[1]![0]).toUpperCase()
  return name.slice(0, 2).toUpperCase() || "?"
}

export function BusinessSidebar({ user }: { user: BusinessUser }) {
  const { data: counts } = useQuery({
    queryKey: qk.businessNav(),
    queryFn: async () => {
      const res = await fetch("/api/business/nav-counts")
      const j = (await res.json()) as {
        data?: { pendingApplications: number; unreadMessages: number }
        error?: string
      }
      if (!res.ok) throw new Error(j.error ?? "nav")
      return j.data ?? { pendingApplications: 0, unreadMessages: 0 }
    },
    refetchInterval: 30_000,
  })

  const c = counts ?? { pendingApplications: 0, unreadMessages: 0 }

  return (
    <aside
      data-mobile-nav="business"
      className="relative flex h-screen w-[220px] shrink-0 flex-col overflow-y-auto border-r border-white/10 shadow-[inset_-1px_0_0_rgba(255,255,255,0.06)]"
      style={{ background: SIDEBAR_BG }}
    >
      <div
        className="flex h-14 shrink-0 items-center px-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
      >
        <Logo size="sm" showText={true} textColorClassName="!text-white" />
      </div>

      <div className="px-5 pb-2 pt-4">
        <span
          className="inline-block rounded-md border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider"
          style={{
            background: "rgba(109,156,159,0.22)",
            color: "#b8e0e2",
            borderColor: "rgba(125,191,194,0.4)",
          }}
        >
          Business Account
        </span>
      </div>

      <nav className="flex flex-1 flex-col px-3 pb-4 pt-2">
        <SectionLabel>Main</SectionLabel>
        <div className="space-y-0.5">
          {mainNav.map((item) => (
            <NavLink key={item.href} item={item} counts={c} />
          ))}
        </div>
        <SectionLabel>Hiring</SectionLabel>
        <div className="space-y-0.5">
          {hiringNav.map((item) => (
            <NavLink key={item.href} item={item} counts={c} />
          ))}
        </div>
        <SectionLabel>Account</SectionLabel>
        <div className="space-y-0.5">
          {accountNav.map((item) => (
            <NavLink key={item.href} item={item} counts={c} />
          ))}
        </div>
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        <Link
          href="/help"
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12.5px] text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200"
        >
          <HelpCircle className="h-3.5 w-3.5 shrink-0" />
          Support
        </Link>
        <Link
          href="/business/profile"
          className="mt-2 flex w-full items-center gap-2.5 rounded-lg p-2.5 text-left transition-colors hover:bg-white/10"
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ring-2 ring-white/15"
            style={{ background: "linear-gradient(145deg, #7eb8bb, #4a8f93)" }}
          >
            {initials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-slate-50">{user.name}</p>
            <p className="truncate text-[11px] text-slate-400">Business</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        </Link>
      </div>
    </aside>
  )
}
