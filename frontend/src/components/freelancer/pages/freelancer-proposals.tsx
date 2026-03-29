"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format, formatDistanceToNow } from "date-fns"
import type { Application, ApplicationStatus } from "@prisma/client"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { qk } from "@/lib/realtime/query-keys"
import { cn } from "@/lib/utils"

type Row = Application & {
  gig: {
    id: string
    title: string
    budgetAmount: number
    minBudget: number | null
    maxBudget: number | null
    budgetType: string
    currency: string
    deadline: Date | null
    business: { name: string; companyName: string | null; image: string | null }
    requiredSkills: { id: string; name: string }[]
  }
  contract: { id: string; status: string } | null
}

async function fetchProposals(): Promise<Row[]> {
  const res = await fetch("/api/freelancer/proposals?limit=100")
  const j = (await res.json()) as { data?: Row[]; error?: string }
  if (!res.ok) throw new Error(j.error ?? "Failed to load")
  return j.data ?? []
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const map: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: "#fffbeb", text: "#d97706" },
    ACCEPTED: { bg: "#f0fdf4", text: "#16a34a" },
    REJECTED: { bg: "#fef2f2", text: "#dc2626" },
    WITHDRAWN: { bg: "#f1f5f9", text: "#64748b" },
  }
  const x = map[status] ?? map.PENDING!
  return (
    <span
      className="shrink-0 rounded-full px-4 py-1.5 text-[13px] font-semibold"
      style={{ background: x.bg, color: x.text }}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  )
}

export function FreelancerProposals() {
  const qc = useQueryClient()
  const prev = useRef<Map<string, ApplicationStatus>>(new Map())
  const [withdrawId, setWithdrawId] = useState<string | null>(null)

  const q = useQuery({
    queryKey: qk.proposals(),
    queryFn: fetchProposals,
    refetchInterval: 15_000,
  })

  useEffect(() => {
    if (!q.data) return
    for (const r of q.data) {
      const was = prev.current.get(r.id)
      if (was && was === "PENDING" && r.status === "ACCEPTED") {
        toast.success(`Your proposal for "${r.gig.title}" was accepted!`)
      }
      prev.current.set(r.id, r.status)
    }
  }, [q.data])

  const withdraw = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/applications/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "WITHDRAWN" }),
      })
      const j = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(j.error ?? "Withdraw failed")
      return j
    },
    onSuccess: () => {
      toast.success("Proposal withdrawn")
      setWithdrawId(null)
      void qc.invalidateQueries({ queryKey: qk.proposals() })
      void qc.invalidateQueries({ queryKey: qk.gigs() })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const rows = q.data ?? []
  const tabs = [
    { id: "all" as const, label: "All", count: rows.length },
    {
      id: "pending" as const,
      label: "Pending",
      count: rows.filter((r) => r.status === "PENDING").length,
    },
    {
      id: "accepted" as const,
      label: "Accepted",
      count: rows.filter((r) => r.status === "ACCEPTED").length,
    },
    {
      id: "rejected" as const,
      label: "Rejected",
      count: rows.filter((r) => r.status === "REJECTED").length,
    },
    {
      id: "withdrawn" as const,
      label: "Withdrawn",
      count: rows.filter((r) => r.status === "WITHDRAWN").length,
    },
  ]

  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("all")

  const filtered = rows.filter((r) => {
    if (tab === "all") return true
    if (tab === "pending") return r.status === "PENDING"
    if (tab === "accepted") return r.status === "ACCEPTED"
    if (tab === "rejected") return r.status === "REJECTED"
    if (tab === "withdrawn") return r.status === "WITHDRAWN"
    return true
  })

  return (
    <div className="space-y-5">
      <h1 className="font-bricolage text-[22px] font-extrabold text-[#0f172a]">My Proposals</h1>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors",
              tab === t.id
                ? "bg-[#0f172a] font-semibold text-white"
                : "border border-[#e8ecf0] bg-white text-[#64748b] hover:text-[#0f172a]"
            )}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {q.isLoading && <p className="text-sm text-[#94a3b8]">Loading…</p>}

      <div className="grid gap-4">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="rounded-[14px] border border-[#e8ecf0] bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bricolage text-lg font-bold text-[#0f172a]">{r.gig.title}</p>
                <p className="mt-1 text-sm text-[#64748b]">
                  {r.gig.business.companyName || r.gig.business.name}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <div className="mt-4 grid gap-2 text-[13px] text-[#64748b] sm:grid-cols-2">
              <p>
                <span className="font-semibold text-[#0f172a]">Your bid:</span> ₹
                {r.proposedPrice != null ? r.proposedPrice.toLocaleString("en-IN") : r.gig.budgetAmount.toLocaleString("en-IN")}
              </p>
              <p>
                <span className="font-semibold text-[#0f172a]">Gig budget:</span>{" "}
                {r.gig.minBudget != null && r.gig.maxBudget != null && r.gig.minBudget !== r.gig.maxBudget
                  ? `₹${r.gig.minBudget.toLocaleString("en-IN")} - ₹${r.gig.maxBudget.toLocaleString("en-IN")}${r.gig.budgetType === "HOURLY" ? "/hr" : ""}`
                  : `₹${r.gig.budgetAmount.toLocaleString("en-IN")}${r.gig.budgetType === "HOURLY" ? "/hr" : ""}`}
              </p>
              <p>
                <span className="font-semibold text-[#0f172a]">Submitted:</span>{" "}
                {format(new Date(r.createdAt), "MMM d, yyyy")} (
                {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })})
              </p>
              {r.gig.deadline && (
                <p>
                  <span className="font-semibold text-[#0f172a]">Gig deadline:</span>{" "}
                  {format(new Date(r.gig.deadline), "MMM d, yyyy")}
                </p>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {r.gig.requiredSkills.map((s) => (
                <span
                  key={s.id}
                  className="rounded-full bg-[#f1f5f9] px-2 py-0.5 text-xs font-medium text-[#475569]"
                >
                  {s.name}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/freelancer/browse-gigs/${r.gig.id}`}
                className="text-sm font-semibold text-[#6d9c9f] hover:underline"
              >
                View gig →
              </Link>
              {r.status === "ACCEPTED" && r.contract && (
                <Link
                  href={`/contracts/${r.contract.id}`}
                  className="text-sm font-semibold text-[#16a34a] hover:underline"
                >
                  View contract →
                </Link>
              )}
              {r.status === "PENDING" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-red-600"
                  onClick={() => setWithdrawId(r.id)}
                >
                  Withdraw
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {!q.isLoading && filtered.length === 0 && (
        <p className="rounded-[14px] border border-[#e8ecf0] bg-white py-12 text-center text-sm text-[#94a3b8]">
          No proposals in this tab.
        </p>
      )}

      <AlertDialog open={!!withdrawId} onOpenChange={(o) => !o && setWithdrawId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw proposal?</AlertDialogTitle>
            <AlertDialogDescription>
              The business will no longer see this application as active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => withdrawId && withdraw.mutate(withdrawId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Withdraw
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
