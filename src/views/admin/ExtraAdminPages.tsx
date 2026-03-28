"use client"

import { MOCK_FREELANCERS, MOCK_GIGS, MOCK_MONTHLY_GMV } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { AlertTriangle, Check, X, ShieldAlert, Ban, Eye, Loader2, Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"

export function AdminUsersPage() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin", "users", activeTab],
    queryFn: async () => {
      const roleFilter = activeTab === "all" ? "" : activeTab === "business" ? "BUSINESS" : "FREELANCER"
      const res = await fetch(`/api/admin/users?role=${roleFilter}&limit=50`)
      const j = await res.json()
      return j.data as any[]
    },
    refetchInterval: 30_000,
  })

  const updateMut = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update user")
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] })
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] })
      toast.success("User updated successfully")
    },
    onError: (e: any) => toast.error(e.message),
  })

  const filtered = users?.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.companyName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 text-white pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black tracking-tight">User management</h1>
          <p className="text-sm text-white/50">Approve businesses, moderate accounts, and track status.</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-teal-400 transition-colors" />
          <Input 
            placeholder="Search name, email, company..." 
            className="w-full md:w-72 bg-white/5 border-white/10 pl-10 h-11 rounded-xl text-sm focus:border-teal-500/50 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-2">
          <TabsList className="bg-white/5 p-1 rounded-xl">
            <TabsTrigger value="all" className="rounded-lg px-6">All Users</TabsTrigger>
            <TabsTrigger value="business" className="rounded-lg px-6">Businesses</TabsTrigger>
            <TabsTrigger value="freelancer" className="rounded-lg px-6">Freelancers</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-4 rounded-3xl border border-white/5 bg-[var(--dark-surface)]/40 shadow-2xl backdrop-blur-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-white/40 font-bold uppercase tracking-widest text-[10px] h-14 pl-6">User</TableHead>
                <TableHead className="text-white/40 font-bold uppercase tracking-widest text-[10px] h-14">Role</TableHead>
                <TableHead className="text-white/40 font-bold uppercase tracking-widest text-[10px] h-14">Profile Status</TableHead>
                <TableHead className="text-right text-white/40 font-bold uppercase tracking-widest text-[10px] h-14 pr-6">Quick Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i} className="border-white/5 h-20">
                      <TableCell className="pl-6"><Skeleton className="h-10 w-40 bg-white/5" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24 bg-white/5" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-32 bg-white/5" /></TableCell>
                      <TableCell className="pr-6"><Skeleton className="h-8 w-24 ml-auto bg-white/5" /></TableCell>
                    </TableRow>
                  ))}
                </>
              ) : filtered?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-64 text-center text-white/30">
                    No users found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filtered?.map((u) => (
                  <TableRow key={u.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-white/10 ring-2 ring-transparent group-hover:ring-teal-500/20 transition-all">
                          <AvatarFallback className="bg-gradient-to-br from-teal-500/20 to-blue-500/20 text-teal-200 font-bold">
                            {u.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-white group-hover:text-teal-400 transition-colors">{u.name}</p>
                          <p className="text-xs text-white/40">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className={cn(
                          "border-0 px-2 py-0.5 w-fit text-[10px] font-black uppercase tracking-tighter",
                          u.role === "BUSINESS" ? "bg-blue-500/10 text-blue-400" : "bg-teal-500/10 text-teal-400"
                        )}>
                          {u.role}
                        </Badge>
                        {u.companyName && <span className="text-[11px] text-white/60 font-medium">{u.companyName}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-1.5 w-1.5 rounded-full animate-pulse",
                            u.approvalStatus === "APPROVED" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
                            u.approvalStatus === "PENDING" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                          )} />
                          <span className={cn(
                            "text-xs font-bold uppercase tracking-tight",
                            u.approvalStatus === "APPROVED" ? "text-emerald-400" : 
                            u.approvalStatus === "PENDING" ? "text-amber-400" : "text-red-400"
                          )}>
                            {u.approvalStatus}
                          </span>
                        </div>
                        {u.isSuspended && <Badge className="bg-red-500/20 text-red-400 border-red-500/20 text-[9px]">Account Suspended</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                        {u.approvalStatus === "PENDING" && (
                          <>
                            <Button 
                              size="sm" 
                              className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border-0 h-8 rounded-lg"
                              onClick={() => updateMut.mutate({ id: u.id, data: { approvalStatus: "APPROVED" } })}
                            >
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="bg-red-600/20 text-red-400 hover:bg-red-600 h-8 rounded-lg"
                              onClick={() => updateMut.mutate({ id: u.id, data: { approvalStatus: "REJECTED" } })}
                            >
                              <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-white hover:bg-white/10">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className={cn("h-8 w-8 rounded-lg", u.isSuspended ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 hover:bg-red-500/10")}
                          onClick={() => updateMut.mutate({ id: u.id, data: { isSuspended: !u.isSuspended } })}
                          title={u.isSuspended ? "Unsuspend" : "Suspend"}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function AdminGigsModerationPage() {
  return (
    <div className="space-y-6 text-white">
      <h1 className="font-display text-2xl font-bold">Gig moderation</h1>
      <div className="rounded-2xl border border-white/10 bg-[var(--dark-card)]/80 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead className="text-white/80">Gig</TableHead>
              <TableHead className="text-white/80">Category</TableHead>
              <TableHead className="text-white/80">Budget</TableHead>
              <TableHead className="text-white/80 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_GIGS.slice(0, 10).map((g) => (
              <TableRow key={g.id} className="border-white/10">
                <TableCell className="max-w-[240px] truncate">{g.title}</TableCell>
                <TableCell>{g.category}</TableCell>
                <TableCell className="font-mono">${g.price}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" className="border-white/20 text-white">
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-400/40 text-red-300">
                    <X className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

const disputes = [
  { id: "D-0284", title: "Build E-commerce Platform", urgent: true, amount: "₹2,400" },
  { id: "D-0199", title: "API integration delay", urgent: false, amount: "₹890" },
]

export function AdminDisputesPage() {
  return (
    <div className="space-y-6 text-white">
      <h1 className="font-display text-2xl font-bold">Disputes</h1>
      <div className="grid gap-4">
        {disputes.map((d) => (
          <div
            key={d.id}
            className="rounded-2xl border border-white/10 bg-[var(--dark-card)]/90 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm text-white/60">{d.id}</span>
                {d.urgent && (
                  <Badge className="bg-red-500/20 text-red-300 border-red-500/40">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Urgent
                  </Badge>
                )}
              </div>
              <p className="font-semibold">{d.title}</p>
              <p className="text-sm text-white/50 mt-1">In dispute: {d.amount}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="bg-[var(--cta-amber)] text-white">Mediate</Button>
              <Button variant="outline" className="border-white/20 text-white">
                Resolve
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AdminContractsPage() {
  return (
    <div className="space-y-6 text-white">
      <h1 className="font-display text-2xl font-bold">Contracts</h1>
      <p className="text-white/60 text-sm">Platform-wide contract health (mock).</p>
      <div className="h-64 rounded-2xl border border-white/10 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MOCK_MONTHLY_GMV.map((m) => ({ name: m.month, contracts: Math.round(m.value / 8000) }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)" }} />
            <Bar dataKey="contracts" fill="var(--primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function AdminPaymentsPage() {
  return (
    <div className="space-y-6 text-white">
      <h1 className="font-display text-2xl font-bold">Payments</h1>
      <p className="text-white/60">Escrow releases and Stripe payouts (mock).</p>
      <div className="rounded-2xl border border-white/10 bg-[var(--dark-card)]/80 p-6 font-mono text-lg">
        GMV (demo): ${MOCK_MONTHLY_GMV.reduce((a, b) => a + b.value, 0).toLocaleString()}
      </div>
    </div>
  )
}

const funnel = [
  { step: "Visit", v: 10000 },
  { step: "Sign up", v: 3200 },
  { step: "Post / Apply", v: 1800 },
  { step: "Contract", v: 640 },
]

export function AdminAnalyticsPage() {
  return (
    <div className="space-y-8 text-white">
      <h1 className="font-display text-2xl font-bold">Analytics</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-72 rounded-2xl border border-white/10 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_MONTHLY_GMV}>
              <defs>
                <linearGradient id="gmv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)" }} />
              <Area type="monotone" dataKey="value" stroke="var(--primary)" fill="url(#gmv)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="h-72 rounded-2xl border border-white/10 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnel} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="step" type="category" stroke="#94a3b8" width={100} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)" }} />
              <Bar dataKey="v" fill="var(--primary)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
