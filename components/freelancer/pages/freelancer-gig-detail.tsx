"use client"

import { useCallback, useMemo, useState } from "react"
import Link from "next/link"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import {
  BadgeCheck,
  BarChart2,
  Bookmark,
  Building2,
  Clock,
  Eye,
  Loader2,
  Shield,
  Users,
  Zap,
} from "lucide-react"
import type { ApplicationStatus, GigSkill, GigStatus } from "@prisma/client"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { formatCurrency, formatCurrencyRange } from "@/lib/currency"
import { qk } from "@/lib/realtime/query-keys"
import { cn } from "@/lib/utils"

const BORDER = "#e8ecf0"

type GigWithViewer = {
  id: string
  title: string
  description: string
  category: string
  budgetType: string
  budgetAmount: number
  minBudget: number | null
  maxBudget: number | null
  currency: string
  deadline: Date | string | null
  duration: string | null
  experienceLevel: string
  isUrgent: boolean
  specialRequirements: string | null
  deliverables: unknown
  status: GigStatus
  viewCount: number
  business: {
    id: string
    name: string
    image: string | null
    isVerified: boolean
    companyName: string | null
    companyDesc: string | null
    industry: string | null
  }
  requiredSkills: GigSkill[]
  _count: { applications: number }
  viewerApplication: { id: string; status: ApplicationStatus } | null
}

async function fetchGig(id: string): Promise<GigWithViewer> {
  const res = await fetch(`/api/gigs/${id}`)
  const j = (await res.json()) as { data?: GigWithViewer; error?: string }
  if (!res.ok) throw new Error(j.error ?? "Failed to load gig")
  if (!j.data) throw new Error("Not found")
  return j.data
}

