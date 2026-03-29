"use client"

import { useState } from "react"
import Link from "next/link"
import dynamic from 'next/dynamic'

const Area = dynamic(() => import('recharts').then(mod => mod.Area as any), { ssr: false }) as any
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart as any), { ssr: false }) as any
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid as any), { ssr: false }) as any
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer as any), { ssr: false }) as any
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip as any), { ssr: false }) as any
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis as any), { ssr: false }) as any
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis as any), { ssr: false }) as any
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar as any), { ssr: false }) as any
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart as any), { ssr: false }) as any
const RadialBarChart = dynamic(() => import('recharts').then(mod => mod.RadialBarChart as any), { ssr: false }) as any
const RadialBar = dynamic(() => import('recharts').then(mod => mod.RadialBar as any), { ssr: false }) as any
const PolarAngleAxis = dynamic(() => import('recharts').then(mod => mod.PolarAngleAxis as any), { ssr: false }) as any
import {
  Users,
  Briefcase,
  FileSignature,
  IndianRupee,
  AlertTriangle,
  Check,
  Ban,
  ShieldAlert,
  Eye,
  TrendingUp,
  Activity,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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

type TopGig = {
  id: string
  title: string
  budgetAmount: number
  currency: string
  _count: { applications: number }
}

type RevenueData = {
  agreedPrice: number
  completedAt: string
}

async function fetchAdminDashboard() {
  const res = await fetch("/api/admin/dashboard")
  const j = await res.json()
  if (!res.ok) throw new Error(j.error || "Dashboard error")
  return j.data as { 
    stats: DashboardStats; 
    recentActivity: ActivityItem[];
    topGigs: TopGig[];
    weeklyRevenue: RevenueData[];
  }
}

function MiniGauge({ label, value, color }: { label: string; value: number; color: string }) {
  const data = [{ name: "v", value, fill: color }]
  return (
    <div className="flex flex-col items-center rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/40">{label}</p>
      <div className="h-28 w-28">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "rgba(255,255,255,0.03)" }} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-[-1.5rem] font-mono text-lg font-black text-white">{value}%</p>
    </div>
  )
}

