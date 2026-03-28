"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { format, formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowLeftRight,
  Briefcase,
  Check,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  FileText,
  Github,
  Link2,
  Loader2,
  Lock,
  Plus,
  Send,
  Shield,
  Star,
  Tag,
  Upload,
  X,
  Zap,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Button } from "@/components/ui/button"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency"
import { UploadButton, UploadDropzone } from "@/lib/uploadthing-react"
import { toast } from "sonner"

/* ─────────────────── helpers ─────────────────── */

const steps = ["Contract Signed", "In Progress", "Under Review", "Revision", "Completed"] as const

function getStepIndex(status: string) {
  if (status === "PENDING") return 0
  if (status === "IN_PROGRESS") return 1
  if (status === "SUBMITTED" || status === "UNDER_REVIEW") return 2
  if (status === "REVISION_REQUESTED") return 3
  if (status === "COMPLETED") return 4
  if (status === "CANCELLED") return -1
  return 1
}

function statusColor(s: string) {
  if (s === "COMPLETED") return "bg-emerald-500"
  if (s === "IN_PROGRESS" || s === "SUBMITTED" || s === "UNDER_REVIEW") return "bg-blue-500"
  if (s === "REVISION_REQUESTED") return "bg-amber-500"
  if (s === "CANCELLED" || s === "DISPUTED") return "bg-red-500"
  return "bg-gray-400"
}

function statusLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

/* ─────────────────── main ─────────────────── */

