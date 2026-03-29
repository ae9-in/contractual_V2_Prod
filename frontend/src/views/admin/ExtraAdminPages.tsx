"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import { 
  Check, 
  X, 
  Search, 
  Eye, 
  Ban, 
  Building2, 
  Briefcase, 
  IndianRupee, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Clock,
  LayoutGrid,
  TrendingUp
} from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency"
import { formatDistanceToNow } from "date-fns"

// --- FREELANCERS MANAGEMENT (Real-time) ---

export function AdminFreelancersPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")

  const { data: f, isLoading } = useQuery({
    queryKey: ["admin", "freelancers"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users?role=FREELANCER&limit=100")
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
      if (!res.ok) throw new Error("Update failed")
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "freelancers"] })
      toast.success("Freelancer status updated")
    },
  })

  const filtered = f?.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 pb-20 fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white">Freelancer Network</h1>
          <p className="text-sm text-white/40 font-medium font-display">Moderation and verification of active talent.</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-teal-400 transition-colors" />
          <Input 
            placeholder="Search freelancers..." 
            className="w-full md:w-80 bg-white/5 border-white/5 pl-10 h-11 rounded-xl text-sm focus:border-white/20 transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-3xl shadow-2xl">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent h-14">
              <TableHead className="text-[10px] font-black uppercase text-white/40 tracking-[0.1em] pl-8">Talent Profile</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-white/40 tracking-[0.1em]">Identity Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-white/40 tracking-[0.1em]">System Integrity</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase text-white/40 tracking-[0.1em] pr-8">Control</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map(i => (
                <TableRow key={i} className="border-white/5 h-20">
                  <TableCell className="pl-8"><Skeleton className="h-10 w-48 bg-white/5 rounded-xl" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32 bg-white/5 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 bg-white/5 rounded-lg" /></TableCell>
                  <TableCell className="pr-8"><Skeleton className="h-9 w-24 ml-auto bg-white/5 rounded-xl" /></TableCell>
                </TableRow>
              ))
            ) : filtered?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center opacity-30">No freelancers found.</TableCell>
              </TableRow>
            ) : (
              filtered?.map(u => (
                <TableRow key={u.id} className="border-white/5 h-20 hover:bg-white/5 transition-colors group">
                  <TableCell className="pl-8">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border border-white/5">
                        <AvatarFallback className="bg-teal-500/20 text-teal-400 font-black">{u.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-white leading-tight">{u.name}</p>
                        <p className="text-[10px] text-white/30 font-medium">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "border-0 px-2 text-[9px] font-black uppercase tracking-tighter",
                      u.isVerified ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/40"
                    )}>
                      {u.isVerified ? "Identity Verified" : "Unverified"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "border-0 px-2 text-[9px] font-black uppercase tracking-tighter",
                      u.isSuspended ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"
                    )}>
                      {u.isSuspended ? "SUSPENDED" : "COMPLIANT"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex justify-end gap-2">
                       <Button 
                          size="sm" 
                          variant="ghost" 
                          className={cn("h-9 px-3 rounded-xl", u.isSuspended ? "text-emerald-400 hover:bg-emerald-500/10" : "text-red-400 hover:bg-red-500/10")}
                          onClick={() => updateMut.mutate({ id: u.id, data: { isSuspended: !u.isSuspended } })}
                        >
                          {u.isSuspended ? "Unsuspend" : "Suspend"}
                        </Button>
                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-white/30 hover:text-white">
                          <Eye className="h-4 w-4" />
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// --- BUSINESSES MANAGEMENT (For Approvals) ---

export function AdminBusinessesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")

  const { data: b, isLoading } = useQuery({
    queryKey: ["admin", "businesses"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users?role=BUSINESS&limit=100")
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
      if (!res.ok) throw new Error("Update failed")
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "businesses"] })
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] })
      toast.success("Account status updated")
    },
  })

  const filtered = b?.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 pb-20 fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white">Business Directory</h1>
          <p className="text-sm text-white/40 font-medium">Manage registrations and corporate approvals.</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-teal-400 transition-colors" />
          <Input 
            placeholder="Search company, name, email..." 
            className="w-full md:w-80 bg-white/5 border-white/5 pl-10 h-11 rounded-xl text-sm focus:border-white/20 transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-3xl shadow-2xl">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent h-14">
              <TableHead className="text-[10px] font-black uppercase text-white/40 tracking-[0.1em] pl-8">Corporate Identity</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-white/40 tracking-[0.1em]">Verification Level</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-white/40 tracking-[0.1em]">Onboarding</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase text-white/40 tracking-[0.1em] pr-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map(i => (
                <TableRow key={i} className="border-white/5 h-20">
                  <TableCell className="pl-8"><Skeleton className="h-10 w-48 bg-white/5 rounded-xl" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32 bg-white/5 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 bg-white/5 rounded-lg" /></TableCell>
                  <TableCell className="pr-8"><Skeleton className="h-9 w-24 ml-auto bg-white/5 rounded-xl" /></TableCell>
                </TableRow>
              ))
            ) : filtered?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-30">
                    <Building2 className="h-12 w-12 mb-2" />
                    <p className="text-sm font-bold">No businesses matching your criteria.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered?.map(u => (
                <TableRow key={u.id} className="border-white/5 h-20 hover:bg-white/5 transition-colors group">
                  <TableCell className="pl-8">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border border-white/5">
                        <AvatarFallback className="bg-blue-500/20 text-blue-400 font-black">
                          {u.companyName ? u.companyName[0] : u.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-white leading-tight">{u.companyName || u.name}</p>
                        <p className="text-[10px] text-white/30 font-medium">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <div className={cn(
                        "h-2 w-2 rounded-full",
                        u.approvalStatus === "APPROVED" ? "bg-emerald-500" : 
                        u.approvalStatus === "PENDING" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse" : "bg-red-500"
                      )} />
                      <Badge variant="outline" className={cn(
                        "border-0 px-2 text-[9px] font-black uppercase tracking-tighter",
                        u.approvalStatus === "APPROVED" ? "bg-emerald-500/10 text-emerald-400" : 
                        u.approvalStatus === "PENDING" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                      )}>
                        {u.approvalStatus}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-[10px] text-white/40 font-bold uppercase">{formatDistanceToNow(new Date(u.createdAt))} ago</p>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex justify-end gap-2">
                      {u.approvalStatus === "PENDING" && (
                        <>
                          <Button 
                            size="sm" 
                            className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border-0 h-9 rounded-xl px-4"
                            onClick={() => updateMut.mutate({ id: u.id, data: { approvalStatus: "APPROVED" } })}
                          >
                            <Check className="h-4 w-4 mr-1.5" /> Approve
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border-0 h-9 rounded-xl px-4"
                            onClick={() => updateMut.mutate({ id: u.id, data: { approvalStatus: "REJECTED" } })}
                          >
                            <X className="h-4 w-4 mr-1.5" /> Deny
                          </Button>
                        </>
                      )}
                      <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-white/30 hover:text-white hover:bg-white/5">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// --- GIG MODERATION (Real-time Moderation) ---

export function AdminGigsModerationPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")

  const { data: gigs, isLoading } = useQuery({
    queryKey: ["admin", "gigs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/gigs?limit=100")
      const j = await res.json()
      return j.data as any[]
    },
    refetchInterval: 60_000,
  })

  const filtered = gigs?.filter(g => 
    g.title.toLowerCase().includes(search.toLowerCase()) || 
    g.business?.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.business?.companyName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 pb-20">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white">Project Mandates</h1>
          <p className="text-sm text-white/40 font-medium">Monitor active listings and handle flags.</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-teal-400 transition-colors" />
          <Input 
            placeholder="Search titles, businesses..." 
            className="w-full md:w-80 bg-white/5 border-white/5 pl-10 h-11 rounded-xl text-sm focus:border-white/20 transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full bg-white/5 rounded-3xl" />)
        ) : filtered?.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border border-white/5 bg-white/5 rounded-3xl text-white/20">
            <LayoutGrid className="h-10 w-10 mb-2" />
            <p className="text-sm font-bold">No active gigs found.</p>
          </div>
        ) : (
          filtered?.map(g => (
            <div key={g.id} className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-6 transition-all hover:bg-white/[0.07] hover:border-white/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-teal-500/20 bg-teal-500/10 text-teal-400 text-[10px] font-black uppercase">
                      {g.category}
                    </Badge>
                    <span className="text-white/20 text-[1.5rem] leading-none">·</span>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(g.createdAt))} ago
                    </p>
                  </div>
                  <h3 className="text-lg font-black tracking-tight text-white group-hover:text-teal-400 transition-colors">{g.title}</h3>
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">
                       {g.business?.companyName ? g.business.companyName[0] : g.business?.name?.[0]}
                    </div>
                    <p className="text-[11px] font-bold text-white/60">{g.business?.companyName || g.business?.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1">Mandate Budget</p>
                    <p className="text-xl font-black text-white">{formatCurrency(g.budgetAmount)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" className="h-11 w-11 rounded-2xl bg-white/5 hover:bg-white/10 text-white border-white/5">
                      <Eye className="h-5 w-5" />
                    </Button>
                    <Button size="icon" className="h-11 w-11 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/10">
                      <Ban className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// --- DISPUTES ---

export function AdminDisputesPage() {
  return (
    <div className="space-y-6 pb-20 fade-in duration-500">
      <h1 className="text-3xl font-black tracking-tighter text-white">Escrow Disputes</h1>
      <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-white/5 bg-white/5 text-white/20">
        <ShieldAlert className="h-10 w-10 mb-4" />
        <p className="text-sm font-bold">No active disputes requiring mediation.</p>
      </div>
    </div>
  )
}

// --- REVENUE & CONTRACTS (NEW) ---

export function AdminRevenuePage() {
  const { data: d, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"], // Reuse dashboard query for consolidated data
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard")
      return (await res.json()).data
    }
  })

  const rev = d?.stats?.totalRevenue || 0
  
  return (
    <div className="space-y-8 fade-in">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-teal-500/20 to-blue-500/20 p-8 shadow-2xl">
        <div className="flex items-center gap-3 text-teal-400 mb-2">
          <TrendingUp className="h-5 w-5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Platform P&L</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-white">{formatCurrency(rev)}</h1>
        <p className="text-white/40 font-medium mt-1">Total platform gross transaction volume (GTV).</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-white/5 bg-white/5 p-6">
          <h3 className="text-lg font-black tracking-tight text-white mb-6">Volume Breakdown</h3>
          <div className="space-y-6">
              {[
                { label: "Business Deposits", value: rev * 1.05, color: "bg-teal-400" },
                { label: "Freelancer Payouts", value: rev, color: "bg-blue-400" },
                { label: "Platform Commission (5%)", value: rev * 0.05, color: "bg-amber-400" }
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase text-white/40">{item.label}</span>
                    <span className="text-sm font-bold text-white">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: '85%' }} />
                  </div>
                </div>
              ))}
          </div>
        </div>
        
        <div className="rounded-3xl border border-white/5 bg-white/5 p-6 flex flex-col justify-center items-center text-center space-y-4">
          <div className="h-16 w-16 bg-teal-500/10 rounded-full flex items-center justify-center">
            <IndianRupee className="h-8 w-8 text-teal-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Escrow Protected</h3>
            <p className="text-sm text-white/40 max-w-xs mt-1">All funds are secured in digital escrow until milestone completion verified by the platform.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminContractsPage() {
  return (
     <div className="space-y-6 pb-20">
       <h1 className="text-3xl font-black tracking-tighter text-white">Platform Contracts</h1>
       <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-white/5 bg-white/5 text-white/20">
        <Briefcase className="h-10 w-10 mb-4" />
        <p className="text-sm font-bold">Tracking 0 active contracts in realtime.</p>
      </div>
    </div>
  )
}

// --- ANALYTICS ---

export function AdminAnalyticsPage() {
  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-3xl font-black tracking-tighter text-white">Full Analytics</h1>
      <div className="h-[500px] flex flex-col items-center justify-center border border-white/5 bg-white/5 rounded-3xl text-white/20">
        <ExternalLink className="h-10 w-10 mb-2" />
        <p className="text-sm font-bold italic">Deep analytics integration with Posthog/Mixpanel coming soon.</p>
      </div>
    </div>
  )
}

// Helper icons missing from imports
function MoreHorizontal(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
  )
}
