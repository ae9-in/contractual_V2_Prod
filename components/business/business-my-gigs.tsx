"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Edit2,
  Eye,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Star,
  Trash2,
  Users,
  XCircle,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { GigStatus } from "@prisma/client"
import { qk } from "@/lib/realtime/query-keys"

type GigRow = {
  id: string
  title: string
  category: string
  status: "active" | "paused" | "closed" | "draft"
  budget: { label: string; min: number; max: number }
  applicants: number
  shortlisted: number
  hired: number
  views: number
  posted: string
  deadline: string
  urgent: boolean
  featured: boolean
}

type MyGigsPayload = {
  counts: {
    all: number
    active: number
    paused: number
    draft: number
    closed: number
  }
  stats: {
    totalGigs: number
    activeGigs: number
    totalApplicants: number
    totalViews: number
  }
  gigs: GigRow[]
}

async function fetchMyGigs(): Promise<MyGigsPayload> {
  const res = await fetch("/api/business/my-gigs")
  const j = (await res.json()) as { data?: MyGigsPayload; error?: string }
  if (!res.ok) throw new Error(j.error ?? "Failed to load gigs")
  if (!j.data) throw new Error("Invalid response")
  return j.data
}

const statusConfig: Record<
  GigRow["status"],
  { label: string; color: string; icon: typeof CheckCircle2 }
