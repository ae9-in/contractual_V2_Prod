"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  AlertTriangle,
  BarChart2,
  Briefcase,
  Building2,
  Clock,
  CreditCard,
  FileCheck,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  ScrollText,
  Settings,
  UserCheck,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

const nav: { label: string; items: { href: string; label: string; icon: typeof LayoutDashboard; badge?: string }[] }[] = [
  {
    label: "OVERVIEW",
    items: [
      { href: "/workspace-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/workspace-admin/analytics", label: "Analytics", icon: BarChart2 },
    ],
  },
  {
    label: "USERS",
    items: [
      { href: "/workspace-admin/users", label: "All Users", icon: Users },
      { href: "/workspace-admin/businesses", label: "Businesses", icon: Building2 },
      { href: "/workspace-admin/freelancers", label: "Freelancers", icon: UserCheck },
      {
        href: "/workspace-admin/businesses?status=PENDING",
        label: "Pending Approval",
        icon: Clock,
      },
    ],
  },
  {
    label: "PLATFORM",
    items: [
      { href: "/workspace-admin/gigs", label: "All Gigs", icon: Briefcase },
      { href: "/workspace-admin/contracts", label: "Contracts", icon: FileCheck },
      { href: "/workspace-admin/disputes", label: "Disputes", icon: AlertTriangle },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { href: "/workspace-admin/revenue", label: "Revenue", icon: IndianRupee },
      { href: "/workspace-admin/payments", label: "Payments", icon: CreditCard },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { href: "/workspace-admin/settings", label: "Settings", icon: Settings },
      { href: "/workspace-admin/audit-logs", label: "Audit Logs", icon: ScrollText },
    ],
  },
]

function navItemActive(pathname: string, searchParams: URLSearchParams, href: string) {
  const [path, query] = href.split("?")
  if (pathname !== path && !pathname.startsWith(`${path}/`)) return false
  if (query) {
    const sp = new URLSearchParams(query)
    const want = sp.get("status")
    return searchParams.get("status") === want
  }
  if (path === "/workspace-admin/businesses" && href === "/workspace-admin/businesses") {
    return searchParams.get("status") !== "PENDING"
  }
  return pathname === path || pathname.startsWith(`${path}/`)
}

export function WorkspaceAdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  async function logout() {
    await fetch("/api/workspace-admin/logout", { method: "POST" })
    router.push("/workspace-admin")
    router.refresh()
  }

  return (
    <div className="workspace-admin-shell flex min-h-screen bg-[#0f1f35] text-white">
      <aside data-mobile-nav="workspace-admin" className="flex w-[220px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0f172a]">
        <div className="border-b border-white/[0.06] px-4 py-4">
          <div className="mb-2 inline-block rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Admin
          </div>
          <p className="font-display text-sm font-bold">Workspace Admin</p>
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto px-2 py-4">
          {nav.map((section) => (
            <div key={section.label}>
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = navItemActive(pathname, searchParams, item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          active
                            ? "bg-white/[0.08] text-white"
                            : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0 opacity-80" />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-white/[0.06] p-3">
          <p className="mb-2 truncate px-1 text-[11px] text-slate-500">Logged in as Admin</p>
          <button
            type="button"
            onClick={() => void logout()}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>
      <div className="workspace-admin-content flex min-w-0 flex-1 flex-col">
        <header className="workspace-admin-topbar flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#1e293b] px-6">
          <span className="text-sm font-semibold text-slate-300">Contractual Workspace</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[12px] text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Platform Live
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
              A
            </div>
          </div>
        </header>
        <main className="workspace-admin-main min-h-0 flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
