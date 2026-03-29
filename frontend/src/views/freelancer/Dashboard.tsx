"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Eye,
  Send,
  Briefcase,
  TrendingUp,
  PartyPopper,
  Pencil,
  MessageSquare,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GigCard } from "@/components/gig-card"
import { useQuery } from "@tanstack/react-query"
import { useCountUp } from "@/lib/hooks/use-count-up"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

// Removed mock proposals for live data

function FreelancerKpi({
  label,
  value,
  prefix = "",
  icon: Icon,
  wrap,
  delay,
}: {
  label: string
  value: number
  prefix?: string
  icon: typeof Eye
  wrap: string
  delay: number
}) {
  const n = useCountUp(value, 1500, 0, true)
  return (
    <div
      className="page-section-enter card-hover-lift rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm"
      style={{ ["--stagger-delay" as string]: `${delay}s` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">{label}</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[var(--primary-dark)]">
            {prefix}
            {n.toLocaleString()}
          </p>
        </div>
        <div className={cn("rounded-xl p-3", wrap)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function ProposalStatus({ s }: { s: string }) {
  const map: any = {
    PENDING: "bg-amber-100 text-amber-900 border border-amber-200",
    ACCEPTED: "border border-emerald-200 bg-emerald-50 text-emerald-800 animate-sparkle",
    REJECTED: "bg-red-50 text-red-700 border border-red-200",
    WITHDRAWN: "bg-slate-50 text-slate-700 border border-slate-200",
  }
  const label: any = {
    PENDING: "Pending",
    ACCEPTED: "Hired!",
    REJECTED: "Rejected",
    WITHDRAWN: "Withdrawn",
  }
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold", map[s] || map.PENDING)}>
      {s === "ACCEPTED" && <PartyPopper className="h-3.5 w-3.5" />}
      {label[s] || s}
    </span>
  )
}

function ProfileRing({ pct }: { pct: number }) {
  return (
    <div className="relative mx-auto h-36 w-36">
      <svg className="-rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="44" fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 44}`}
          strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct / 100)}`}
          className="transition-all duration-[1500ms] ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-mono text-2xl font-bold text-[var(--primary-dark)]">{pct}%</span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">Strength</span>
      </div>
    </div>
  )
}

const earningsWeek = [
  { d: "Mon", v: 120 },
  { d: "Tue", v: 200 },
  { d: "Wed", v: 80 },
  { d: "Thu", v: 310 },
  { d: "Fri", v: 260 },
  { d: "Sat", v: 90 },
  { d: "Sun", v: 140 },
]

export function FreelancerDashboardPage() {
  const [earnTab, setEarnTab] = useState<"week" | "month" | "year">("week")

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["freelancer", "stats"],
    queryFn: () => fetch("/api/freelancer/dashboard-stats").then(r => r.json().then(j => j.data)),
    refetchInterval: 30000,
  })

  const { data: recentProps, isLoading: propsLoading } = useQuery({
    queryKey: ["freelancer", "recent-proposals"],
    queryFn: () => fetch("/api/freelancer/recent-proposals").then(r => r.json().then(j => j.data)),
    refetchInterval: 30000,
  })

  return (
    <div className="space-y-8">
      <div className="page-section-enter flex flex-col justify-between gap-4 sm:flex-row sm:items-center" style={{ ["--stagger-delay" as string]: "0s" }}>
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] md:text-3xl">Your freelance HQ</h2>
          <p className="text-sm text-[var(--text-secondary)]">Track proposals, earnings, and profile momentum.</p>
        </div>
        <Button asChild variant="outline" className="rounded-xl border-[var(--primary)] text-[var(--primary-dark)] btn-premium">
          <Link href="/browse">Browse marketplace</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-2xl bg-white shadow-sm border border-[var(--border)]" />)}
          </>
        ) : (
          <>
            <FreelancerKpi label="Profile views" value={stats?.profileViews ?? 0} icon={Eye} wrap="bg-[var(--primary-light)] text-[var(--primary-dark)]" delay={0.05} />
            <FreelancerKpi label="Proposals sent" value={stats?.openProposals ?? 0} icon={Send} wrap="bg-amber-100 text-amber-700" delay={0.1} />
            <FreelancerKpi label="Active contracts" value={stats?.activeContracts ?? 0} icon={Briefcase} wrap="bg-sky-100 text-sky-700" delay={0.15} />
            <FreelancerKpi label="Total earned" value={stats?.totalEarnings ?? 0} prefix="₹" icon={TrendingUp} wrap="bg-emerald-100 text-emerald-700" delay={0.2} />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div
          className="page-section-enter rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm lg:col-span-1"
          style={{ ["--stagger-delay" as string]: "0.25s" }}
        >
          <h3 className="text-center text-lg font-semibold text-[var(--text-primary)]">Profile strength</h3>
          <p className="mt-1 text-center text-sm text-[var(--text-secondary)]">Complete your profile to get 3× more gigs</p>
          <div className="mt-4">
            {statsLoading ? (
              <Skeleton className="h-36 w-36 rounded-full mx-auto bg-[var(--bg-alt)]" />
            ) : (
              <ProfileRing pct={stats?.profileCompleteness ?? 0} />
            )}
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2 text-[var(--text-primary)]">
              <span className="text-[var(--primary)]">✓</span> Photo added
            </li>
            <li className="flex items-center gap-2 text-[var(--text-primary)]">
              <span className="text-[var(--primary)]">✓</span> Bio written
            </li>
            <li className="flex items-center gap-2 text-[var(--text-secondary)]">
              <span className="text-[var(--error)]">✗</span> Portfolio —{" "}
              <Link href="/browse/profile" className="font-semibold text-[var(--primary-dark)] hover:underline">
                Add now
              </Link>
            </li>
            <li className="flex items-center gap-2 text-[var(--text-secondary)]">
              <span className="text-[var(--error)]">✗</span> Certifications
            </li>
          </ul>
          <Button className="mt-4 w-full rounded-xl bg-[var(--primary)] btn-premium" asChild>
            <Link href="/browse/profile">Complete profile</Link>
          </Button>
        </div>

        <div
          className="page-section-enter lg:col-span-2"
          style={{ ["--stagger-delay" as string]: "0.28s" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recommended for you</h3>
            <Link href="/browse/gigs" className="text-sm font-semibold text-[var(--primary-dark)] hover:underline">
              View all
            </Link>
          </div>
          <div className="custom-scrollbar flex gap-4 overflow-x-auto pb-2">
            {[
              { id: "g1", title: "SaaS onboarding UX audit", category: "Design", freelancer: { name: "You", avatar: "/placeholder.svg" }, rating: 5, reviewCount: 12, price: 450, gradient: "from-[#6d9c9f] to-[#2d7a7e]" },
              { id: "g2", title: "Next.js performance tuning", category: "Development", freelancer: { name: "You", avatar: "/placeholder.svg" }, rating: 4.9, reviewCount: 48, price: 600, gradient: "from-[#7eb8a0] to-[#4a9a7c]" },
              { id: "g3", title: "Weekly newsletter writing", category: "Writing", freelancer: { name: "You", avatar: "/placeholder.svg" }, rating: 5, reviewCount: 22, price: 320, gradient: "from-[#88a9ab] to-[#5a8a8d]" },
            ].map((g) => (
              <GigCard key={g.id} {...g} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div
          className="page-section-enter overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm xl:col-span-3"
          style={{ ["--stagger-delay" as string]: "0.32s" }}
        >
          <div className="border-b border-[var(--border)] px-5 py-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Proposal tracker</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Gig</TableHead>
                <TableHead>Business</TableHead>
                <TableHead className="text-right">Bid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propsLoading ? (
                <>
                  {[1, 2, 3].map(i => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}><Skeleton className="h-12 w-full bg-[var(--bg-alt)]" /></TableCell>
                    </TableRow>
                  ))}
                </>
              ) : recentProps?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-text-secondary text-sm">
                    No proposals sent yet
                  </TableCell>
                </TableRow>
              ) : (
                recentProps?.map((p: any, i: number) => (
                  <TableRow key={i} className="hover:bg-[var(--primary-light)]/50">
                    <TableCell className="max-w-[160px] font-medium">{p.gigTitle}</TableCell>
                    <TableCell>{p.company}</TableCell>
                    <TableCell className="text-right font-mono text-[var(--primary-dark)]">₹{p.bidAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <ProposalStatus s={p.status} />
                    </TableCell>
                    <TableCell className="text-[var(--text-secondary)]">{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                          <Link href={`/freelancer/browse-gigs`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div
          className="page-section-enter rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm xl:col-span-2"
          style={{ ["--stagger-delay" as string]: "0.35s" }}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Earnings</h3>
            <div className="flex items-center gap-2">
              <Tabs value={earnTab} onValueChange={(v) => setEarnTab(v as typeof earnTab)}>
                <TabsList className="h-9 rounded-lg bg-[var(--bg-alt)]">
                  <TabsTrigger value="week" className="text-xs">
                    Week
                  </TabsTrigger>
                  <TabsTrigger value="month" className="text-xs">
                    Month
                  </TabsTrigger>
                  <TabsTrigger value="year" className="text-xs">
                    Year
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button size="sm" className="rounded-lg bg-gradient-to-r from-[var(--cta-amber)] to-[var(--cta-amber-dark)] text-white btn-premium">
                Withdraw
              </Button>
            </div>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={earningsWeek} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, borderColor: "var(--border)", boxShadow: "0 8px 30px var(--shadow-teal)" }}
                />
                <Bar
                  dataKey="v"
                  fill="var(--primary)"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive
                  activeBar={{ fill: "var(--cta-amber)" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-center text-xs text-[var(--text-secondary)]">Demo uses weekly totals · switch tabs updates view in production</p>
        </div>
      </div>
    </div>
  )
}