function statusBanner(status: ApplicationStatus) {
  if (status === "PENDING") {
    return (
      <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm font-semibold text-[#16a34a]">
        You have already applied — status: Pending
      </div>
    )
  }
  if (status === "ACCEPTED") {
    return (
      <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm font-semibold text-[#16a34a]">
        Your proposal was accepted — check your contracts.
      </div>
    )
  }
  if (status === "WITHDRAWN") {
    return (
      <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm font-semibold text-[#64748b]">
        Application withdrawn.
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-semibold text-[#ef4444]">
      Application not selected.
    </div>
  )
}

export function FreelancerGigDetail({ id }: { id: string }) {
  const { data: session, status: sessionStatus } = useSession()
  const qc = useQueryClient()
  const [bid, setBid] = useState("")
  const [letter, setLetter] = useState("")
  const [deliveryDays, setDeliveryDays] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const q = useQuery({
    queryKey: qk.gig(id),
    queryFn: () => fetchGig(id),
    enabled: Boolean(id),
  })

  const gig = q.data

  const budgetLabel = useMemo(() => {
    if (!gig) return ""
    const min = gig.minBudget
    const max = gig.maxBudget
    if (min != null && max != null && min !== max) {
      return formatCurrencyRange(min, max)
    }
    return formatCurrency(gig.budgetAmount)
  }, [gig])

  const descriptionParagraphs = useMemo(() => {
    if (!gig?.description) return []
    return gig.description.split(/\n\n+/).filter(Boolean)
  }, [gig?.description])

  const onSubmit = useCallback(async () => {
    if (!gig) return
    if (session?.user?.role !== "FREELANCER") {
      toast.error("Sign in as a freelancer to apply")
      return
    }
    const bidNum = Number(bid)
    if (!bidNum || bidNum <= 0) {
      toast.error("Enter a valid proposed amount (₹)")
      return
    }
    if (letter.trim().length < 100) {
      toast.error("Cover letter must be at least 100 characters")
      return
    }
    const days = deliveryDays.trim() ? Number(deliveryDays) : undefined
    if (days !== undefined && (!Number.isInteger(days) || days <= 0)) {
      toast.error("Delivery days must be a positive whole number")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gigId: gig.id,
          proposedPrice: bidNum,
          proposal: letter.trim(),
          deliveryDays: days,
        }),
      })
      const j = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(j.error ?? "Apply failed")
      toast.success("Proposal submitted")
      setLetter("")
      await qc.invalidateQueries({ queryKey: qk.gig(id) })
      await qc.invalidateQueries({ queryKey: qk.gigs() })
      await qc.invalidateQueries({ queryKey: qk.applications() })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed")
    } finally {
      setSubmitting(false)
    }
  }, [bid, deliveryDays, gig, letter, qc, id, session?.user?.role])

  if (q.isLoading || sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center rounded-[14px] border bg-white p-12" style={{ borderColor: BORDER }}>
        <Loader2 className="h-8 w-8 animate-spin text-[#6d9c9f]" />
      </div>
    )
  }

  if (q.isError || !gig) {
    return (
      <div className="rounded-[14px] border bg-white p-8 text-center" style={{ borderColor: BORDER }}>
        <p className="text-[#64748b]">Gig not found.</p>
        <Link href="/freelancer/browse-gigs" className="mt-4 inline-block text-sm font-semibold text-[#6d9c9f]">
          ← Back to Browse
        </Link>
      </div>
    )
  }

  if (gig.status !== "OPEN") {
    return (
      <div className="rounded-[14px] border bg-white p-8 text-center" style={{ borderColor: BORDER }}>
        <p className="text-[#64748b]">This gig is no longer open for applications.</p>
        <Link href="/freelancer/browse-gigs" className="mt-4 inline-block text-sm font-semibold text-[#6d9c9f]">
          ← Back to Browse
        </Link>
      </div>
    )
  }

  const company = gig.business.companyName ?? gig.business.name
  const viewer = gig.viewerApplication
  const canApply = session?.user?.role === "FREELANCER" && !viewer

  return (
    <div className="space-y-4">
      <Link
        href="/freelancer/browse-gigs"
        className="inline-flex text-[13px] font-semibold text-[#6d9c9f] hover:underline"
      >
        ← Back to Browse
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-4">
          <div className="rounded-[14px] border bg-white p-6" style={{ borderColor: BORDER }}>
            <p className="text-xs text-[#94a3b8]">
              Browse › {gig.category} › {gig.title}
            </p>
            <h1 className="mt-2 font-bricolage text-2xl font-extrabold text-[#0f172a]">{gig.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {gig.business.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={gig.business.image}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f4f5] text-sm font-bold text-[#2d7a7e]">
                  {company.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-[15px] font-semibold text-[#0f172a]">{company}</p>
                <span className="inline-flex items-center gap-1 text-xs text-[#64748b]">
                  {gig.business.isVerified && (
                    <>
                      <BadgeCheck className="h-3.5 w-3.5 text-[#6d9c9f]" />
                      Verified Business
                    </>
                  )}
                </span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-[13px] text-[#64748b]">
              {gig.business.industry && (
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" /> {gig.business.industry}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> {gig.viewCount} views
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {gig._count.applications} applicants
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {gig.requiredSkills.map((s) => (
                <span
                  key={s.id}
                  className="rounded-lg border border-[#b0d4d6] bg-[#e8f4f5] px-3 py-1.5 text-[13px] font-semibold text-[#2d7a7e]"
                >
                  {s.name}
                </span>
              ))}
            </div>
            {gig.isUrgent && (
              <p className="mt-2 text-xs font-semibold text-amber-600">Urgent</p>
            )}
          </div>

          <div className="rounded-[14px] border bg-white p-6" style={{ borderColor: BORDER }}>
            <h3 className="text-[15px] font-bold text-[#0f172a]">About This Gig</h3>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#374151]">
              {descriptionParagraphs.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
            {gig.specialRequirements && (
              <>
                <h3 className="mt-5 text-[15px] font-bold text-[#0f172a]">Special requirements</h3>
                <p className="mt-2 text-sm text-[#374151]">{gig.specialRequirements}</p>
              </>
            )}
          </div>
        </div>

        <div className="lg:sticky lg:top-[76px] lg:self-start">
          <div
            className="rounded-2xl border bg-white p-6 shadow-[0_8px_32px_rgba(109,156,159,0.12)]"
            style={{ borderColor: BORDER, borderWidth: 1.5 }}
          >
            <p className="text-xs text-[#94a3b8]">Budget ({gig.budgetType})</p>
            <p className="font-bricolage text-[28px] font-extrabold text-[#0f172a]">{budgetLabel}</p>
            <div className="my-4 h-px bg-[#f1f5f9]" />
            <div className="space-y-2 text-sm text-[#374151]">
              {gig.deadline && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#64748b]" />
                  Deadline {formatDistanceToNow(new Date(gig.deadline), { addSuffix: true })}
                </div>
              )}
              {gig.duration && (
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-[#64748b]" /> {gig.duration}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#64748b]" /> Level: {gig.experienceLevel}
              </div>
            </div>

            {viewer && <div className="mt-4">{statusBanner(viewer.status)}</div>}

            {canApply && (
              <>
                <div className="my-4 h-px bg-[#f1f5f9]" />
                <label className="text-[13px] font-semibold text-[#0f172a]">Your proposed amount (₹)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]">₹</span>
                  <input
                    value={bid}
                    onChange={(e) => setBid(e.target.value)}
                    className="h-[42px] w-full rounded-lg border border-[#e8ecf0] pl-7 pr-3 text-[13px] text-[#0f172a] outline-none focus:border-[#6d9c9f] focus:ring-2 focus:ring-[#6d9c9f]/20"
                    placeholder={String(Math.round(gig.budgetAmount))}
                  />
                </div>
                <label className="mt-3 block text-[13px] font-semibold text-[#0f172a]">
                  Estimated delivery (days, optional)
                </label>
                <input
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(e.target.value)}
                  className="mt-1 h-[42px] w-full rounded-lg border border-[#e8ecf0] px-3 text-[13px] text-[#0f172a] outline-none focus:border-[#6d9c9f] focus:ring-2 focus:ring-[#6d9c9f]/20"
                  placeholder="14"
                />
                <label className="mt-3 block text-[13px] font-semibold text-[#0f172a]">Cover letter</label>
                <textarea
                  value={letter}
                  onChange={(e) => setLetter(e.target.value)}
                  rows={5}
                  maxLength={5000}
                  placeholder="Introduce yourself and explain why you're a great fit (min. 100 characters)..."
                  className="mt-1 w-full rounded-lg border border-[#e8ecf0] p-3 text-[13px] text-[#0f172a] outline-none focus:border-[#6d9c9f] focus:ring-2 focus:ring-[#6d9c9f]/20"
                />
                <p className="mt-1 text-right text-[11px] text-[#94a3b8]">{letter.length} characters</p>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void onSubmit()}
                  className={cn(
                    "mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-br from-[#6d9c9f] to-[#2d7a7e] py-3 text-[15px] font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(109,156,159,0.4)] disabled:opacity-60"
                  )}
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit Application
                </button>
              </>
            )}

            {session?.user && session.user.role !== "FREELANCER" && (
              <p className="mt-4 text-center text-sm text-[#94a3b8]">
                Sign in with a freelancer account to apply.
              </p>
            )}

            {!session?.user && (
              <Link
                href="/auth/signin?callbackUrl=/freelancer/browse-gigs"
                className="mt-4 block w-full rounded-[10px] bg-[#0f172a] py-3 text-center text-[15px] font-bold text-white"
              >
                Sign in to apply
              </Link>
            )}

            <button
              type="button"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-[#e8ecf0] py-2 text-[13px] font-medium text-[#64748b] transition-colors hover:border-[#6d9c9f] hover:text-[#6d9c9f]"
            >
              <Bookmark className="h-3.5 w-3.5" />
              Save Gig
            </button>
            <div className="mt-4 flex justify-center gap-6 text-[11px] text-[#94a3b8]">
              <span className="inline-flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" /> Protected
              </span>
              <span className="inline-flex items-center gap-1">
                <Zap className="h-3.5 w-3.5" /> Fast
              </span>
              <span className="inline-flex items-center gap-1">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
