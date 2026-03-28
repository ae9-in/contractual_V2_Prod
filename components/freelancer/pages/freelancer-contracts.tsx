"use client"

import Link from "next/link"
import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { Building2, Calendar, Clock, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { qk } from "@/lib/realtime/query-keys"
import { cn } from "@/lib/utils"

const BORDER = "#e8ecf0"

type ContractRow = {
  id: string
  contractNumber: string
  status: string
  statusLabel: string
  agreedPrice: number
  currency: string
  deadline: string | null
  startedAt: string | null
  progress: number
  submissionCount: number
  gig: {
    id: string
    title: string
    business: { id: string; name: string; companyName: string | null; image: string | null }
  }
  milestones: { id: string; status: string; createdAt: string }[]
}

async function fetchContracts(tab: string): Promise<{ rows: ContractRow[]; total: number }> {
  const res = await fetch(`/api/freelancer/contracts?tab=${encodeURIComponent(tab)}&limit=50`)
  const j = (await res.json()) as {
    data?: ContractRow[]
    meta?: { total?: number }
    error?: string
  }
  if (!res.ok) throw new Error(j.error ?? "Failed")
  return { rows: j.data ?? [], total: j.meta?.total ?? 0 }
}

export function FreelancerContracts() {
  const [tab, setTab] = useState<"active" | "completed" | "cancelled">("active")
  const [submitId, setSubmitId] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const qc = useQueryClient()

  const q = useQuery({
    queryKey: qk.freelancerContracts(tab),
    queryFn: () => fetchContracts(tab),
    refetchInterval: 20_000,
  })

  const submitMut = useMutation({
    mutationFn: async (contractId: string) => {
      const res = await fetch(`/api/contracts/${encodeURIComponent(contractId)}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notes.trim() || undefined, attachments: [] }),
      })
      const j = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(j.error ?? "Submit failed")
      return j
    },
    onSuccess: () => {
      toast.success("Work submitted for review")
      setSubmitId(null)
      setNotes("")
      void qc.invalidateQueries({ queryKey: qk.freelancerContracts(tab) })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const list = q.data?.rows ?? []

  return (
    <div className="space-y-5">
      <h1 className="font-bricolage text-[22px] font-extrabold text-[#0f172a]">Contracts</h1>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["active", `Active (${tab === "active" ? list.length : "…"})`],
            ["completed", "Completed"],
            ["cancelled", "Cancelled"],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={cn(
              "rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors",
              tab === k ? "bg-[#0f172a] font-semibold text-white" : "border border-[#e8ecf0] bg-white text-[#64748b] hover:text-[#0f172a]"
            )}
          >
            {l}
          </button>
        ))}
      </div>

      {q.isLoading && <p className="text-sm text-[#94a3b8]">Loading…</p>}

      {!q.isLoading &&
        list.map((c) => (
          <div key={c.id} className="rounded-[14px] border bg-white p-5" style={{ borderColor: BORDER }}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="font-mono text-xs text-[#94a3b8]">#{c.contractNumber}</p>
              <span className="rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-2 py-0.5 text-[11px] font-semibold text-[#2563eb]">
                {c.statusLabel}
              </span>
              <p className="w-full text-right font-mono text-lg font-bold text-[#0f172a] sm:w-auto">
                ₹{c.agreedPrice.toLocaleString("en-IN")}
              </p>
            </div>
            <h2 className="mt-2 font-bricolage text-[17px] font-bold text-[#0f172a]">{c.gig.title}</h2>
            <div className="mt-2 flex flex-wrap gap-4 text-[13px] text-[#64748b]">
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />{" "}
                {c.gig.business.companyName || c.gig.business.name}
              </span>
              {c.deadline && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Due {format(new Date(c.deadline), "MMM d, yyyy")}
                </span>
              )}
              {c.startedAt && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Started {format(new Date(c.startedAt), "MMM d, yyyy")}
                </span>
              )}
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#0f172a]">Progress</span>
                <span className="text-[#94a3b8]">{c.submissionCount} submission(s)</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#f1f5f9]">
                <motion.div
                  className="h-full rounded-full bg-[#6d9c9f]"
                  initial={{ width: 0 }}
                  animate={{ width: `${c.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/contracts/${c.id}`}
                className="inline-flex h-9 items-center rounded-lg border border-[#e8ecf0] px-4 text-[13px] font-semibold text-[#0f172a] hover:border-[#6d9c9f]"
              >
                Open workspace
              </Link>
              <Link
                href={`/freelancer/messages`}
                className="inline-flex h-9 items-center gap-1 rounded-lg bg-[#f4f6f9] px-4 text-[13px] font-semibold text-[#64748b]"
              >
                <MessageSquare className="h-4 w-4" /> Messages
              </Link>
              {tab === "active" && (c.status === "IN_PROGRESS" || c.status === "REVISION_REQUESTED") && (
                <Button type="button" size="sm" onClick={() => setSubmitId(c.id)}>
                  Submit work
                </Button>
              )}
            </div>
          </div>
        ))}

      {!q.isLoading && list.length === 0 && (
        <p className="rounded-[14px] border border-[#e8ecf0] bg-white py-12 text-center text-sm text-[#94a3b8]">
          No active contracts yet.
        </p>
      )}

      <Dialog open={!!submitId} onOpenChange={(o) => !o && setSubmitId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit work</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Delivery notes for the client…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[120px]"
          />
          <p className="text-xs text-[#94a3b8]">Files can be added from the contract workspace.</p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSubmitId(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={submitMut.isPending || !submitId}
              onClick={() => submitId && submitMut.mutate(submitId)}
            >
              {submitMut.isPending ? "Submitting…" : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
