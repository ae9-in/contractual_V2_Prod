"use client"

import { useState } from "react"
import Link from "next/link"
import {
  UserPlus,
  FileCheck,
  Banknote,
  AlertTriangle,
  Star,
  CheckCircle,
  MessageCircle,
  X,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type Notif = {
  id: string
  type: "proposal" | "contract" | "pay" | "dispute" | "review" | "gig" | "msg"
  title: string
  desc: string
  time: string
  unread: boolean
  avatar?: boolean
}

const notifications: Notif[] = [
  { id: "1", type: "proposal", title: "New proposal", desc: "Jordan sent a proposal for your React gig.", time: "5m ago", unread: true },
  { id: "2", type: "contract", title: "Contract signed", desc: "CNT-2026-0092 is now active.", time: "1h ago", unread: true },
  { id: "3", type: "pay", title: "Payment released", desc: "₹840 released to Maya Roy.", time: "Yesterday", unread: false },
  { id: "4", type: "dispute", title: "Dispute opened", desc: "Order ORD-883 flagged for review.", time: "2d ago", unread: true },
  { id: "5", type: "review", title: "New review", desc: "5★ from Bloom & Co.", time: "3d ago", unread: false, avatar: true },
  { id: "6", type: "gig", title: "Gig approved", desc: "Your gig passed moderation.", time: "1w ago", unread: false },
  { id: "7", type: "msg", title: "New message", desc: "Unread messages in Logo project.", time: "1w ago", unread: false },
]

function TypeIcon({ type }: { type: Notif["type"] }) {
  const wrap = "flex h-10 w-10 items-center justify-center rounded-full"
  const map = {
    proposal: { Icon: UserPlus, className: `${wrap} bg-[var(--primary-light)] text-[var(--primary-dark)]` },
    contract: { Icon: FileCheck, className: `${wrap} bg-emerald-100 text-emerald-800` },
    pay: { Icon: Banknote, className: `${wrap} bg-amber-100 text-amber-800` },
    dispute: { Icon: AlertTriangle, className: `${wrap} bg-red-100 text-red-700` },
    review: { Icon: Star, className: `${wrap} bg-amber-100 text-amber-700` },
    gig: { Icon: CheckCircle, className: `${wrap} bg-[var(--primary-light)] text-[var(--primary-dark)]` },
    msg: { Icon: MessageCircle, className: `${wrap} bg-sky-100 text-sky-800` },
  }
  const { Icon, className } = map[type]
  return (
    <div className={className}>
      <Icon className="h-5 w-5" />
    </div>
  )
}

export function NotificationsPage({ userType }: { userType: "business" | "freelancer" | "admin" }) {
  const [items, setItems] = useState(notifications)
  const unread = items.filter((n) => n.unread).length

  const dismiss = (id: string) => setItems((xs) => xs.filter((n) => n.id !== id))
  const markAllRead = () => setItems((xs) => xs.map((n) => ({ ...n, unread: false })))

  const filterTab = (type: string) => {
    if (type === "all") return items
    // demo grouping
    if (type === "contracts") return items.filter((n) => ["contract", "dispute", "gig"].includes(n.type))
    if (type === "proposals") return items.filter((n) => n.type === "proposal")
    if (type === "payments") return items.filter((n) => n.type === "pay")
    return items.filter((n) => n.type === "msg" || n.type === "review")
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
      <div className="min-w-0 flex-1 space-y-6">
        <div className="page-section-enter flex flex-wrap items-center justify-between gap-3" style={{ ["--stagger-delay" as string]: "0s" }}>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Notifications</h1>
            {unread > 0 && (
              <Badge className="bg-[var(--primary)] text-white hover:bg-[var(--primary)]">{unread} new</Badge>
            )}
          </div>
          <button type="button" onClick={markAllRead} className="text-sm font-semibold text-[var(--primary-dark)] hover:underline">
            Mark all read
          </button>
        </div>

        <Tabs defaultValue="all" className="page-section-enter w-full" style={{ ["--stagger-delay" as string]: "0.05s" }}>
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-[var(--bg-alt)] p-1">
            <TabsTrigger value="all" className="rounded-lg">
              All ({items.length})
            </TabsTrigger>
            <TabsTrigger value="contracts" className="rounded-lg">
              Contracts (8)
            </TabsTrigger>
            <TabsTrigger value="proposals" className="rounded-lg">
              Proposals (12)
            </TabsTrigger>
            <TabsTrigger value="payments" className="rounded-lg">
              Payments (4)
            </TabsTrigger>
            <TabsTrigger value="system" className="rounded-lg">
              System (3)
            </TabsTrigger>
          </TabsList>
          {(["all", "contracts", "proposals", "payments", "system"] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4 space-y-2">
              {filterTab(tab).map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "group relative flex gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 pr-10 shadow-sm transition-all card-hover-lift",
                    n.unread && "border-l-[3px] border-l-[var(--primary)] bg-[var(--primary-light)]/40"
                  )}
                >
                  {n.avatar ? (
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-[var(--primary)] text-white">B</AvatarFallback>
                    </Avatar>
                  ) : (
                    <TypeIcon type={n.type} />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[var(--text-primary)]">{n.title}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{n.desc}</p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">{n.time}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {n.unread && <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />}
                    <button
                      type="button"
                      aria-label="Dismiss"
                      onClick={() => dismiss(n.id)}
                      className="absolute right-3 top-3 rounded-lg p-1 text-[var(--text-secondary)] opacity-0 transition-opacity hover:bg-[var(--bg-alt)] group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <aside
        className="page-section-enter w-full shrink-0 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm lg:w-[280px]"
        style={{ ["--stagger-delay" as string]: "0.1s" }}
      >
        <h2 className="font-semibold text-[var(--text-primary)]">Notification settings</h2>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">Control how Contractual reaches you.</p>
        <div className="mt-6 space-y-5">
          {[
            { id: "email", label: "Email notifications", sub: "Digest + important alerts" },
            { id: "push", label: "Push notifications", sub: "Real-time on this device" },
            { id: "prop", label: "New proposals", sub: "When talent applies" },
            { id: "cont", label: "Contract updates", sub: "Signed, delivered, disputes" },
            { id: "pay", label: "Payment alerts", sub: "Escrow releases & payouts" },
            { id: "promo", label: "Promotional", sub: "Product news (rare)" },
          ].map((row) => (
            <div key={row.id} className="flex items-start justify-between gap-3">
              <div>
                <Label htmlFor={row.id} className="text-sm font-medium text-[var(--text-primary)]">
                  {row.label}
                </Label>
                <p className="text-[12px] leading-snug text-[var(--text-secondary)]">{row.sub}</p>
              </div>
              <Switch id={row.id} defaultChecked={row.id !== "promo"} />
            </div>
          ))}
        </div>
        <Button variant="outline" className="mt-6 w-full rounded-xl border-[var(--primary)] text-[var(--primary-dark)]" asChild>
          <Link href="/dashboard/settings">Advanced preferences</Link>
        </Button>
      </aside>
    </div>
  )
}
