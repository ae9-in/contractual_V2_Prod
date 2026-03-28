"use client"

import Link from "next/link"
import Image from "next/image"
import { format, formatDistanceToNow } from "date-fns"
import { useSession } from "next-auth/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import {
  AlertCircle,
  Briefcase,
  Calendar,
  Eye,
  FileText,
  IndianRupee,
  Search,
} from "lucide-react"
import { useEffect } from "react"
import { toast } from "sonner"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"
import { SOCKET_EVENTS } from "@/lib/realtime/socket-events"
import { qk } from "@/lib/realtime/query-keys"
import { useSocketContext } from "@/providers/SocketProvider"
import { cn } from "@/lib/utils"

const CARD = "rounded-[14px] border bg-white"
const BORDER = "#e8ecf0"

type DashboardStats = {
  activeContracts: number
  openProposals: number
  profileViews: number
  profileCompleteness: number
  completedContracts: number
  avgRating: number | null
  totalEarnings: number
}

type ActiveRow = {
  id: string
  contractNumber: string
  gigTitle: string
  businessName: string
  budget: number
  currency: string
  deadline: string | null
  statusLabel: string
  progress: number
}

type RecentProposal = {
  id: string
  gigTitle: string
  company: string
  bidAmount: number
  currency: string
  status: string
  createdAt: string
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  const j = (await res.json()) as { data?: T; error?: string }
  if (!res.ok) throw new Error(j.error ?? res.statusText)
  if (j.data === undefined) throw new Error("Invalid response")
  return j.data
}

function Kpi({
  label,
  value,
  mono,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string
  value: string
  mono?: boolean
  icon: typeof Briefcase
  iconBg: string
  iconColor: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(CARD, "p-[18px_20px]")}
      style={{ borderColor: BORDER }}
    >
      <div className="flex justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-[#94a3b8]">{label}</p>
          <p
            className={cn(
              "mt-1.5 font-bricolage text-[28px] font-extrabold leading-none text-[#0f172a]",
              mono && "font-mono"
            )}
          >
            {value}
          </p>
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: iconBg }}
        >
          <Icon className="h-[18px] w-[18px]" style={{ color: iconColor }} strokeWidth={2} />
        </div>
      </div>
    </motion.div>
  )
}

function StatusPill({ label }: { label: string }) {
  return (
    <span className="inline-block rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-2 py-0.5 text-[11px] font-semibold text-[#2563eb]">
      {label}
    </span>
  )
}

