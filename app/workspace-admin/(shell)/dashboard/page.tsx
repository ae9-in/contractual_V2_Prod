"use client"

import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { Building2, Check, Clock, FileCheck, IndianRupee, Users } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

type Stats = {
  kpis: {
    totalUsers: number
    usersToday: number
    totalBusiness: number
    pendingBusiness: number
    totalFreelancer: number
    activeGigs: number
    totalContracts: number
    completedContracts: number
    totalRevenueFormatted: string
    monthRevenueFormatted: string
  }
  pendingBusinesses: {
    id: string
    name: string
    email: string
    companyName: string | null
    createdAt: string
  }[]
}

async function fetchStats(): Promise<Stats> {
  const res = await fetch("/api/workspace-admin/stats")
  const j = await res.json()
  if (!res.ok) throw new Error(j.error ?? "Failed")
  return j.data as Stats
}

export default function WorkspaceAdminDashboardPage() {
  const q = useQuery({ queryKey: ["workspace-admin-stats"], queryFn: fetchStats })

  if (q.isLoading || !q.data) {
    return <div className="text-slate-400">Loading…</div>
  }

  const { kpis, pendingBusinesses } = q.data

  async function approve(id: string) {
    const res = await fetch(`/api/workspace-admin/users/${id}/approve`, { method: "PATCH" })
    const j = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error((j as { error?: string }).error ?? "Failed")
      return
    }
    toast.success("Approved")
    void q.refetch()
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-xl font-bold text-white">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Total Users", value: kpis.totalUsers, sub: `+${kpis.usersToday} today`, icon: Users },
          {
            label: "Businesses",
            value: kpis.totalBusiness,
            sub: `${kpis.pendingBusiness} pending`,
            icon: Building2,
          },
          { label: "Freelancers", value: kpis.totalFreelancer, sub: "", icon: Users },
          { label: "Active Gigs", value: kpis.activeGigs, sub: "", icon: Building2 },
          {
            label: "Contracts",
            value: kpis.totalContracts,
            sub: `${kpis.completedContracts} completed`,
            icon: FileCheck,
          },
          {
            label: "Platform revenue",
            value: kpis.totalRevenueFormatted,
            sub: `${kpis.monthRevenueFormatted} this month`,
            icon: IndianRupee,
          },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-white/[0.06] bg-[#1e293b] px-5 py-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">{c.label}</p>
                <p className="mt-1 font-mono text-2xl font-bold text-white">{c.value}</p>
                {c.sub ? <p className="mt-1 text-[11px] text-amber-400/90">{c.sub}</p> : null}
              </div>
              <c.icon className="h-5 w-5 text-slate-500" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[14px] border border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-amber-600/10 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          <h2 className="font-semibold text-white">Pending Business Approvals</h2>
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-200">
            {pendingBusinesses.length}
          </span>
          <Link href="/workspace-admin/businesses" className="ml-auto text-xs font-semibold text-amber-300 hover:underline">
            View all
          </Link>
        </div>
        <ul className="space-y-3">
          {pendingBusinesses.length === 0 ? (
            <li className="text-sm text-slate-400">No pending businesses.</li>
          ) : (
            pendingBusinesses.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-[#0f172a]/50 px-3 py-2"
              >
                <div>
                  <p className="font-medium text-white">{b.companyName ?? b.name}</p>
                  <p className="text-xs text-slate-400">{b.email}</p>
                  <p className="text-[11px] text-slate-500">
                    Registered {formatDistanceToNow(new Date(b.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void approve(b.id)}
                    className="flex items-center gap-1 rounded-lg bg-emerald-600/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-600/30"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