> = {
  active: { label: "Active", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  paused: { label: "Paused", color: "bg-amber-100 text-amber-700", icon: Pause },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-600", icon: XCircle },
  draft: { label: "Draft", color: "bg-blue-100 text-blue-700", icon: Edit2 },
}

const TABS = ["all", "active", "paused", "draft", "closed"] as const

export function BusinessMyGigs() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState<(typeof TABS)[number]>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGigs, setSelectedGigs] = useState<string[]>([])
  const [showActions, setShowActions] = useState<string | null>(null)

  const q = useQuery({
    queryKey: qk.businessMyGigs(),
    queryFn: fetchMyGigs,
    refetchInterval: 30_000,
  })

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: qk.businessMyGigs() })
    void qc.invalidateQueries({ queryKey: qk.businessDashboard() })
    void qc.invalidateQueries({ queryKey: qk.gigs() })
  }

  const patchGig = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: GigStatus }) => {
      const res = await fetch(`/api/gigs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const j = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(j.error ?? "Update failed")
    },
    onSuccess: () => {
      toast.success("Gig updated")
      invalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteGig = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/gigs/${id}`, { method: "DELETE" })
      const j = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(j.error ?? "Delete failed")
    },
    onSuccess: () => {
      toast.success("Gig deleted")
      invalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const data = q.data
  const gigs = data?.gigs ?? []

  const filteredGigs = gigs.filter((gig) => {
    if (filter !== "all" && gig.status !== filter) return false
    if (searchQuery && !gig.title.toLowerCase().includes(searchQuery.toLowerCase()))
      return false
    return true
  })

  const counts = data?.counts

  if (q.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        {(q.error as Error).message}
      </div>
    )
  }

  if (q.isLoading || !data) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-200" />
          ))}
        </div>
        <div className="h-16 rounded-xl bg-slate-200" />
        <div className="h-40 rounded-xl bg-slate-200" />
      </div>
    )
  }

  const stats = data.stats

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: "Total Gigs", value: stats.totalGigs, icon: BarChart3, color: "primary" as const },
          { label: "Active Gigs", value: stats.activeGigs, icon: Zap, color: "green" as const },
          { label: "Total Applicants", value: stats.totalApplicants, icon: Users, color: "blue" as const },
          {
            label: "Total Views",
            value: stats.totalViews.toLocaleString("en-IN"),
            icon: Eye,
            color: "amber" as const,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-[var(--border)] bg-white p-4 transition-all duration-300 hover:border-[var(--primary)] hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  stat.color === "primary"
                    ? "bg-[var(--primary-light)]"
                    : stat.color === "green"
                      ? "bg-green-100"
                      : stat.color === "blue"
                        ? "bg-blue-100"
                        : "bg-amber-100"
                }`}
              >
                <stat.icon
                  className={`h-6 w-6 ${
                    stat.color === "primary"
                      ? "text-[var(--primary)]"
                      : stat.color === "green"
                        ? "text-green-600"
                        : stat.color === "blue"
                          ? "text-blue-600"
                          : "text-amber-600"
                  }`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-white p-4">
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  filter === tab
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--bg-alt)] text-[var(--text-secondary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab !== "all" && counts != null && (
                  <span className="ml-2 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
                    {tab === "draft" ? counts.draft : counts[tab as keyof typeof counts]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex w-full gap-3 lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Search gigs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] py-2 pl-10 pr-4 outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
              />
            </div>
            <Link
              href="/business/post-gig"
              className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-all duration-300 hover:scale-[1.02]"
              style={{ background: "var(--gradient-amber)" }}
            >
              <Plus className="h-4 w-4" />
              Post New Gig
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredGigs.map((gig, index) => {
            const cfg = statusConfig[gig.status]
            const StatusIcon = cfg.icon
            return (
              <motion.div
                key={gig.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="group rounded-xl border border-[var(--border)] bg-white p-5 transition-all duration-300 hover:border-[var(--primary)] hover:shadow-lg"
              >
                <div className="flex flex-col gap-4 lg:flex-row">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedGigs.includes(gig.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGigs([...selectedGigs, gig.id])
                          } else {
                            setSelectedGigs(selectedGigs.filter((id) => id !== gig.id))
                          }
                        }}
                        className="mt-1.5 h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                      />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/gig/${gig.id}`}
                            className="text-lg font-semibold text-[var(--text-primary)] transition-colors hover:text-[var(--primary)]"
                          >
                            {gig.title}
                          </Link>
                          <span
                            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {cfg.label}
                          </span>
                          {gig.urgent && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                              Urgent
                            </span>
                          )}
                          {gig.featured && (
                            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                              <Star className="h-3 w-3" /> Featured
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)]">
                          <span className="rounded-full bg-[var(--bg-alt)] px-2 py-0.5">
                            {gig.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Posted {gig.posted}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Deadline: {gig.deadline}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-6 pl-7">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {gig.applicants}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)]">Applicants</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {gig.shortlisted}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)]">Shortlisted</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                          <Star className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {gig.hired}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)]">Hired</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
                          <Eye className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {gig.views}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)]">Views</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between lg:w-48">
                    <div className="text-right">
                      <p className="text-sm text-[var(--text-secondary)]">Budget</p>
                      <p className="text-xl font-bold text-[var(--primary)]">{gig.budget.label}</p>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Link
                        href={`/business/applications/${gig.id}`}
                        className="flex items-center gap-1 rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-dark)]"
                      >
                        <Users className="h-4 w-4" />
                        View Applicants
                      </Link>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setShowActions(showActions === gig.id ? null : gig.id)
                          }
                          className="rounded-lg p-2 transition-colors hover:bg-[var(--bg-alt)]"
                        >
                          <MoreHorizontal className="h-5 w-5 text-[var(--text-secondary)]" />
                        </button>

                        <AnimatePresence>
                          {showActions === gig.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 top-full z-10 mt-1 w-48 overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-xl"
                            >
                              <Link
                                href={`/gig/${gig.id}`}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-alt)]"
                                onClick={() => setShowActions(null)}
                              >
                                <Eye className="h-4 w-4" />
                                View Gig
                              </Link>
                              <Link
                                href={`/gig/${gig.id}`}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-alt)]"
                                onClick={() => setShowActions(null)}
                              >
                                <Edit2 className="h-4 w-4" />
                                Edit (view)
                              </Link>
                              <button
                                type="button"
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-alt)]"
                                onClick={() => {
                                  setShowActions(null)
                                  void navigator.clipboard.writeText(
                                    `${typeof window !== "undefined" ? window.location.origin : ""}/gig/${gig.id}`
                                  )
                                  toast.success("Link copied")
                                }}
                              >
                                <Copy className="h-4 w-4" />
                                Copy link
                              </button>
                              {gig.status === "active" && (
                                <button
                                  type="button"
                                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-alt)]"
                                  onClick={() => {
                                    setShowActions(null)
                                    patchGig.mutate({ id: gig.id, status: GigStatus.PAUSED })
                                  }}
                                >
                                  <Pause className="h-4 w-4" />
                                  Pause Gig
                                </button>
                              )}
                              {gig.status === "paused" && (
                                <button
                                  type="button"
                                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-alt)]"
                                  onClick={() => {
                                    setShowActions(null)
                                    patchGig.mutate({ id: gig.id, status: GigStatus.OPEN })
                                  }}
                                >
                                  <Play className="h-4 w-4" />
                                  Activate Gig
                                </button>
                              )}
                              <button
                                type="button"
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                                onClick={() => {
                                  setShowActions(null)
                                  if (
                                    typeof window !== "undefined" &&
                                    window.confirm("Delete this gig? This cannot be undone.")
                                  ) {
                                    deleteGig.mutate(gig.id)
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filteredGigs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-alt)]">
              <BarChart3 className="h-10 w-10 text-[var(--text-secondary)]" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">No gigs found</h3>
            <p className="mb-6 text-[var(--text-secondary)]">
              Try adjusting your filters or post a new gig
            </p>
            <Link
              href="/business/post-gig"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium text-white"
              style={{ background: "var(--gradient-amber)" }}
            >
              <Plus className="h-5 w-5" />
              Post Your First Gig
            </Link>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedGigs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-2xl bg-[var(--dark-surface)] px-6 py-4 text-white shadow-2xl"
          >
            <span className="text-sm">
              <strong>{selectedGigs.length}</strong> gig{selectedGigs.length > 1 ? "s" : ""}{" "}
              selected
            </span>
            <div className="h-6 w-px bg-white/20" />
            <button
              type="button"
              className="rounded-lg bg-white/10 px-3 py-1.5 text-sm transition-colors hover:bg-white/20"
              onClick={() => toast.message("Bulk actions coming soon")}
            >
              Pause All
            </button>
            <button
              type="button"
              className="rounded-lg bg-white/10 px-3 py-1.5 text-sm transition-colors hover:bg-white/20"
              onClick={() => toast.message("Bulk actions coming soon")}
            >
              Close All
            </button>
            <button
              type="button"
              className="rounded-lg bg-red-500/20 px-3 py-1.5 text-sm text-red-300 transition-colors hover:bg-red-500/30"
              onClick={() => toast.message("Bulk actions coming soon")}
            >
              Delete All
            </button>
            <button
              type="button"
              onClick={() => setSelectedGigs([])}
              className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