export function FreelancerOverview() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const { socket } = useSocketContext()

  const statsQ = useQuery({
    queryKey: qk.dashboardStats(),
    queryFn: () => getJson<DashboardStats>("/api/freelancer/dashboard-stats"),
    refetchInterval: 30_000,
  })

  const activeQ = useQuery({
    queryKey: qk.freelancerActiveContracts(),
    queryFn: () => getJson<ActiveRow[]>("/api/freelancer/active-contracts"),
    refetchInterval: 30_000,
  })

  const recentQ = useQuery({
    queryKey: qk.recentProposals(),
    queryFn: () => getJson<RecentProposal[]>("/api/freelancer/recent-proposals"),
    refetchInterval: 30_000,
  })

  const profileQ = useQuery({
    queryKey: qk.freelancerProfile(),
    queryFn: () =>
      getJson<{
        headline: string | null
        skills: { id: string; name: string }[]
        hourlyRate: number | null
        avgRating: number | null
        completedContracts: number
        profileCompleteness: number
        name: string
        image: string | null
      }>("/api/freelancer/profile"),
    refetchInterval: 60_000,
  })

  useEffect(() => {
    if (!socket) return
    const h = () => {
      void queryClient.invalidateQueries({ queryKey: qk.dashboardStats() })
      void queryClient.invalidateQueries({ queryKey: qk.freelancerActiveContracts() })
      void queryClient.invalidateQueries({ queryKey: qk.recentProposals() })
    }
    socket.on(SOCKET_EVENTS.DASHBOARD_UPDATE, h)
    socket.on(SOCKET_EVENTS.APPLICATION_ACCEPTED, (p: unknown) => {
      const pl = p as { contractId?: string }
      toast.success("Proposal accepted — contract created.", {
        description: pl.contractId ? `Open contract ${pl.contractId.slice(0, 8)}…` : undefined,
      })
      h()
    })
    return () => {
      socket.off(SOCKET_EVENTS.DASHBOARD_UPDATE, h)
      socket.off(SOCKET_EVENTS.APPLICATION_ACCEPTED)
    }
  }, [socket, queryClient])

  const stats = statsQ.data
  const completeness = stats?.profileCompleteness ?? profileQ.data?.profileCompleteness ?? 0
  const dateLine = format(new Date(), "EEEE, MMMM d")
  const firstName = session?.user?.name?.split(/\s+/)[0] ?? "there"
  const lastUpdated =
    statsQ.dataUpdatedAt != null
      ? formatDistanceToNow(statsQ.dataUpdatedAt, { addSuffix: true })
      : ""

  const earningsPts = [
    { m: "Done", v: Math.round(stats?.totalEarnings ?? 0) },
    { m: "Jobs", v: (stats?.completedContracts ?? 0) * 1000 },
  ]

  return (
    <div className="space-y-5">
      <div
        className={cn(CARD, "flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center")}
        style={{ borderColor: BORDER }}
      >
        <div>
          <h1 className="font-bricolage text-xl font-bold text-[#0f172a]">
            Good {new Date().getHours() < 12 ? "morning" : "evening"}, {firstName}
          </h1>
          <p className="mt-0.5 text-[13px] text-[#94a3b8]">
            {dateLine} · Live data
            {lastUpdated ? ` · Refreshed ${lastUpdated}` : ""}
            {statsQ.isFetching ? " · updating…" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/freelancer/browse-gigs"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#6d9c9f] px-4 text-[13px] font-semibold text-white transition-all hover:-translate-y-px hover:bg-[#2d7a7e]"
          >
            <Search className="h-3.5 w-3.5" />
            Browse Gigs
          </Link>
          <Link
            href="/freelancer/profile"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#f59e0b] bg-white px-4 text-[13px] font-semibold text-[#d97706] transition-all hover:bg-[#fffbeb]"
          >
            <AlertCircle className="h-3.5 w-3.5 text-[#f59e0b]" />
            Complete Profile
          </Link>
        </div>
      </div>

      {completeness < 80 && (
        <div
          className="flex flex-col gap-3 rounded-[10px] border border-[#fde68a] bg-[#fffbeb] p-3 sm:flex-row sm:items-center"
          style={{ padding: "12px 16px" }}
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-[#f59e0b]" />
          <p className="flex-1 text-[13px] text-[#92400e]">
            Your profile is {completeness}% complete. Add skills, bio, and rate to rank higher.
          </p>
          <div className="h-1 w-full min-w-[120px] max-w-[200px] overflow-hidden rounded-full bg-[#fde68a] sm:mx-4">
            <div
              className="h-full rounded-full bg-[#f59e0b]"
              style={{ width: `${completeness}%` }}
            />
          </div>
          <Link href="/freelancer/profile" className="text-[13px] font-semibold text-[#d97706] hover:underline">
            Complete Now →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Active Contracts"
          value={String(stats?.activeContracts ?? "—")}
          icon={Briefcase}
          iconBg="#eff6ff"
          iconColor="#3b82f6"
        />
        <Kpi
          label="Total Earnings (completed)"
          value={`₹${Math.round(stats?.totalEarnings ?? 0).toLocaleString("en-IN")}`}
          mono
          icon={IndianRupee}
          iconBg="#f0fdf4"
          iconColor="#22c55e"
        />
        <Kpi
          label="Open Proposals"
          value={String(stats?.openProposals ?? "—")}
          icon={FileText}
          iconBg="#fffbeb"
          iconColor="#f59e0b"
        />
        <Kpi
          label="Profile Views"
          value={String(stats?.profileViews ?? "—")}
          icon={Eye}
          iconBg="#f5f3ff"
          iconColor="#8b5cf6"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,35%)]">
        <div className="min-w-0 space-y-4">
          <div className={cn(CARD, "overflow-hidden")} style={{ borderColor: BORDER }}>
            <div className="flex items-center justify-between border-b border-[#f8fafc] px-5 py-4">
              <h3 className="text-sm font-bold text-[#0f172a]">Active Contracts</h3>
              <Link href="/freelancer/contracts" className="text-xs font-semibold text-[#6d9c9f] hover:underline">
                View All →
              </Link>
            </div>
            <div className="divide-y divide-[#f8fafc] px-5">
              {activeQ.isLoading && (
                <p className="py-6 text-center text-sm text-[#94a3b8]">Loading…</p>
              )}
              {!activeQ.isLoading && (activeQ.data?.length ?? 0) === 0 && (
                <div className="py-8 text-center">
                  <p className="text-sm text-[#64748b]">No active contracts yet. Browse gigs to apply.</p>
                  <Link
                    href="/freelancer/browse-gigs"
                    className="mt-3 inline-flex h-9 items-center rounded-lg bg-[#6d9c9f] px-4 text-[13px] font-semibold text-white"
                  >
                    Browse Gigs
                  </Link>
                </div>
              )}
              {activeQ.data?.map((c) => (
                <div key={c.id} className="flex gap-3 py-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#e8f4f5]">
                    <Briefcase className="h-4 w-4 text-[#6d9c9f]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#0f172a]">{c.gigTitle}</p>
                    <p className="text-xs text-[#94a3b8]">for {c.businessName}</p>
                    {c.deadline && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-[#94a3b8]">
                        <Calendar className="h-3 w-3" /> Due {format(new Date(c.deadline), "MMM d, yyyy")}
                      </p>
                    )}
                    <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-[#f1f5f9]">
                      <motion.div
                        className="h-full rounded-full bg-[#6d9c9f]"
                        initial={{ width: 0 }}
                        animate={{ width: `${c.progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-mono text-sm font-bold text-[#0f172a]">
                      ₹{c.budget.toLocaleString("en-IN")}
                    </span>
                    <StatusPill label={c.statusLabel} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={cn(CARD)} style={{ borderColor: BORDER }}>
            <div className="flex items-center justify-between border-b border-[#f8fafc] px-5 py-4">
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">Open gigs</h3>
                <p className="mt-0.5 text-xs text-[#94a3b8]">Matching listings you can apply to</p>
              </div>
              <Link href="/freelancer/browse-gigs" className="text-xs font-semibold text-[#6d9c9f] hover:underline">
                Browse All →
              </Link>
            </div>
            <div className="px-5 py-4 text-sm text-[#64748b]">
              Use <strong className="text-[#0f172a]">Browse Gigs</strong> for the full list with filters and apply
              flow.
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className={cn(CARD, "p-5")} style={{ borderColor: BORDER }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0f172a]">Earnings snapshot</h3>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-[#6d9c9f]">
              ₹{Math.round(stats?.totalEarnings ?? 0).toLocaleString("en-IN")}
            </p>
            <p className="text-xs font-medium text-[#64748b]">From completed contracts</p>
            <div className="mt-3 h-[100px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningsPts}>
                  <defs>
                    <linearGradient id="tealG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(109,156,159)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="rgb(109,156,159)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      border: "1px solid #e8ecf0",
                      borderRadius: 8,
                      fontSize: 12,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                  />
                  <Area type="monotone" dataKey="v" stroke="#6d9c9f" strokeWidth={2} fill="url(#tealG)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={cn(CARD)} style={{ borderColor: BORDER }}>
            <div className="flex items-center justify-between border-b border-[#f8fafc] px-4 py-3">
              <h3 className="text-sm font-bold text-[#0f172a]">Recent proposals</h3>
              <Link href="/freelancer/proposals" className="text-xs font-semibold text-[#6d9c9f] hover:underline">
                View All →
              </Link>
            </div>
            <div className="divide-y divide-[#f8fafc] px-4">
              {recentQ.data?.map((p) => (
                <div key={p.id} className="flex flex-col gap-1 py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[13px] font-semibold text-[#0f172a]">{p.gigTitle}</span>
                    <span
                      className="shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                      style={
                        p.status === "PENDING"
                          ? { background: "#fffbeb", color: "#d97706", borderColor: "#fde68a" }
                          : p.status === "ACCEPTED"
                            ? { background: "#f0fdf4", color: "#16a34a", borderColor: "#bbf7d0" }
                            : { background: "#fef2f2", color: "#dc2626", borderColor: "#fecaca" }
                      }
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-[#94a3b8]">
                    <span>{p.company}</span>
                    <span>{formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              ))}
              {!recentQ.data?.length && !recentQ.isLoading && (
                <p className="py-4 text-center text-xs text-[#94a3b8]">No proposals yet.</p>
              )}
            </div>
          </div>

          <div className={cn(CARD, "p-5 text-center")} style={{ borderColor: BORDER }}>
            {profileQ.data?.image ? (
              <div className="relative mx-auto h-14 w-14 overflow-hidden rounded-full">
                <Image src={profileQ.data.image} alt="" fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#6d9c9f] to-[#2d7a7e] text-lg font-bold text-white">
                {session?.user?.name?.slice(0, 2).toUpperCase() ?? "?"}
              </div>
            )}
            <p className="mt-3 font-bricolage text-base font-bold text-[#0f172a]">
              {profileQ.data?.name ?? session?.user?.name}
            </p>
            <p className="text-[13px] text-[#94a3b8]">{profileQ.data?.headline ?? "Freelancer"}</p>
            <div className="my-3 grid grid-cols-3 border-y border-[#f8fafc] py-3">
              <div>
                <p className="font-mono text-base font-bold text-[#0f172a]">
                  {profileQ.data?.avgRating != null ? profileQ.data.avgRating.toFixed(1) : "—"}
                </p>
                <p className="text-[11px] text-[#94a3b8]">Rating</p>
              </div>
              <div>
                <p className="font-mono text-base font-bold text-[#0f172a]">
                  {profileQ.data?.completedContracts ?? 0}
                </p>
                <p className="text-[11px] text-[#94a3b8]">Jobs</p>
              </div>
              <div>
                <p className="font-mono text-base font-bold text-[#0f172a]">
                  {profileQ.data?.hourlyRate != null
                    ? `₹${profileQ.data.hourlyRate}`
                    : "—"}
                </p>
                <p className="text-[11px] text-[#94a3b8]">Rate</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {(profileQ.data?.skills ?? []).slice(0, 5).map((t) => (
                <span
                  key={t.id}
                  className="rounded-full border border-[#b0d4d6] bg-[#e8f4f5] px-2 py-0.5 text-xs font-semibold text-[#2d7a7e]"
                >
                  {t.name}
                </span>
              ))}
            </div>
            <Link
              href="/freelancer/profile"
              className="mt-4 flex h-[34px] w-full items-center justify-center rounded-lg border text-[13px] font-semibold text-[#64748b] transition-colors hover:border-[#6d9c9f] hover:text-[#6d9c9f]"
              style={{ borderColor: BORDER }}
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