export function ContractDetailPage({ contractId }: { contractId: string }) {
  const { data: session } = useSession()
  const isBusiness = session?.user?.role === "BUSINESS"
  const isFreelancer = session?.user?.role === "FREELANCER"
  const qc = useQueryClient()

  const { data: contract, isLoading, isError } = useQuery({
    queryKey: ["contract", contractId],
    queryFn: async () => {
      const res = await fetch(`/api/contracts/${contractId}`)
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || "Failed")
      return j.data
    },
    refetchInterval: 12_000,
  })

  const submitMut = useMutation({
    mutationFn: async (payload: { notes: string; links: string[]; files: any[] }) => {
      const attachments = [
        ...payload.links.filter(Boolean).map((url) => ({
          name: url.includes("github") ? "GitHub Repository" : url.includes("drive.google") ? "Google Drive" : new URL(url).hostname,
          url,
          size: 0,
          type: "link",
        })),
        ...payload.files.map(f => ({
          name: f.name,
          url: f.url,
          size: f.size,
          type: f.type || "file"
        }))
      ]

      const res = await fetch(`/api/contracts/${contractId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: payload.notes,
          attachments,
        }),
      })
      if (!res.ok) throw new Error("Submission failed")
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contract", contractId] })
      setShowSubmitDialog(false)
      setSubmitNotes("")
      setSubmitLinks([""])
      setUploadedFiles([])
      toast.success("Work submitted successfully!")
    },
    onError: (err: any) => {
      toast.error(err.message || "Something went wrong")
    }
  })

  const reviewMut = useMutation({
    mutationFn: async ({ subId, action }: { subId: string; action: string }) => {
      const res = await fetch(`/api/contracts/${contractId}/submissions/${subId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contract", contractId] }),
  })

  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [submitNotes, setSubmitNotes] = useState("")
  const [submitLinks, setSubmitLinks] = useState<string[]>([""])
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string; size: number; type: string }[]>([])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #fafbff 25%, #f0fdf9 50%, #fdf4ff 75%, #fff7ed 100%)" }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-gray-100" />
            <Loader2 className="absolute inset-0 h-16 w-16 animate-spin text-[#6d9c9f]" />
          </div>
          <p className="text-sm font-medium text-gray-400 tracking-wide">Loading workspace…</p>
        </motion.div>
      </div>
    )
  }

  if (isError || !contract) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #fafbff 25%, #f0fdf9 50%, #fdf4ff 75%, #fff7ed 100%)" }}>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100"><X className="h-8 w-8 text-red-500" /></div>
          <h2 className="text-xl font-bold text-gray-900">Contract not found</h2>
          <p className="mt-1 text-sm text-gray-500">You may not have permission to view this contract.</p>
          <Link href="/" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#6d9c9f] hover:underline"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link>
        </div>
      </div>
    )
  }

  const c = contract
  const b = c.business
  const f = c.freelancer
  const bI = (b.companyName || b.name || "").substring(0, 2).toUpperCase()
  const fI = (f.name || "").substring(0, 2).toUpperCase()
  const stepIdx = getStepIndex(c.status)
  const backHref = isBusiness ? "/business/contracts" : "/freelancer/contracts"
  const canSubmit = isFreelancer && (c.status === "IN_PROGRESS" || c.status === "REVISION_REQUESTED")

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #fafbff 25%, #f0fdf9 50%, #fdf4ff 75%, #fff7ed 100%)" }}>
      {/* Decorative background mesh */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full opacity-30" style={{ background: "radial-gradient(circle, #c4b5fd 0%, transparent 70%)" }} />
        <div className="absolute top-1/3 -left-40 h-[500px] w-[500px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #99f6e4 0%, transparent 70%)" }} />
        <div className="absolute -bottom-40 right-1/4 h-[500px] w-[500px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #fde68a 0%, transparent 70%)" }} />
      </div>

      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-50 border-b border-white/40 bg-white/60 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href={backHref} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#6d9c9f] transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <div className="hidden h-6 w-px bg-gray-300/40 sm:block" />
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-[#6d9c9f] shadow-sm">
                <Briefcase className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-900 max-w-[300px] truncate">{c.gig.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm", statusColor(c.status))}>
              <span className="h-1.5 w-1.5 rounded-full bg-white/50 animate-pulse" />
              {statusLabel(c.status)}
            </span>
            {session?.user && (
              <div className="flex items-center gap-2 rounded-full bg-white/80 pl-1 pr-3 py-1 border border-white/60 shadow-sm backdrop-blur-sm">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-[10px] font-bold bg-gradient-to-br from-violet-500 to-[#6d9c9f] text-white">
                    {(session.user.name || "U").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-semibold text-gray-700">{session.user.name}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* ── Hero Card ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
          style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 20%, #4c1d95 40%, #1e3a5f 60%, #134e4a 80%, #0f766e 100%)" }}
        >
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          <div className="absolute top-0 right-0 h-80 w-80 rounded-full opacity-25" style={{ background: "radial-gradient(circle, #a78bfa 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 left-0 h-60 w-60 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #2dd4bf 0%, transparent 70%)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full opacity-[0.08]" style={{ background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)" }} />

          <div className="relative z-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <p className="font-mono text-[11px] tracking-widest text-teal-300/60 uppercase">Contract Workspace</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight lg:text-4xl">{c.gig.title}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1.5 text-xs font-semibold">
                    <Tag className="h-3 w-3" /> {c.gig.category}
                  </span>
                  {c.gig.duration && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1.5 text-xs font-semibold">
                      <Clock className="h-3 w-3" /> {c.gig.duration}
                    </span>
                  )}
                  {c.gig.experienceLevel && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1.5 text-xs font-semibold">
                      <Zap className="h-3 w-3" /> {c.gig.experienceLevel}
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[11px] uppercase tracking-wider text-teal-300/50 font-semibold">Contract Value</p>
                <p className="mt-1 text-4xl font-black tracking-tight">{formatCurrency(c.agreedPrice)}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur-sm">
                <Avatar className="h-10 w-10 ring-2 ring-white/20">
                  <AvatarImage src={b.image || ""} />
                  <AvatarFallback className="bg-amber-400 text-[11px] font-black text-amber-900">{bI}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold">{b.companyName || b.name}</p>
                  <p className="text-[11px] text-teal-200/60 font-medium">Client</p>
                </div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <ArrowLeftRight className="h-4 w-4 text-teal-300/40" />
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur-sm">
                <Avatar className="h-10 w-10 ring-2 ring-teal-400/30">
                  <AvatarImage src={f.image || ""} />
                  <AvatarFallback className="bg-[#6d9c9f] text-[11px] font-black text-white">{fI}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold">{f.name}</p>
                  <p className="text-[11px] text-teal-200/60 font-medium">Freelancer</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Timeline ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-sm p-8 shadow-sm"
        >
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-[#6d9c9f] shadow-md">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Project Timeline</h2>
          </div>
          <div className="relative flex items-start justify-between">
            {/* Connector */}
            <div className="absolute top-5 left-[10%] right-[10%] h-[3px] bg-gray-100 rounded-full" />
            <div className="absolute top-5 left-[10%] h-[3px] rounded-full bg-gradient-to-r from-[#6d9c9f] to-[#2d7a7e] transition-all duration-700"
              style={{ width: `${Math.max(0, stepIdx) / (steps.length - 1) * 80}%` }}
            />
            {steps.map((label, i) => {
              const done = i <= stepIdx && stepIdx >= 0
              const current = i === stepIdx
              return (
                <div key={label} className="relative z-10 flex flex-col items-center" style={{ width: `${100 / steps.length}%` }}>
                  <motion.div
                    initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-500",
                      done && !current && "bg-gradient-to-br from-[#6d9c9f] to-[#2d7a7e] text-white shadow-lg shadow-teal-500/20",
                      current && "bg-white border-[3px] border-[#6d9c9f] text-[#2d7a7e] shadow-lg shadow-teal-500/20 ring-[6px] ring-teal-100",
                      !done && !current && "bg-gray-100 text-gray-400 border-2 border-gray-200"
                    )}
                  >
                    {done && !current ? <Check className="h-5 w-5" strokeWidth={3} /> : current ? <Circle className="h-4 w-4 fill-[#6d9c9f]" /> : <span>{i + 1}</span>}
                  </motion.div>
                  <p className={cn("mt-3 text-center text-[12px] font-bold leading-tight", current ? "text-gray-900" : done ? "text-gray-600" : "text-gray-400")}>
                    {label}
                  </p>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* ── Two Column Layout ── */}
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left */}
          <div className="space-y-8">
            {/* Project Brief */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-sm p-8 shadow-sm"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-md">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Project Brief</h2>
              </div>
              <div className="prose prose-sm max-w-none text-gray-600 leading-[1.8] whitespace-pre-wrap">
                {c.gig.description}
              </div>
              {c.gig.specialRequirements && (
                <div className="mt-6 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-5">
                  <p className="text-[11px] font-black text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Star className="h-3 w-3" /> Special Requirements
                  </p>
                  <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">{c.gig.specialRequirements}</p>
                </div>
              )}
            </motion.div>

            {/* Submissions / Work */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-2xl border border-gray-200/60 bg-white shadow-sm overflow-hidden"
            >
              <Tabs defaultValue="submissions" className="w-full">
                <div className="border-b border-gray-100 px-8 pt-6 pb-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-md">
                        <Upload className="h-4 w-4 text-white" />
                      </div>
                      <h2 className="text-lg font-bold text-gray-900">Deliverables</h2>
                    </div>
                    {canSubmit && (
                      <Button
                        onClick={() => setShowSubmitDialog(true)}
                        className="h-10 rounded-xl bg-gradient-to-r from-[#6d9c9f] to-[#2d7a7e] font-bold text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-px text-sm px-5"
                      >
                        <Send className="h-4 w-4 mr-2" /> Submit Work
                      </Button>
                    )}
                  </div>
                  <TabsList className="h-auto bg-transparent p-0 gap-1">
                    <TabsTrigger value="submissions" className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-[#6d9c9f] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 text-sm font-semibold">
                      Submissions ({c.submissions?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-[#6d9c9f] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 text-sm font-semibold">
                      Activity Log
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="submissions" className="px-8 py-6 mt-0 space-y-5">
                  {(!c.submissions || c.submissions.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200">
                        <Upload className="h-8 w-8 text-gray-300" />
                      </div>
                      <p className="text-base font-bold text-gray-800">No deliverables yet</p>
                      <p className="mt-1 max-w-sm text-sm text-gray-400">
                        {isFreelancer
                          ? "Start working and submit your deliverables when ready. You can share links, documents, or reports."
                          : "The freelancer hasn't submitted any work yet. You'll be notified when they do."}
                      </p>
                      {canSubmit && (
                        <Button onClick={() => setShowSubmitDialog(true)} variant="outline" className="mt-5 rounded-xl border-[#6d9c9f] text-[#6d9c9f] font-bold hover:bg-[#f0f9f9]">
                          <Plus className="h-4 w-4 mr-2" /> Submit your first delivery
                        </Button>
                      )}
                    </div>
                  ) : (
                    c.submissions.map((sub: any, idx: number) => (
                      <motion.div key={sub.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="group rounded-2xl border border-gray-200/60 bg-white p-6 transition-all hover:shadow-md hover:border-gray-300/60"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-xs font-bold shadow-sm",
                              sub.status === "ACCEPTED" ? "bg-emerald-500" : sub.status === "REVISION_REQUESTED" ? "bg-amber-500" : "bg-blue-500"
                            )}>
                              #{c.submissions.length - idx}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-gray-900">Delivery #{c.submissions.length - idx}</p>
                                <span className={cn(
                                  "text-[11px] font-bold px-2 py-0.5 rounded-full",
                                  sub.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-700" :
                                  sub.status === "REVISION_REQUESTED" ? "bg-amber-100 text-amber-700" :
                                  "bg-blue-100 text-blue-700"
                                )}>
                                  {sub.status === "REVISION_REQUESTED" ? "Revision Needed" : sub.status === "ACCEPTED" ? "Approved" : "Pending Review"}
                                </span>
                              </div>
                              <p className="mt-0.5 text-xs text-gray-400">
                                {formatDistanceToNow(new Date(sub.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>

                        {sub.notes && (
                          <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 p-4">
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{sub.notes}</p>
                          </div>
                        )}

                        {sub.attachments && sub.attachments.length > 0 && (
                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            {sub.attachments.map((att: any) => (
                              <a key={att.id} href={att.url} target="_blank" rel="noreferrer"
                                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all hover:border-[#6d9c9f] hover:shadow-sm group/link"
                              >
                                <div className={cn(
                                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                                  att.url.includes("github") ? "bg-gray-900 text-white" :
                                  att.url.includes("drive.google") ? "bg-blue-50 text-blue-600" :
                                  "bg-teal-50 text-teal-600"
                                )}>
                                  {att.url.includes("github") ? <Github className="h-5 w-5" /> :
                                   att.url.includes("drive.google") ? <FileText className="h-5 w-5" /> :
                                   <ExternalLink className="h-5 w-5" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-gray-800 group-hover/link:text-[#6d9c9f]">{att.name}</p>
                                  <p className="truncate text-[11px] text-gray-400">{att.url}</p>
                                </div>
                                <ExternalLink className="h-4 w-4 shrink-0 text-gray-300 group-hover/link:text-[#6d9c9f]" />
                              </a>
                            ))}
                          </div>
                        )}

                        {sub.revisionNote && (
                          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200/60 p-4">
                            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1">Revision Feedback</p>
                            <p className="text-sm text-amber-900">{sub.revisionNote}</p>
                          </div>
                        )}

                        {isBusiness && sub.status === "PENDING" && (
                          <div className="mt-4 flex gap-3 pt-4 border-t border-gray-100">
                            <Button disabled={reviewMut.isPending} onClick={() => reviewMut.mutate({ subId: sub.id, action: "APPROVE" })}
                              className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm text-sm"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve
                            </Button>
                            <Button disabled={reviewMut.isPending} variant="outline" onClick={() => reviewMut.mutate({ subId: sub.id, action: "REJECT" })}
                              className="h-9 rounded-xl font-bold text-sm border-amber-300 text-amber-700 hover:bg-amber-50"
                            >
                              Request Revision
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="activity" className="px-8 py-6 mt-0">
                  {(!c.activityLogs || c.activityLogs.length === 0) ? (
                    <p className="py-12 text-center text-sm text-gray-400">No activity recorded yet.</p>
                  ) : (
                    <div className="relative pl-6 border-l-2 border-gray-100 space-y-6">
                      {c.activityLogs.map((log: any) => (
                        <div key={log.id} className="relative">
                          <div className="absolute -left-[31px] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white border-2 border-gray-200">
                            <div className="h-2 w-2 rounded-full bg-[#6d9c9f]" />
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{log.action.replace(/_/g, " ")}</p>
                          <p className="text-sm text-gray-500">{log.description}</p>
                          <p className="mt-1 text-[11px] text-gray-400">{format(new Date(log.createdAt), "MMM d, yyyy · h:mm a")}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm"
            >
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#6d9c9f]" /> Contract Details
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-medium">Status</span>
                  <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full text-white", statusColor(c.status))}>
                    {statusLabel(c.status)}
                  </span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-medium">Agreed Price</span>
                  <span className="text-sm font-black text-gray-900">{formatCurrency(c.agreedPrice)}</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-medium">Category</span>
                  <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{c.gig.category}</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-medium">Submissions</span>
                  <span className="text-sm font-bold text-gray-900">{c.submissions?.length || 0}</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-medium">Revisions Used</span>
                  <span className="text-sm font-bold text-gray-900">{c.revisionCount || 0} / {c.maxRevisions || 3}</span>
                </div>
                {c.deadline && (
                  <>
                    <div className="h-px bg-gray-100" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-medium">Deadline</span>
                      <span className="text-xs font-semibold text-gray-700">{format(new Date(c.deadline), "MMM d, yyyy")}</span>
                    </div>
                  </>
                )}
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-medium">Created</span>
                  <span className="text-xs font-semibold text-gray-700">{format(new Date(c.createdAt), "MMM d, yyyy")}</span>
                </div>
              </div>
            </motion.div>

            {/* Parties */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm"
            >
              <h3 className="text-sm font-bold text-gray-900 mb-4">Parties</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={b.image || ""} />
                    <AvatarFallback className="bg-amber-100 text-amber-800 font-bold text-xs">{bI}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{b.companyName || b.name}</p>
                    <p className="text-[11px] text-gray-400 font-medium">Client · {b.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={f.image || ""} />
                    <AvatarFallback className="bg-[#6d9c9f] text-white font-bold text-xs">{fI}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{f.name}</p>
                    <p className="text-[11px] text-gray-400 font-medium">Freelancer · {f.email}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Secure Badge */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                  <Lock className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-900">Secure Contract</p>
                  <p className="mt-1 text-xs text-emerald-700 leading-relaxed">
                    This contract is protected by Contractual's secure platform. All communications and files are encrypted.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Submit Work Dialog ── */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Submit Deliverables</DialogTitle>
            <DialogDescription>
              Share your work by providing links to repositories, documents, or uploading files directly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-bold text-gray-900">Delivery Notes</label>
              <textarea
                value={submitNotes}
                onChange={(e) => setSubmitNotes(e.target.value)}
                placeholder="Describe your work, steps taken, and how to verify it..."
                className="mt-2 min-h-[120px] w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-900">Upload Project Files (Max 30MB)</label>
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 transition-colors hover:border-teal-500/50">
                <UploadDropzone
                  endpoint="submissionFiles"
                  onClientUploadComplete={(res) => {
                    if (res) {
                      const newFiles = res.map(f => ({
                        name: f.name,
                        url: f.url,
                        size: f.size,
                        type: f.type || "file"
                      }))
                      setUploadedFiles(prev => [...prev, ...newFiles])
                      toast.success(`${res.length} file(s) uploaded`)
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`Upload failed: ${error.message}`)
                  }}
                  config={{ mode: "manual" }}
                  className="ut-label:text-teal-600 ut-button:bg-teal-600 ut-button:ut-readying:bg-teal-500/50 ut-button:ut-uploading:bg-teal-500/50 ut-allowed-content:text-gray-400"
                />
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Uploaded Files ({uploadedFiles.length})</p>
                  <div className="grid gap-2">
                    {uploadedFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900">{f.name}</p>
                            <p className="text-[10px] text-gray-500">{(f.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-900">External Links (Optional)</label>
                <button
                  onClick={() => setSubmitLinks([...submitLinks, ""])}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:underline"
                >
                  <Plus className="h-3 w-3" /> Add another
                </button>
              </div>
              <p className="text-[11px] text-gray-500">Add GitHub repos, Google Drive folders, or live demos.</p>
              <div className="grid gap-2">
                {submitLinks.map((link, i) => (
                  <div key={i} className="group relative flex items-center">
                    <Link2 className="absolute left-4 h-4 w-4 text-gray-400" />
                    <input
                      value={link}
                      onChange={(e) => {
                        const next = [...submitLinks]
                        next[i] = e.target.value
                        setSubmitLinks(next)
                      }}
                      placeholder="https://github.com/user/project"
                      className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-11 text-sm focus:border-teal-500 focus:outline-none"
                    />
                    {submitLinks.length > 1 && (
                      <button
                        onClick={() => setSubmitLinks(submitLinks.filter((_, idx) => idx !== i))}
                        className="absolute right-3 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-8 border-t pt-6">
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)} className="rounded-xl px-6">
              Cancel
            </Button>
            <Button
              disabled={submitMut.isPending || (uploadedFiles.length === 0 && submitLinks.every(l => !l))}
              onClick={() => {
                submitMut.mutate({ notes: submitNotes, links: submitLinks.filter(Boolean), files: uploadedFiles })
              }}
              className="rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-8 font-bold text-white shadow-md hover:shadow-lg transition-all"
            >
              {submitMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Submit Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
