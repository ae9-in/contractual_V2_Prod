"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Star,
  Users,
  BarChart3,
  Shield,
  FolderOpen,
  Search,
  PlusCircle,
  Briefcase,
  AlertTriangle,
  LifeBuoy,
  Wallet,
  IndianRupee,
  User,
} from "lucide-react"

interface SidebarProps {
  userType: "freelancer" | "business" | "admin"
}

type MenuItem = {
  label: string
  href: string
  icon: typeof LayoutDashboard
  badge?: number
  spotlight?: boolean
}

const menuItems = {
  freelancer: [
    { label: "Dashboard", href: "/freelancer/dashboard", icon: LayoutDashboard },
    { label: "Browse Gigs", href: "/freelancer/browse-gigs", icon: Search },
    { label: "My Proposals", href: "/freelancer/my-proposals", icon: FileText },
    { label: "Active Contracts", href: "/freelancer/active-contracts", icon: Briefcase },
    { label: "Earnings", href: "/freelancer/earnings", icon: Wallet },
    { label: "Messages", href: "/freelancer/messages", icon: MessageSquare, badge: 3 },
    { label: "My Profile", href: "/freelancer/profile", icon: User },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
  business: [
    { label: "Overview", href: "/business/dashboard", icon: LayoutDashboard },
    { label: "My Gigs", href: "/business/my-gigs", icon: Briefcase },
    { label: "Post a Gig", href: "/business/post-gig", icon: PlusCircle, spotlight: true },
    { label: "Applications", href: "/business/applications", icon: Users, badge: 12 },
    { label: "Contracts", href: "/business/contracts", icon: FolderOpen },
    { label: "Messages", href: "/business/messages", icon: MessageSquare, badge: 3 },
    { label: "Billing", href: "/business/billing", icon: CreditCard },
    { label: "Reviews", href: "/business/reviews", icon: Star },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ] satisfies MenuItem[],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Businesses", href: "/admin/businesses", icon: Users },
    { label: "Freelancers", href: "/admin/freelancers", icon: Users },
    { label: "Gigs", href: "/admin/gigs", icon: Briefcase },
    { label: "Contracts", href: "/admin/contracts", icon: FolderOpen },
    { label: "Disputes", href: "/admin/disputes", icon: AlertTriangle, badge: 3 },
    { label: "Revenue", href: "/admin/revenue", icon: IndianRupee },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "Messages", href: "/admin/messages", icon: MessageSquare },
  ],
}

const bottomItems = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Help Center", href: "/help", icon: HelpCircle },
]

function isRouteActive(pathname: string, href: string) {
  const roots = ["/business/dashboard", "/freelancer/dashboard", "/admin/dashboard"]
  if (roots.includes(href)) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DashboardSidebar({ userType }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const items = menuItems[userType]
  const userLabel = userType === "freelancer" ? "Freelancer" : userType === "business" ? "Business" : "Admin"
  const userColor =
    userType === "admin" ? "bg-red-500" : userType === "business" ? "bg-[var(--cta-amber)]" : "bg-[var(--primary)]"

  const businessSidebar = userType === "business"

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-dark-surface transition-all duration-300 ease-in-out flex flex-col",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        <Logo 
          size={collapsed ? "sm" : "md"} 
          showText={!collapsed} 
          textColorClassName="text-white"
        />
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="shrink-0 rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {!businessSidebar && !collapsed && (
        <div className="border-b border-white/10 px-4 py-3">
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-white",
              userColor
            )}
          >
            <Shield className="h-3 w-3" />
            {userType === "admin" ? "Admin Panel" : `${userLabel} Account`}
          </div>
        </div>
      )}

      {businessSidebar && !collapsed && (
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <Avatar className="h-10 w-10 border border-white/10">
              <AvatarFallback className="bg-[var(--primary)] text-sm font-bold text-white">AJ</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-white">Alex Johnson</p>
              <p className="truncate text-xs text-white/50">Pro Business</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-white/10">
        {items.map((item) => {
          const isActive = isRouteActive(pathname, item.href)
          const spotlight = "spotlight" in item && item.spotlight

          if (businessSidebar) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-r-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 border-l-[3px]",
                  isActive
                    ? "border-l-[var(--primary)] bg-[var(--primary-light)]/25 text-white"
                    : "border-l-transparent text-slate-300 hover:bg-white/10 hover:text-white",
                  spotlight &&
                    !isActive &&
                    "border-l-amber-400/80 bg-amber-500/10 ring-1 ring-amber-400/35 text-amber-100"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge != null && (
                      <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {collapsed && item.badge != null && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-gradient-primary text-white shadow-lg shadow-primary/25"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "animate-pulse-subtle")} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge != null && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-bold",
                        isActive ? "bg-white/20 text-white" : "bg-amber-500 text-white"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge != null && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {businessSidebar && !collapsed && (
        <div className="px-3 pb-2">
          <div className="rounded-xl bg-[var(--primary-light)]/20 p-4 ring-1 ring-[var(--primary)]/30">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/30 text-[var(--primary-light)]">
                <LifeBuoy className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="font-semibold text-white">Need Help?</p>
                <p className="mt-1 text-xs text-white/60">Our team replies within minutes.</p>
                <Link
                  href="/help"
                  className="mt-2 inline-block text-sm font-semibold text-[var(--primary)] hover:underline"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-1 border-t border-white/10 p-3">
        {!businessSidebar &&
          bottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-300 transition-colors duration-200 hover:bg-red-500/15 hover:text-red-200"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  )
}
