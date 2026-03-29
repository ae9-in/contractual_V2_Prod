"use client"

import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import {
  Briefcase,
  Clock,
  CreditCard,
  FileCheck,
  IndianRupee,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react"
import { useEffect } from "react"
import dynamic from 'next/dynamic'

const Bar = dynamic(() => import('recharts').then(mod => mod.Bar as any), { ssr: false }) as any
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart as any), { ssr: false }) as any
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid as any), { ssr: false }) as any
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer as any), { ssr: false }) as any
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip as any), { ssr: false }) as any
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis as any), { ssr: false }) as any
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis as any), { ssr: false }) as any
import { SOCKET_EVENTS } from "@/lib/realtime/socket-events"
import { qk } from "@/lib/realtime/query-keys"
import { useCountUp } from "@/lib/hooks/use-count-up"
import { useSocketContext } from "@/providers/SocketProvider"
import { cn } from "@/lib/utils"

const TEXT = "#0f172a"
const MUTED = "#64748b"
const BORDER = "#e2e8f0"

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.02 } },
}

const section = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
  },
}

const kpiContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const kpiItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const } },
}

type DashboardPayload = {
  user: { firstName: string; name: string }
  stats: {
    totalGigsPosted: number
    gigsThisWeek: number
    totalApplications: number
    applicationsToday: number
    activeContracts: number
    contractsEndingSoon: number
    totalSpent: number
  }
  trends: {
    gigsWeek: string
    appsToday: string
    contractsSoon: string
    spendMonth: string
  }
  gigs: {
    id: string
    title: string
    applications: number
    status: "Active" | "Paused" | "Closed" | "Draft"
    budget: string
  }[]
  topApplicants: {
    id: string
    name: string
    skill: string
    rate: string
    rating: string
    initials: string
  }[]
  activity: { id: string; title: string; sub: string; time: string; dot: string }[]
  monthlySpend: { month: string; v: number }[]
}

async function fetchDashboard(): Promise<DashboardPayload> {
  const res = await fetch("/api/business/dashboard")
  const j = (await res.json()) as { data?: DashboardPayload; error?: string }
  if (!res.ok) throw new Error(j.error ?? "Failed to load dashboard")
  if (!j.data) throw new Error("Invalid response")
  return j.data
}

