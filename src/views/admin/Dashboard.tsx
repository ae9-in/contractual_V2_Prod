"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts"
import {
  Users,
  Briefcase,
  FileSignature,
  IndianRupee,
  AlertTriangle,
  Search,
  MoreHorizontal,
  Check,
  Ban,
  ShieldAlert,
  Eye,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

import { useQuery } from "@tanstack/react-query"
import { formatCurrency } from "@/lib/currency"
import { formatDistanceToNow } from "date-fns"

type DashboardStats = {
  totalUsers: number
  activeGigs: number
  contractsToday: number
  totalRevenue: number
  pendingDisputes: number
  pendingBusinesses: number
  flaggedGigs: number
}

type ActivityItem = {
  id: string
  type: string
  message: string
  createdAt: string
  user: { name: string; role: string } | null
}

async function fetchAdminDashboard() {
  const res = await fetch("/api/admin/dashboard")
  const j = await res.json()
  if (!res.ok) throw new Error(j.error || "Dashboard error")
  return j.data as { stats: DashboardStats; recentActivity: ActivityItem[] }
}


const financeLine = [
  { x: "W1", rev: 12000, pay: 9800 },
  { x: "W2", rev: 14200, pay: 11500 },
  { x: "W3", rev: 13800, pay: 11200 },
  { x: "W4", rev: 16200, pay: 12800 },
]

const usersRows = [
  { name: "Sarah Chen", role: "Business", status: "Active", joined: "Jan 2025", contracts: 42, revenue: "₹48k" },
  { name: "Leo Park", role: "Freelancer", status: "Suspended", joined: "Nov 2024", contracts: 18, revenue: "₹12k" },
  { name: "Maya Roy", role: "Freelancer", status: "Active", joined: "Feb 2026", contracts: 56, revenue: "₹72k" },
]

function MiniGauge({ label, value, color }: { label: string; value: number; color: string }) {
  const data = [{ name: "v", value, fill: color }]
  return (
    <div className="page-section-enter flex flex-col items-center rounded-2xl border border-white/10 bg-[var(--dark-surface)] p-4" style={{ ["--stagger-delay" as string]: "0.2s" }}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/60">{label}</p>
      <div className="h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="68%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "rgba(255,255,255,0.06)" }} isAnimationActive animationDuration={1200} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <p className="font-mono text-xl font-bold text-white">{value}%</p>
    </div>
  )
}

