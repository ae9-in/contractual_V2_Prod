"use client"

import Link from "next/link"
import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { MapPin, Star, Briefcase, Pencil, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { qk } from "@/lib/realtime/query-keys"

const BORDER = "#e8ecf0"

type Profile = {
  id: string
  name: string
  image: string | null
  headline: string | null
  bio: string | null
  location: string | null
  hourlyRate: number | null
  availability: string | null
  createdAt: string
  skills: { id: string; name: string }[]
  completedContracts: number
  avgRating: number | null
  reviewCount: number
  profileCompleteness: number
}

async function loadProfile(): Promise<Profile> {
  const res = await fetch("/api/freelancer/profile")
  const j = (await res.json()) as { data?: Profile; error?: string }
  if (!res.ok) throw new Error(j.error ?? "Failed")
  if (!j.data) throw new Error("No data")
  return j.data
}

export function FreelancerProfileDashboard() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: qk.freelancerProfile(), queryFn: loadProfile })
  const [skillDraft, setSkillDraft] = useState("")

  const patch = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch("/api/freelancer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const j = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(j.error ?? "Save failed")
      return j
    },
    onSuccess: () => {
      toast.success("Saved")
      void qc.invalidateQueries({ queryKey: qk.freelancerProfile() })
      void qc.invalidateQueries({ queryKey: qk.dashboardStats() })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const addSkill = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/freelancer/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      const j = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(j.error ?? "Failed")
      return j
    },
    onSuccess: () => {
      setSkillDraft("")
      void qc.invalidateQueries({ queryKey: qk.freelancerProfile() })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const delSkill = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/freelancer/skills/${encodeURIComponent(id)}`, { method: "DELETE" })
      const j = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(j.error ?? "Failed")
      return j
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: qk.freelancerProfile() }),
    onError: (e: Error) => toast.error(e.message),
  })

  const p = q.data

  if (q.isLoading || !p) {
    return <p className="text-sm text-[#94a3b8]">Loading profile…</p>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-bricolage text-[22px] font-extrabold text-[#0f172a]">Profile</h1>
        <p className="mt-1 text-[13px] text-[#94a3b8]">
          {p.profileCompleteness}% complete · Visible to clients on Contractual
        </p>
      </div>

      {p.profileCompleteness < 80 && (
        <div
          className="rounded-[14px] border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900"
          style={{ borderColor: BORDER }}
        >
          Complete your profile (aim for 80%+) to improve match quality.
        </div>
      )}

      <div className="rounded-[14px] border bg-white p-8 text-center" style={{ borderColor: BORDER }}>
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#6d9c9f] to-[#2d7a7e] text-2xl font-bold text-white">
          {p.name.slice(0, 2).toUpperCase()}
        </div>
        <h2 className="mt-4 font-bricolage text-xl font-bold text-[#0f172a]">{p.name}</h2>
        <div className="mt-2 flex flex-col gap-2 sm:mx-auto sm:max-w-md">
          <Input
            placeholder="Professional headline"
            defaultValue={p.headline ?? ""}
            onBlur={(e) => {
              const v = e.target.value.trim()
              if (v !== (p.headline ?? "")) patch.mutate({ headline: v || null })
            }}
          />
        </div>
        <p className="mt-2 inline-flex items-center gap-1 text-[13px] text-[#94a3b8]">
          <MapPin className="h-3.5 w-3.5" />
          <Input
            className="inline-block h-8 max-w-[240px] border-dashed text-[#64748b]"
            placeholder="Location"
            defaultValue={p.location ?? ""}
            onBlur={(e) => {
              const v = e.target.value.trim()
              if (v !== (p.location ?? "")) patch.mutate({ location: v || null })
            }}
          />
        </p>

        <div className="mt-8 grid grid-cols-3 gap-4 border-y border-[#f8fafc] py-6">
          <div>
            <p className="flex items-center justify-center gap-1 font-mono text-lg font-bold text-[#0f172a]">
              <Star className="h-4 w-4 fill-[#f59e0b] text-[#f59e0b]" />
              {p.avgRating != null ? p.avgRating.toFixed(1) : "—"}
            </p>
            <p className="text-[11px] text-[#94a3b8]">Rating ({p.reviewCount})</p>
          </div>
          <div>
            <p className="font-mono text-lg font-bold text-[#0f172a]">{p.completedContracts}</p>
            <p className="text-[11px] text-[#94a3b8]">Jobs done</p>
          </div>
          <div>
            <p className="font-mono text-lg font-bold text-[#0f172a]">
              <Input
                type="number"
                className="h-8 text-center font-mono"
                defaultValue={p.hourlyRate ?? ""}
                placeholder="Rate"
                onBlur={(e) => {
                  const n = parseFloat(e.target.value)
                  if (!Number.isFinite(n)) return
                  if (n !== (p.hourlyRate ?? NaN)) patch.mutate({ hourlyRate: n })
                }}
              />
            </p>
            <p className="text-[11px] text-[#94a3b8]">₹ / hr</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {p.skills.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1 rounded-full border border-[#b0d4d6] bg-[#e8f4f5] px-3 py-1 text-[12px] font-semibold text-[#2d7a7e]"
            >
              {s.name}
              <button
                type="button"
                className="rounded-full p-0.5 hover:bg-black/10"
                aria-label={`Remove ${s.name}`}
                onClick={() => delSkill.mutate(s.id)}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="mx-auto mt-4 flex max-w-sm gap-2">
          <Input
            placeholder="Add skill"
            value={skillDraft}
            onChange={(e) => setSkillDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                const n = skillDraft.trim()
                if (n) addSkill.mutate(n)
              }
            }}
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => {
              const n = skillDraft.trim()
              if (n) addSkill.mutate(n)
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <p className="mt-4 text-xs text-[#94a3b8]">Member since {format(new Date(p.createdAt), "MMMM yyyy")}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/freelancer/profile/edit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#e8ecf0] px-5 text-[13px] font-semibold text-[#0f172a] hover:border-[#6d9c9f]"
          >
            <Pencil className="h-4 w-4" /> Extended edit
          </Link>
          <Link
            href="/freelancer/dashboard"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#6d9c9f] px-5 text-[13px] font-semibold text-white hover:bg-[#2d7a7e]"
          >
            <Briefcase className="h-4 w-4" /> Overview
          </Link>
        </div>
      </div>

      <div className="rounded-[14px] border bg-white p-6" style={{ borderColor: BORDER }}>
        <h3 className="text-[15px] font-bold text-[#0f172a]">About</h3>
        <Textarea
          className="mt-3 min-h-[120px]"
          defaultValue={p.bio ?? ""}
          placeholder="Tell clients about your experience…"
          onBlur={(e) => {
            const v = e.target.value.trim()
            if (v !== (p.bio ?? "")) patch.mutate({ bio: v || null })
          }}
        />
      </div>

      <div className="rounded-[14px] border bg-white p-6" style={{ borderColor: BORDER }}>
        <h3 className="text-[15px] font-bold text-[#0f172a]">Availability</h3>
        <Input
          className="mt-2"
          defaultValue={p.availability ?? ""}
          placeholder="e.g. 30h / week"
          onBlur={(e) => {
            const v = e.target.value.trim()
            if (v !== (p.availability ?? "")) patch.mutate({ availability: v || null })
          }}
        />
      </div>
    </div>
  )
}