function StatusBadge({ status }: { status: "Active" | "Paused" | "Closed" | "Draft" }) {
  const styles =
    status === "Active"
      ? { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" }
      : status === "Paused"
        ? { bg: "#fffbeb", color: "#d97706", border: "#fde68a" }
        : status === "Draft"
          ? { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" }
          : { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" }
  return (
    <span
      className="inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: styles.bg, color: styles.color, borderColor: styles.border }}
    >
      {status}
    </span>
  )
}

function KpiCard({
  label,
  target,
  prefix = "",
  suffix = "",
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  trendAmber,
}: {
  label: string
  target: number
  prefix?: string
  suffix?: string
  icon: typeof Briefcase
  iconBg: string
  iconColor: string
  trend: string
  trendAmber?: boolean
}) {
  const n = useCountUp(target, 800, 0, true)
  const display = `${prefix}${n.toLocaleString()}${suffix}`

  return (
    <motion.div
      variants={kpiItem}
      className="relative overflow-hidden rounded-xl border bg-white p-[18px_20px] transition-all duration-200 hover:border-[#d1d5db]"
      style={{ borderColor: BORDER, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium" style={{ color: MUTED }}>
            {label}
          </p>
          <span
            className="mt-1 block font-mono text-[26px] font-extrabold leading-none tracking-tight"
            style={{ color: TEXT }}
          >
            {display}
          </span>
        </div>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
          style={{ background: iconBg }}
        >
          <Icon className="h-[18px] w-[18px]" style={{ color: iconColor }} strokeWidth={2} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 text-xs font-medium">
        {trendAmber ? (
          <>
            <Clock className="h-3 w-3 shrink-0" style={{ color: "#f59e0b" }} />
            <span style={{ color: "#f59e0b" }}>{trend}</span>
          </>
        ) : (
          <>
            <TrendingUp className="h-3 w-3 shrink-0" style={{ color: "#22c55e" }} />
            <span style={{ color: "#22c55e" }}>{trend}</span>
          </>
        )}
      </div>
    </motion.div>
  )
}

export function BusinessDashboardHome({ initialData }: { initialData?: DashboardPayload }) {
  const qc = useQueryClient()
  const { socket } = useSocketContext()

  const q = useQuery({
    queryKey: qk.businessDashboard(),
    queryFn: fetchDashboard,
    initialData,
    refetchInterval: 30_000,
  })

  useEffect(() => {
    if (!socket) return
    const bump = () => {
      void qc.invalidateQueries({ queryKey: qk.businessDashboard() })
      void qc.invalidateQueries({ queryKey: qk.businessNav() })
    }
    const evs = [
      SOCKET_EVENTS.NOTIFICATION_NEW,
      SOCKET_EVENTS.MESSAGE_NEW,
      SOCKET_EVENTS.CONTRACT_NEW,
      SOCKET_EVENTS.CONTRACT_STATUS,
      SOCKET_EVENTS.CONTRACT_COMPLETED,
    ] as const
    for (const e of evs) socket.on(e, bump)
    return () => {
      for (const e of evs) socket.off(e, bump)
    }
  }, [socket, qc])

  const today = format(new Date(), "EEEE, MMMM d, yyyy")
  const d = q.data

  if (q.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        {(q.error as Error).message}
      </div>
    )
  }

  if (q.isLoading || !d) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-64 rounded-lg bg-slate-200" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    )
  }

  const stats = d?.stats ?? {
    totalGigsPosted: 0,
    gigsThisWeek: 0,
    totalApplications: 0,
    applicationsToday: 0,
    activeContracts: 0,
    contractsEndingSoon: 0,
    totalSpent: 0,
  }
  const trends = d?.trends ?? {
    gigsWeek: "—",
    appsToday: "—",
    contractsSoon: "—",
    spendMonth: "—",
  }

  return (
    <motion.div className="business-dashboard-page mx-auto w-full max-w-[1600px]" variants={container} initial="hidden" animate="show">
      <motion.section variants={section} className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-[20px] font-bold leading-tight" style={{ color: TEXT }}>
            Welcome back, {d.user.firstName}
          </h2>
          <p className="mt-0.5 text-xs" style={{ color: "#94a3b8" }}>
            {today}
            {q.dataUpdatedAt ? (
              <span className="ml-2">
                · Updated {formatDistanceToNow(q.dataUpdatedAt, { addSuffix: true })}
                {q.isFetching ? " · refreshing…" : ""}
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/business/post-gig"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-[13px] font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              boxShadow: "0 2px 8px rgba(245,158,11,0.2)",
            }}
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            Post New Gig
          </Link>
          <Link
            href="/business/applications"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-[13px] font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #6d9c9f, #2d7a7e)",
              boxShadow: "0 2px 8px rgba(109,156,159,0.25)",
            }}
          >
            <Users className="h-3.5 w-3.5" strokeWidth={2} />
            View Applications
          </Link>
        </div>
      </motion.section>

      <motion.section
        variants={kpiContainer}
        initial="hidden"
        animate="show"
        className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <KpiCard
          label="Total Gigs Posted"
          target={stats.totalGigsPosted}
          icon={Briefcase}
          iconBg="#eff6ff"
          iconColor="#3b82f6"
          trend={trends.gigsWeek}
        />
        <KpiCard
          label="Total Applications"
          target={stats.totalApplications}
          icon={Users}
          iconBg="#fef3c7"
          iconColor="#f59e0b"
          trend={trends.appsToday}
        />
        <KpiCard
          label="Active Contracts"
          target={stats.activeContracts}
          icon={FileCheck}
          iconBg="#f0fdf4"
          iconColor="#22c55e"
          trend={trends.contractsSoon}
          trendAmber={stats.contractsEndingSoon > 0}
        />
        <KpiCard
          label="Total Spent"
          target={Math.round(stats.totalSpent)}
          prefix="₹"
          icon={IndianRupee}
          iconBg="#f0f9ff"
          iconColor="#6d9c9f"
          trend={trends.spendMonth}
        />
      </motion.section>

      <motion.div variants={section} className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,35%)]">
        <div className="min-w-0 space-y-4">
          <div className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: BORDER }}>
            <div
              className="flex items-center justify-between border-b px-5 py-4"
              style={{ borderColor: "#f1f5f9" }}
            >
              <h3 className="text-sm font-bold" style={{ color: TEXT }}>
                Your Gigs
              </h3>
              <Link href="/business/my-gigs" className="text-xs font-semibold text-[#6d9c9f] hover:underline">
                View All →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr className="bg-[#f8fafc] text-left">
                    {["Gig Title", "Applications", "Status", "Budget", "Action"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider"
                        style={{ color: "#94a3b8" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(d?.gigs ?? []).map((row, i) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                      className="border-b transition-colors hover:bg-[#f8fafc]"
                      style={{ borderColor: "#f8fafc" }}
                    >
                      <td className="px-5 py-3 text-[13px] font-medium" style={{ color: TEXT }}>
                        {row.title}
                      </td>
                      <td className="px-5 py-3 text-[13px]" style={{ color: TEXT }}>
                        {row.applications}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 font-mono text-[13px] font-medium" style={{ color: TEXT }}>
                        {row.budget}
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/gig/${row.id}`}
                          className="text-xs font-semibold text-[#6d9c9f] hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(d?.gigs ?? []).length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-[#94a3b8]">No gigs yet. Post one to get started.</p>
            )}
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border bg-white" style={{ borderColor: BORDER }}>
            <div
              className="flex items-center justify-between border-b px-5 py-4"
              style={{ borderColor: "#f1f5f9" }}
            >
              <h3 className="text-sm font-bold" style={{ color: TEXT }}>
                Recent Activity
              </h3>
              <Link href="/business/notifications" className="text-xs font-semibold text-[#6d9c9f] hover:underline">
                See All
              </Link>
            </div>
            <div className="px-5 pb-2">
              {(d?.activity ?? []).map((item, idx) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex gap-3 border-b py-3",
                    idx === d.activity.length - 1 && "border-b-0"
                  )}
                  style={{ borderColor: "#f8fafc" }}
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: item.dot }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold" style={{ color: TEXT }}>
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: MUTED }}>
                      {item.sub}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px]" style={{ color: "#94a3b8" }}>
                    {item.time}
                  </span>
                </div>
              ))}
              {(d?.activity ?? []).length === 0 && (
                <p className="py-6 text-center text-sm text-[#94a3b8]">No recent notifications.</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: BORDER }}>
            <div
              className="flex items-center justify-between border-b px-4 py-4"
              style={{ borderColor: "#f1f5f9" }}
            >
              <h3 className="text-sm font-bold" style={{ color: TEXT }}>
                Recent applicants
              </h3>
              <Link href="/business/applications" className="text-xs font-semibold text-[#6d9c9f] hover:underline">
                Review All →
              </Link>
            </div>
            <div className="px-4">
              {(d?.topApplicants ?? []).map((a, idx) => (
                <div
                  key={a.id}
                  className={cn(
                    "flex items-center gap-2.5 border-b py-3",
                    idx === d.topApplicants.length - 1 && "border-b-0"
                  )}
                  style={{ borderColor: "#f8fafc" }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #6d9c9f, #2d7a7e)" }}
                  >
                    {a.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold" style={{ color: TEXT }}>
                      {a.name}
                    </p>
                    <p className="truncate text-xs" style={{ color: MUTED }}>
                      {a.skill}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-[13px] font-bold" style={{ color: TEXT }}>
                      {a.rate}
                    </p>
                    <p className="text-[11px]" style={{ color: "#94a3b8" }}>
                      <span className="text-amber-500">★</span> {a.rating}
                    </p>
                  </div>
                </div>
              ))}
              {(d?.topApplicants ?? []).length === 0 && (
                <p className="py-6 text-center text-xs text-[#94a3b8]">No applications yet.</p>
              )}
            </div>
            <div className="px-4 pb-4">
              <Link
                href="/business/applications"
                className="flex h-9 w-full items-center justify-center rounded-lg border bg-white text-[13px] font-semibold text-[#6d9c9f] transition-colors hover:border-[#6d9c9f] hover:bg-[#f0f9f9]"
                style={{ borderColor: BORDER }}
              >
                View all {stats.totalApplications} applications →
              </Link>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4" style={{ borderColor: BORDER }}>
            <h3 className="mb-3 text-sm font-bold" style={{ color: TEXT }}>
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/business/post-gig", icon: Plus, label: "Post Gig" },
                { href: "/business/applications", icon: Users, label: "Applications" },
                { href: "/business/contracts", icon: FileCheck, label: "Contracts" },
                { href: "/business/billing", icon: CreditCard, label: "Payments" },
              ].map((x) => (
                <Link
                  key={x.label}
                  href={x.href}
                  className="flex flex-col items-center gap-1.5 rounded-[10px] border bg-white p-3.5 transition-all hover:border-[#6d9c9f] hover:bg-[#f0f9f9]"
                  style={{ borderColor: BORDER }}
                >
                  <x.icon className="h-5 w-5 text-[#6d9c9f]" strokeWidth={2} />
                  <span className="text-center text-xs font-semibold" style={{ color: TEXT }}>
                    {x.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4" style={{ borderColor: BORDER }}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold" style={{ color: TEXT }}>
                Monthly spend (completed contracts)
              </h3>
              <span className="font-mono text-sm font-bold text-[#6d9c9f]">
                ₹{Math.round(stats.totalSpent).toLocaleString("en-IN")}
              </span>
            </div>
            <div style={{ height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={d?.monthlySpend ?? []} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide domain={[0, "auto"]} />
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (!active || !payload?.length) return null
                      const p = payload[0]
                      return (
                        <div
                          className="rounded-lg border bg-white px-3 py-2 text-xs shadow-md"
                          style={{ borderColor: BORDER, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                        >
                          <p className="font-semibold text-[#0f172a]">
                            ₹{Number(p.value).toLocaleString("en-IN")}
                          </p>
                          <p className="text-[#64748b]">{p.payload.month}</p>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="v" fill="#6d9c9f" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
