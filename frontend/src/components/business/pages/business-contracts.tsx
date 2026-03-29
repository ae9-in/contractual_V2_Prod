"use client"

import Link from "next/link"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { User, Calendar, Clock, MessageSquare, ChevronRight, Briefcase } from "lucide-react"
import { motion } from "framer-motion"
import { qk } from "@/lib/realtime/query-keys"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency"

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
    category: string
  }
  freelancer: { id: string; name: string; image: string | null }
  _count: { submissions: number }
}

async function fetchBusinessContracts(tab: string): Promise<{ rows: ContractRow[]; total: number }> {
  // We use the common contracts API which handles both business and freelancer
  // Filtering by tab can be added if needed, for now we fetch all and filter client-side or use params
  const res = await fetch(`/api/contracts?limit=50`)
  const j = (await res.json()) as {
    data?: ContractRow[]
    meta?: { total?: number }
    error?: string
  }
  if (!res.ok) throw new Error(j.error ?? "Failed to load contracts")
  
  let rows = j.data ?? []
  if (tab === "active") {
    rows = rows.filter(r => !["COMPLETED", "CANCELLED"].includes(r.status))
  } else if (tab === "completed") {
    rows = rows.filter(r => r.status === "COMPLETED")
  } else if (tab === "cancelled") {
    rows = rows.filter(r => r.status === "CANCELLED")
  }

  return { rows, total: j.meta?.total ?? 0 }
}

export function BusinessContracts() {
  const [tab, setTab] = useState<"active" | "completed" | "cancelled">("active")

  const q = useQuery({
    queryKey: ["business", "contracts", tab],
    queryFn: () => fetchBusinessContracts(tab),
    refetchInterval: 30_000,
  })

  const list = q.data?.rows ?? []

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#0f172a]">Active Contracts</h1>
          <p className="mt-1 text-sm text-[#64748b]">Manage your ongoing projects, review work, and release payments.</p>
        </div>
        <div className="flex bg-gray-100/50 p-1 rounded-xl border border-gray-200/50">
          {(
            [
              ["active", "Active"],
              ["completed", "Completed"],
              ["cancelled", "Cancelled"],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-[13px] font-bold transition-all",
                tab === k 
                  ? "bg-white text-[#0f172a] shadow-sm ring-1 ring-black/5" 
                  : "text-[#64748b] hover:text-[#0f172a]"
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {q.isLoading && (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      )}

      {!q.isLoading && list.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white py-20 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
            <Briefcase className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No {tab} contracts</h3>
          <p className="mt-1 text-sm text-gray-500">When you hire a freelancer, the contract will appear here.</p>
          <Link href="/business/applications" className="mt-6 inline-flex h-10 items-center rounded-xl bg-[#6d9c9f] px-6 text-sm font-bold text-white shadow-md hover:bg-[#2d7a7e] transition-all">
            Review Applications
          </Link>
        </div>
      )}

      <div className="grid gap-4">
        {list.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-[#6d9c9f]/30 hover:shadow-md"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">
                    #{c.contractNumber || c.id.substring(0, 8)}
                  </span>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-white",
                    c.status === "COMPLETED" ? "bg-emerald-500" :
                    c.status === "IN_PROGRESS" ? "bg-blue-500" :
                    c.status === "SUBMITTED" ? "bg-amber-500" :
                    "bg-gray-400"
                  )}>
                    {c.status.replace("_", " ")}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#6d9c9f] transition-colors">
                  {c.gig.title}
                </h2>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                  <div className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500">
                    <User className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-900">{c.freelancer.name}</span>
                  </div>
                  {c.deadline && (
                    <div className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span>Due {format(new Date(c.deadline), "MMM d, yyyy")}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span>{c._count?.submissions || 0} Submissions</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 text-right">
                <p className="text-xl font-black text-gray-900">
                  {formatCurrency(c.agreedPrice)}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/contracts/${c.id}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#0f172a] px-4 text-[13px] font-bold text-white shadow-sm hover:bg-black transition-all"
                  >
                    Open Workspace <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/business/messages?cid=${c.id}`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-[#6d9c9f] hover:text-[#6d9c9f] transition-all"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