export function AdminDashboardPage() {
  const [period, setPeriod] = useState("30d")

  const { data: d, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: fetchAdminDashboard,
    refetchInterval: 15_000,
  })

  if (isLoading) return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Skeleton className="h-[140px] w-full rounded-2xl bg-white/5" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32 rounded-2xl bg-white/5" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(350px,30%)]">
        <Skeleton className="h-96 rounded-2xl bg-white/5" />
        <Skeleton className="h-96 rounded-2xl bg-white/5" />
      </div>
    </div>
  )

  if (isError) return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">
      Error loading dashboard: {(error as Error).message}
    </div>
  )

  const s = d!.stats
  const activity = d!.recentActivity

  const statCards = [
    { label: "Total Users", value: s.totalUsers.toLocaleString(), icon: Users },
    { label: "Active Gigs", value: s.activeGigs.toLocaleString(), icon: Briefcase },
    { label: "Contracts Today", value: s.contractsToday.toLocaleString(), icon: FileSignature },
    { label: "Revenue (MTD)", value: formatCurrency(s.totalRevenue), icon: IndianRupee },
    { label: "Pending Businesses", value: s.pendingBusinesses.toLocaleString(), icon: Users, alert: s.pendingBusinesses > 0 },
    { label: "Pending Disputes", value: s.pendingDisputes.toLocaleString(), icon: AlertTriangle, alert: s.pendingDisputes > 0 },
  ]

  return (
    <div className="space-y-8 text-white">
      <div className="page-section-enter relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[var(--dark-surface)] to-[#252545] p-8" style={{ ["--stagger-delay" as string]: "0s" }}>
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-[var(--primary)] blur-3xl animate-float" />
          <div className="absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-[var(--cta-amber)] blur-3xl animate-float-delayed" />
        </div>
        <div className="relative flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-white/60">Platform overview</p>
            <h2 className="text-3xl font-bold tracking-tight">Admin command center</h2>
          </div>
          <Alert className="max-w-md border-amber-500/40 bg-amber-500/10 text-amber-100 backdrop-blur-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Attention needed</AlertTitle>
            <AlertDescription className="text-amber-100/90">
              {s.pendingBusinesses} pending businesses · {s.pendingDisputes} active disputes · {s.flaggedGigs} flagged gigs
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((c, i) => (
          <div
            key={c.label}
            className="page-section-enter card-hover-lift rounded-2xl border border-white/10 bg-[var(--dark-surface)] p-6 shadow-xl"
            style={{ ["--stagger-delay" as string]: `${0.05 * i}s` }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/50">{c.label}</p>
                <p className="mt-2 font-mono text-2xl font-black text-white">{c.value}</p>
              </div>
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg",
                c.alert ? "bg-red-500/10 text-red-500" : "bg-teal-500/10 text-teal-400"
              )}>
                <c.icon className="h-6 w-6" />
              </div>
            </div>
            {c.alert && (
              <Link href={c.label.includes("Businesses") ? "/admin/users" : "/admin/disputes"} className="mt-4 flex items-center justify-between rounded-xl bg-red-500/20 px-4 py-2 text-xs font-bold text-red-200 hover:bg-red-500/30 transition-all">
                <span>View Requests</span>
                <Check className="h-3 w-3" />
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MiniGauge label="Platform Stability" value={99.9} color="var(--success)" />
        <MiniGauge label="Payment Success" value={97.2} color="var(--primary)" />
        <MiniGauge label="Dispute Resolution" value={94} color="var(--cta-amber)" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(350px,30%)]">
        <Tabs defaultValue="flagged" className="page-section-enter space-y-4 rounded-2xl border border-white/10 bg-[var(--dark-surface)] p-6 shadow-sm" style={{ ["--stagger-delay" as string]: "0.25s" }}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-white/5 p-1 rounded-xl">
              <TabsTrigger value="flagged" className="rounded-lg">Flagged Gigs ({s.flaggedGigs})</TabsTrigger>
              <TabsTrigger value="disputes" className="rounded-lg">Disputes ({s.pendingDisputes})</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="flagged" className="space-y-3">
            {s.flaggedGigs === 0 ? (
              <p className="text-sm text-white/40 italic py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">No gigs in the flagged queue.</p>
            ) : (
              <p className="text-sm text-white/60">Manage flagged content here...</p>
            )}
          </TabsContent>
          <TabsContent value="disputes">
            <p className="text-white/60">Disputed contracts feed into settlement tools.</p>
          </TabsContent>
        </Tabs>

        <div className="page-section-enter space-y-4 rounded-2xl border border-white/10 bg-[var(--dark-surface)] p-6 shadow-sm" style={{ ["--stagger-delay" as string]: "0.3s" }}>
          <h3 className="text-lg font-bold">Recent activity</h3>
          <div className="space-y-4">
            {activity.map((a, i) => (
              <div key={a.id} className="relative flex gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                  a.type.includes("REGISTERED") ? "bg-teal-500/20 text-teal-400" : "bg-blue-500/20 text-blue-400"
                )}>
                  {a.user?.name ? a.user.name[0] : "S"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white/90 truncate">{a.message}</p>
                  <p className="text-[10px] text-white/40 mt-1">{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</p>
                </div>
              </div>
            ))}
            {activity.length === 0 && (
              <p className="text-xs text-center text-white/30 py-10">No platform activity logged.</p>
            )}
          </div>
        </div>
      </div>

      <div
        className="page-section-enter rounded-2xl border border-white/10 bg-[var(--dark-surface)] p-5"
        style={{ ["--stagger-delay" as string]: "0.3s" }}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">User management</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input placeholder="Search users..." className="h-10 w-56 rounded-xl border-white/10 bg-white/5 pl-9 text-white placeholder:text-white/40" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-36 border-white/10 bg-white/5 text-white">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="biz">Business</SelectItem>
                <SelectItem value="free">Freelancer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/70">User</TableHead>
              <TableHead className="text-white/70">Role</TableHead>
              <TableHead className="text-white/70">Status</TableHead>
              <TableHead className="text-white/70">Joined</TableHead>
              <TableHead className="text-white/70">Contracts</TableHead>
              <TableHead className="text-white/70">Revenue</TableHead>
              <TableHead className="text-right text-white/70">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersRows.map((u, i) => (
              <TableRow
                key={i}
                className={cn(
                  "border-white/10 hover:bg-white/5",
                  u.status === "Suspended" && "border-l-4 border-l-red-500 bg-red-500/5"
                )}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-[var(--primary)] text-white">{u.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-white">{u.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-white/80">{u.role}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={u.status === "Suspended" ? "bg-red-500/20 text-red-200" : "bg-emerald-500/20 text-emerald-100"}>
                    {u.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-white/60">{u.joined}</TableCell>
                <TableCell className="font-mono text-white/90">{u.contracts}</TableCell>
                <TableCell className="font-mono text-[var(--primary)]">{u.revenue}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/10">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-amber-300 hover:bg-amber-500/10">
                      <ShieldAlert className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-red-300 hover:bg-red-500/10">
                      <Ban className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div
        className="page-section-enter rounded-2xl border border-white/10 bg-[var(--dark-surface)] p-5"
        style={{ ["--stagger-delay" as string]: "0.35s" }}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">Financial overview</h3>
          <div className="flex gap-1 rounded-lg bg-white/5 p-1">
            {["7D", "30D", "90D", "1Y"].map((p) => (
              <Button
                key={p}
                size="sm"
                variant={period === p ? "default" : "ghost"}
                className={cn(period === p ? "bg-[var(--primary)]" : "text-white/70 hover:bg-white/10")}
                onClick={() => setPeriod(p)}
              >
                {p}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          {[
            { k: "Gross revenue", v: "₹162k" },
            { k: "Platform fees (10%)", v: "₹16.2k" },
            { k: "Freelancer payouts", v: "{auto}" },
            { k: "Refunds", v: "₹1.1k" },
          ].map((m, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/50">{m.k}</p>
              <p className="font-mono text-lg font-semibold text-white">{m.v === "{auto}" ? "₹128.4k" : m.v}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={financeLine}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <XAxis dataKey="x" stroke="rgba(255,255,255,0.4)" />
              <YAxis stroke="rgba(255,255,255,0.4)" />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }} />
              <Legend />
              <Line type="monotone" dataKey="rev" name="Revenue" stroke="var(--primary)" strokeWidth={2} dot={false} isAnimationActive animationDuration={1200} />
              <Line type="monotone" dataKey="pay" name="Payouts" stroke="var(--cta-amber)" strokeWidth={2} dot={false} isAnimationActive animationDuration={1200} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