export function AdminDashboardPage() {
  const { data: d, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: fetchAdminDashboard,
    refetchInterval: 15_000,
  })

  if (isLoading) return (
    <div className="space-y-8 p-6">
      <Skeleton className="h-[120px] w-full rounded-2xl bg-white/5" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl bg-white/5" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="lg:col-span-2 h-80 rounded-2xl bg-white/5" />
        <Skeleton className="h-80 rounded-2xl bg-white/5" />
      </div>
    </div>
  )

  if (isError) return (
    <div className="m-6 rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">
      <ShieldAlert className="mb-2 h-6 w-6" />
      <p className="font-bold">System Connection Error</p>
      <p className="text-sm opacity-80">{(error as Error).message}</p>
    </div>
  )

  const { stats: s, recentActivity: activity, topGigs, weeklyRevenue } = d!

  const statCards = [
    { label: "Gross Revenue", value: formatCurrency(s.totalRevenue), icon: IndianRupee, trend: "+12.5%" },
    { label: "Active Mandates", value: s.activeGigs, icon: Briefcase, trend: "+4" },
    { label: "New Contracts", value: s.contractsToday, icon: FileSignature, color: "text-teal-400" },
    { label: "Total Community", value: s.totalUsers, icon: Users, color: "text-blue-400" },
  ]

  // Process revenue trend for chart
  const revenueChartData = weeklyRevenue.reduce((acc: any[], curr) => {
    const day = new Date(curr.completedAt).toLocaleDateString("en-IN", { weekday: "short" })
    const existing = acc.find(a => a.day === day)
    if (existing) existing.value += curr.agreedPrice
    else acc.push({ day, value: curr.agreedPrice })
    return acc
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-8 shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-500/10 blur-[100px]" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px]" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-teal-400 mb-1">
              <Activity className="h-4 w-4 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Real-time Operations</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white">System Command</h1>
            <p className="text-white/40 text-sm font-medium">Monitoring {s.totalUsers.toLocaleString()} users across {s.activeGigs} active gigs.</p>
          </div>

          {(s.pendingBusinesses > 0 || s.pendingDisputes > 0) && (
            <div className="flex gap-4">
              {s.pendingBusinesses > 0 && (
                <Link href="/admin/businesses" className="group">
                  <div className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-2xl p-4 transition-all duration-300">
                    <p className="text-[10px] font-black uppercase text-amber-500/60 mb-1">Business Approvals</p>
                    <p className="text-2xl font-black text-amber-400 tracking-tighter">{s.pendingBusinesses}</p>
                  </div>
                </Link>
              )}
              {s.pendingDisputes > 0 && (
                <Link href="/admin/disputes" className="group">
                  <div className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl p-4 transition-all duration-300">
                    <p className="text-[10px] font-black uppercase text-red-500/60 mb-1">Active Disputes</p>
                    <p className="text-2xl font-black text-red-400 tracking-tighter">{s.pendingDisputes}</p>
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((c, i) => (
          <div key={c.label} className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-5 transition-all hover:bg-white/[0.08] hover:border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{c.label}</p>
                <p className="mt-1 text-2xl font-black tracking-tighter text-white">{c.value}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white transition-colors">
                <c.icon className="h-5 w-5" />
              </div>
            </div>
            {c.trend && (
              <div className="mt-3 flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400">{c.trend}</span>
                <span className="text-[10px] text-white/20">vs last month</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Primary Analytics Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Performance */}
        <div className="lg:col-span-2 rounded-3xl border border-white/5 bg-[#0f172a]/50 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black tracking-tight text-white">Revenue Velocity</h3>
              <p className="text-xs text-white/40">Gross platform volume over the last 7 days</p>
            </div>
            <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20">Live</Badge>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData.length > 0 ? revenueChartData : [{day: 'No Data', value: 0}]}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px'}}
                  itemStyle={{color: '#2dd4bf'}}
                />
                <Area type="monotone" dataKey="value" stroke="#2dd4bf" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health Gauges */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <MiniGauge label="Resolution" value={88} color="#f59e0b" />
            <MiniGauge label="Verification" value={94} color="#10b981" />
          </div>
          
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 space-y-4">
            <h3 className="text-sm font-black tracking-fast text-white">Recent Top Gigs</h3>
            <div className="space-y-4">
              {topGigs.map(g => (
                <div key={g.id} className="flex items-center justify-between group cursor-pointer">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-white truncate group-hover:text-teal-400 transition-colors uppercase tracking-tight">{g.title}</p>
                    <p className="text-[10px] text-white/30">{g._count.applications} Applicants</p>
                  </div>
                  <Badge variant="outline" className="ml-2 border-white/5 bg-white/5 text-[9px] font-mono">
                    {formatCurrency(g.budgetAmount)}
                  </Badge>
                </div>
              ))}
              {topGigs.length === 0 && <p className="text-[10px] text-white/20 text-center py-4 italic">No high-activity gigs found.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Feed Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Feed */}
        <div className="rounded-3xl border border-white/5 bg-white/5 p-6">
          <h3 className="text-lg font-black tracking-tight text-white mb-6">Live Activity Stream</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
            {activity.map((a) => (
              <div key={a.id} className="flex gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 font-black text-sm">
                  {a.user?.name ? a.user.name[0] : 'S'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-white/80">{a.user?.name || "System"}</p>
                    <p className="text-[9px] font-medium text-white/20">{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</p>
                  </div>
                  <p className="text-[11px] text-white/50 mt-1 leading-relaxed">{a.message}</p>
                </div>
              </div>
            ))}
            {activity.length === 0 && <p className="text-sm text-white/20 text-center py-12">No activity recorded yet.</p>}
          </div>
        </div>

        {/* Flagged and Disputes Quick Action */}
        <Tabs defaultValue="flagged" className="rounded-3xl border border-white/5 bg-white/5 p-6">
          <TabsList className="bg-white/5 p-1 rounded-xl mb-6">
            <TabsTrigger value="flagged" className="rounded-lg px-6 text-xs">Flagged Gigs</TabsTrigger>
            <TabsTrigger value="disputes" className="rounded-lg px-6 text-xs">Active Disputes</TabsTrigger>
          </TabsList>
          <TabsContent value="flagged" className="space-y-4">
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 bg-white/5 rounded-2xl border border-dashed border-white/10 opacity-60">
              <ShieldAlert className="h-8 w-8 text-white/20" />
              <div>
                <p className="text-xs font-bold text-white">No Flagged Content</p>
                <p className="text-[10px] text-white/40 mt-1">Platform guidelines are currently healthy.</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="disputes">
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 bg-white/5 rounded-2xl border border-dashed border-white/10 opacity-60">
              <AlertTriangle className="h-8 w-8 text-white/20" />
              <div>
                <p className="text-xs font-bold text-white">Dispute Queue Empty</p>
                <p className="text-[10px] text-white/40 mt-1">Contracts are progressing normally.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
