"use client"

import { useState } from "react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { qk } from "@/lib/realtime/query-keys"
import {
  Bell,
  Search,
  MessageSquare,
  ChevronDown,
  Settings,
  LogOut,
  User,
  HelpCircle,
  Moon,
  Sun,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"

function dashPaths(userType: "freelancer" | "business" | "admin") {
  if (userType === "freelancer") {
    return { messages: "/freelancer/messages", notifications: "/freelancer/notifications", profile: "/freelancer/profile" }
  }
  if (userType === "business") {
    return { messages: "/business/messages", notifications: "/business/notifications", profile: "/business/profile" }
  }
  return { messages: "/admin/messages", notifications: "/admin/notifications", profile: "/admin/dashboard" }
}

interface DashboardHeaderProps {
  userType: "freelancer" | "business" | "admin"
  userName?: string
  userAvatar?: string
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

// Removed mockNotifications for live data

export function DashboardHeader({ 
  userType, 
  userName: propName,
  userAvatar: propAvatar,
  sidebarCollapsed,
  onToggleSidebar
}: DashboardHeaderProps) {
  const { data: session } = useSession()
  const paths = dashPaths(userType)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const userName = session?.user?.name ?? propName ?? "User"
  const userEmail = session?.user?.email ?? ""

  const { data: notificationsData } = useQuery({
    queryKey: qk.notifications(),
    queryFn: async () => {
      const res = await fetch("/api/notifications?limit=5")
      const j = await res.json()
      return j
    },
    enabled: !!session?.user?.id,
    refetchInterval: 30_000,
  })

  const { data: messagesUnread } = useQuery({
    queryKey: qk.messagesUnread(),
    queryFn: async () => {
      const res = await fetch("/api/messages/unread-count")
      const j = await res.json()
      return res.ok ? j.data?.count ?? 0 : 0
    },
    enabled: !!session?.user?.id,
    refetchInterval: 30_000,
  })

  const notifications = notificationsData?.data ?? []
  const unreadCount = notificationsData?.meta?.unread ?? 0
  const unreadMessages = messagesUnread ?? 0
  const iconMuted = userType === "admin" ? "text-white/70" : "text-text-secondary"
  const actionHover = userType === "admin" ? "hover:bg-white/10" : "hover:bg-bg-alt"

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 border-b backdrop-blur-xl transition-all duration-300",
        sidebarCollapsed ? "left-[72px]" : "left-[240px]",
        userType === "admin"
          ? "border-white/10 bg-[var(--dark-surface)]/92 text-white"
          : "border-border bg-white/80"
      )}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Left - Search */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleSidebar}
            className={cn("lg:hidden p-2 rounded-lg transition-colors", actionHover)}
          >
            <Menu className={cn("w-5 h-5", iconMuted)} />
          </button>
          
          <div className="relative hidden sm:block">
            <Search
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
                userType === "admin" ? "text-white/50" : "text-text-secondary"
              )}
            />
            <input
              type="text"
              placeholder="Search anything..."
              className={cn(
                "w-[300px] h-10 pl-10 pr-4 rounded-xl border border-transparent transition-all text-sm",
                userType === "admin"
                  ? "bg-white/5 placeholder:text-white/40 focus:border-[var(--primary)] focus:bg-white/10 focus:ring-2 focus:ring-[var(--primary)]/30 text-white"
                  : "bg-bg-alt focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary"
              )}
            />
            <kbd
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded border text-xs font-mono",
                userType === "admin"
                  ? "border-white/10 bg-white/5 text-white/50"
                  : "border-border bg-white text-text-secondary"
              )}
            >
              /
            </kbd>
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={cn("p-2.5 rounded-xl transition-colors", actionHover)}
          >
            {darkMode ? (
              <Sun className={cn("w-5 h-5", iconMuted)} />
            ) : (
              <Moon className={cn("w-5 h-5", iconMuted)} />
            )}
          </button>

          {/* Messages */}
          <Link
            href={paths.messages}
            className={cn("relative p-2.5 rounded-xl transition-colors", actionHover)}
          >
            <MessageSquare className={cn("w-5 h-5", iconMuted)} />
            {unreadMessages > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-5 rounded-full bg-primary text-[11px] text-white font-bold flex items-center justify-center px-1">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            )}
          </Link>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn("relative p-2.5 rounded-xl transition-colors", actionHover)}
            >
              <Bell className={cn("w-5 h-5", iconMuted)} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold animate-bounce-subtle">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-border shadow-2xl z-50 overflow-hidden animate-slide-up">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-semibold text-text-primary">Notifications</h3>
                    <button className="text-xs text-primary font-medium hover:underline">
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-text-secondary text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notification: any) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "p-4 border-b border-border last:border-0 hover:bg-bg-alt transition-colors cursor-pointer text-left",
                            !notification.isRead && "bg-primary/5"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                              !notification.isRead ? "bg-primary" : "bg-transparent"
                            )} />
                            <div className="flex-1 min-w-0 text-left">
                              <p className={cn("text-sm font-medium truncate", !notification.isRead ? "text-text-primary" : "text-text-secondary")}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-[10px] text-text-secondary/60 mt-1">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <Link
                    href={paths.notifications}
                    className="block p-3 text-center text-sm text-primary font-medium hover:bg-bg-alt transition-colors border-t border-border"
                  >
                    View all notifications
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-border mx-2" />

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className={cn("flex items-center gap-3 p-1.5 pr-3 rounded-xl transition-colors", actionHover)}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-semibold text-sm">
                {userName.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="hidden md:block text-left">
                <p className={cn("text-sm font-medium", userType === "admin" ? "text-white" : "text-text-primary")}>{userName}</p>
                <p className={cn("text-xs capitalize", userType === "admin" ? "text-white/60" : "text-text-secondary")}>{userType}</p>
              </div>
              <ChevronDown className={cn("w-4 h-4 hidden md:block", iconMuted)} />
            </button>

            {showProfile && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-border shadow-2xl z-50 overflow-hidden animate-slide-up">
                  <div className="p-4 border-b border-border">
                    <p className="font-semibold text-text-primary">{userName}</p>
                    <p className="text-sm text-text-secondary">{userEmail}</p>
                  </div>
                  <div className="p-2">
                    <Link
                      href={paths.profile}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-primary hover:bg-bg-alt transition-colors"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-primary hover:bg-bg-alt transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <Link
                      href="/help"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-primary hover:bg-bg-alt transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Help Center
                    </Link>
                  </div>
                  <div className="p-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
