"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { addDays, format } from "date-fns"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { UploadButton } from "@/lib/uploadthing-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { formatCurrencyRange, formatHourlyRange } from "@/lib/currency"
import { qk } from "@/lib/realtime/query-keys"

const TEAL = "#6d9c9f"
const LABEL = "text-[13px] font-semibold text-[#0f172a]"
const INPUT =
  "h-[42px] w-full rounded-[8px] border border-[#e2e8f0] bg-white px-3 text-[13px] font-medium text-[#0f172a] placeholder:text-[#94a3b8] shadow-none outline-none focus:border-[#6d9c9f] focus:ring-2 focus:ring-[#6d9c9f]/25"
const TEXTAREA =
  "min-h-[140px] w-full rounded-[8px] border border-[#e2e8f0] bg-white px-3 py-2 text-[13px] font-medium text-[#0f172a] placeholder:text-[#94a3b8] outline-none focus:border-[#6d9c9f] focus:ring-2 focus:ring-[#6d9c9f]/25"

const CATEGORIES = [
  "Development",
  "Design",
  "Writing",
  "Marketing",
  "Video",
  "SEO",
  "Data & Analytics",
  "DevOps",
  "Consulting",
] as const

const DURATIONS = [
  "Less than 1 week",
  "1–2 weeks",
  "2–4 weeks",
  "1–3 months",
  "3–6 months",
  "Ongoing",
] as const

const STEP_LABELS = ["Basics", "Details", "Budget", "Extras", "Review"]

function suggestedRange(category: string): string {
  const m: Record<string, string> = {
    Development: "₹8,000 – ₹50,000",
    Design: "₹5,000 – ₹40,000",
    Writing: "₹3,000 – ₹25,000",
    Marketing: "₹6,000 – ₹35,000",
    Default: "₹5,000 – ₹40,000",
  }
  return m[category] ?? m.Default
}

import { useEffect } from "react"

export function PostGigWizardPage({ editId }: { editId?: string }) {
  const router = useRouter()
  const qc = useQueryClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState<"idle" | "publish" | "draft">("idle")

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [isUrgent, setIsUrgent] = useState(false)

  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [experienceLevel, setExperienceLevel] = useState<
    "BEGINNER" | "INTERMEDIATE" | "EXPERT"
  >("INTERMEDIATE")
  const [deliverables, setDeliverables] = useState<string[]>([""])
  const [bannerImage, setBannerImage] = useState("")

  const [budgetKind, setBudgetKind] = useState<"fixed" | "hourly">("fixed")
  const [minBudget, setMinBudget] = useState(8000)
  const [maxBudget, setMaxBudget] = useState(50000)
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>(DURATIONS[2])
  const [deadline, setDeadline] = useState<Date | undefined>(() => addDays(new Date(), 14))

  const [specialRequirements, setSpecialRequirements] = useState("")
  const [attachments, setAttachments] = useState<{ name: string }[]>([])

  useEffect(() => {
    if (!editId) return
    async function load() {
      try {
        const res = await fetch(`/api/gigs/${editId}`)
        const j = await res.json()
        if (res.ok && j.data) {
          const g = j.data
          setTitle(g.title || "")
          setCategory(g.category || "")
          setDescription(g.description || "")
          setIsUrgent(g.isUrgent || false)
          setSkills((g.requiredSkills || []).map((s: any) => s.name))
          setExperienceLevel(g.experienceLevel || "INTERMEDIATE")
          setDeliverables(g.deliverables || [""])
          setBudgetKind(g.budgetType?.toLowerCase() === "hourly" ? "hourly" : "fixed")
          setMinBudget(g.minBudget || 0)
          setMaxBudget(g.maxBudget || 0)
          setDuration(g.duration || DURATIONS[2])
          setDeadline(g.deadline ? new Date(g.deadline) : undefined)
          setSpecialRequirements(g.specialRequirements || "")
          setBannerImage(g.bannerImage || "")
        }
      } catch (e) {
        console.error("Failed to load gig for edit", e)
      }
    }
    void load()
  }, [editId])

  const checklist = useMemo(
    () => [
      { label: "Title added", done: title.trim().length > 5 },
      { label: "Category selected", done: !!category },
      { label: "Description written", done: description.trim().length > 20 },
      { label: "Budget set", done: minBudget > 0 && maxBudget >= minBudget },
      { label: "Skills added", done: skills.length > 0 },
      { label: "Deadline set", done: !!deadline },
    ],
    [title, category, description, minBudget, maxBudget, skills.length, deadline]
  )

  const canPublish = checklist.every((c) => c.done)
  const previewBudget =
    budgetKind === "fixed"
      ? formatCurrencyRange(minBudget, maxBudget)
      : formatHourlyRange(minBudget, maxBudget)

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) setSkills((x) => [...x, s])
    setSkillInput("")
  }

  const pushDeliverable = () => setDeliverables((d) => [...d, ""])
  const setDel = (i: number, v: string) =>
    setDeliverables((d) => d.map((x, j) => (j === i ? v : x)))
  const removeDel = (i: number) =>
    setDeliverables((d) => d.filter((_, j) => j !== i))

  async function submit(isDraft: boolean) {
    if (isDraft) {
      setLoading("draft")
    } else {
      if (!canPublish) {
        toast.error("Complete all checklist items before publishing.")
        return
      }
      setLoading("publish")
    }

    try {
      const payload = isDraft
        ? {
            isDraft: true as const,
            title: title.trim() || "Untitled gig",
            description: description.trim() || undefined,
            category: category || undefined,
            budgetType: budgetKind === "fixed" ? ("FIXED" as const) : ("HOURLY" as const),
            minBudget,
            maxBudget,
            currency: "INR",
            deadline: deadline?.toISOString() ?? null,
            experienceLevel,
            requiredSkills: skills.length ? skills : undefined,
            duration: duration || undefined,
            isUrgent,
            specialRequirements: specialRequirements.trim() || undefined,
            deliverables: deliverables.map((x) => x.trim()).filter(Boolean),
            bannerImage: bannerImage || undefined,
          }
        : {
            title: title.trim(),
            description: description.trim(),
            category,
            budgetType: budgetKind === "fixed" ? "FIXED" : "HOURLY",
            minBudget,
            maxBudget,
            currency: "INR",
            deadline: deadline!.toISOString(),
            experienceLevel,
            requiredSkills: skills,
            duration,
            isUrgent,
            specialRequirements: specialRequirements.trim() || undefined,
            deliverables: deliverables.map((x) => x.trim()).filter(Boolean),
            bannerImage: bannerImage || undefined,
          }

      const res = await fetch(editId ? `/api/gigs/${editId}` : "/api/gigs", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const text = await res.text()
      let j: { data?: unknown; error?: string; details?: unknown } = {}
      if (text) {
        try {
          j = JSON.parse(text) as typeof j
        } catch {
          j = { error: text.slice(0, 300) || `Server error (${res.status})` }
        }
      } else if (!res.ok) {
        j = { error: `Server error (${res.status})` }
      }
      if (!res.ok) {
        toast.error(j.error ?? "Could not save gig")
        return
      }

      void qc.invalidateQueries({ queryKey: qk.businessMyGigs() })
      void qc.invalidateQueries({ queryKey: qk.businessDashboard() })
      void qc.invalidateQueries({ queryKey: qk.gigs() })

      if (isDraft) {
        toast.success("Draft saved.")
        router.push("/business/my-gigs")
      } else {
        toast.success(editId ? "Gig updated successfully!" : "Your gig is live! Freelancers can now apply.")
        router.push("/business/my-gigs")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading("idle")
    }
  }

  return (
    <div className="post-gig-wizard-page mx-auto max-w-6xl pb-24">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/business/my-gigs"
            className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-[#0f172a] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="text-2xl font-bold text-[#0f172a]">
            {editId ? "Edit gig" : "Post a new gig"}
          </h1>
          <p className="text-[12px] text-[#64748b]">
            Multi-step flow — preview updates as you type.
          </p>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {STEP_LABELS.map((label, idx) => {
            const n = idx + 1
            const done = step > n
            const active = step === n
            return (
              <div key={label} className="flex min-w-0 flex-1 items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                      done && "bg-[#0f172a] text-white",
                      active && !done && "bg-[#6d9c9f] text-white",
                      !active && !done && "border border-[#e2e8f0] bg-white text-[#94a3b8]"
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : n}
                  </div>
                  <span
                    className={cn(
                      "hidden text-center text-[11px] font-semibold sm:block",
                      active ? "text-[#0f172a]" : "text-[#94a3b8]"
                    )}
                  >
                    {label}
                  </span>
                </div>
                {idx < STEP_LABELS.length - 1 && (
                  <div
                    className={cn(
                      "mx-1 h-px min-w-[12px] flex-1 border-t",
                      step > n ? "border-[#6d9c9f]" : "border-[#e2e8f0]"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,34%)]">
        <div
          className="min-h-[600px] space-y-6 rounded-2xl border border-[#e2e8f0] bg-white p-8 shadow-sm"
          style={{ padding: 32 }}
        >
          {step === 1 && (
            <section className="space-y-5">
              <h2 className="text-[16px] font-bold text-[#0f172a]">Gig basics</h2>
              <div>
                <label className={LABEL}>Gig Title *</label>
                <input
                  className={cn(INPUT, "mt-1.5")}
                  value={title}
                  maxLength={80}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior React Developer needed for e-commerce project"
                />
                <p className="mt-1 text-right text-[11px] text-[#94a3b8]">
                  {title.length}/80
                </p>
              </div>
              <div>
                <label className={LABEL}>Category *</label>
                <select
                  className={cn(INPUT, "mt-1.5")}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL}>Description *</label>
                <textarea
                  className={cn(TEXTAREA, "mt-1.5")}
                  value={description}
                  maxLength={2000}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you need, expectations, and deliverables..."
                />
                <p className="mt-1 text-right text-[11px] text-[#94a3b8]">
                  {description.length}/2000
                </p>
              </div>
              <div>
                <label className={LABEL}>Preview banner image</label>
                <div className="relative mt-2 h-32 overflow-hidden rounded-[12px] border border-dashed border-[#cbd5f5] bg-[#f4f6fb]">
                  {bannerImage ? (
                    <Image
                      src={bannerImage}
                      alt="Gig banner preview"
                      fill
                      className="object-cover"
                      sizes="(min-width:1024px) 100vw, 100vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[13px] font-semibold text-[#6d9c9f]">
                      Upload a banner for the live preview card
                    </div>
                  )}
                  <UploadButton
                    endpoint="gigBanner"
                    onClientUploadComplete={(res) => {
                      const url = res?.[0]?.url
                      if (!url) return
                      setBannerImage(url)

                      // Persist immediately for existing gigs so Browse/Landing reflects it
                      // even if the user forgets to click "Save" in the wizard.
                      if (editId) {
                        void fetch(`/api/gigs/${editId}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ bannerImage: url }),
                        })
                          .then(async (r) => {
                            if (!r.ok) {
                              const t = await r.text().catch(() => "")
                              throw new Error(t || `Failed to save banner (${r.status})`)
                            }
                            void qc.invalidateQueries({ queryKey: qk.businessMyGigs() })
                            void qc.invalidateQueries({ queryKey: qk.gigs() })
                          })
                          .catch((e) => {
                            console.error("Failed to persist gig banner", e)
                            toast.error("Banner uploaded, but couldn't save it to the gig. Click Save to retry.")
                          })
                      }
                    }}
                    onUploadError={(error) => { toast.error(error.message) }}
                    className="absolute inset-0"
                  />
                  {bannerImage && (
                    <button
                      type="button"
                      onClick={() => setBannerImage("")}
                      className="absolute top-2 right-2 rounded-full bg-white/80 p-1 text-[#0f172a] shadow"
                      aria-label="Remove banner"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-[#94a3b8]">
                  JPG/PNG up to 8MB · Recommended 1280×720
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-[8px] border border-[#e2e8f0] p-4">
                <div>
                  <p className={LABEL}>Mark as Urgent?</p>
                  <p className="mt-1 text-[12px] text-[#64748b]">
                    Urgent gigs get 3x more visibility
                  </p>
                </div>
                <Switch
                  checked={isUrgent}
                  onCheckedChange={setIsUrgent}
                  className="data-[state=checked]:bg-[#6d9c9f]"
                />
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-5">
              <h2 className="text-[16px] font-bold text-[#0f172a]">Requirements</h2>
              <div>
                <label className={LABEL}>Skills Required *</label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSkills(skills.filter((x) => x !== s))}
                      className="inline-flex items-center gap-1 rounded-full bg-[#e8f4f5] px-3 py-1 text-[12px] font-semibold text-[#2d7a7e]"
                    >
                      {s} <X className="h-3 w-3" />
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    className={INPUT}
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addSkill()
                      }
                    }}
                    placeholder="Type a skill, press Enter"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-[42px] shrink-0 rounded-[8px] border-[#e2e8f0]"
                    onClick={addSkill}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <label className={LABEL}>Experience Level *</label>
                <div className="mt-2 grid gap-3 sm:grid-cols-3">
                  {(
                    [
                      ["BEGINNER", "Beginner"],
                      ["INTERMEDIATE", "Intermediate"],
                      ["EXPERT", "Expert"],
                    ] as const
                  ).map(([val, lab]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setExperienceLevel(val)}
                      className={cn(
                        "rounded-[8px] border p-4 text-left text-[13px] font-semibold transition-all",
                        experienceLevel === val
                          ? "border-[#6d9c9f] bg-[#e8f4f5] text-[#0f172a]"
                          : "border-[#e2e8f0] bg-white text-[#0f172a]"
                      )}
                    >
                      {lab}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={LABEL}>What do you expect to receive?</label>
                <div className="mt-2 space-y-2">
                  {deliverables.map((line, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        className={INPUT}
                        value={line}
                        onChange={(e) => setDel(i, e.target.value)}
                        placeholder={`Deliverable ${i + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => removeDel(i)}
                        disabled={deliverables.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 text-[#64748b]" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-[8px]"
                    onClick={pushDeliverable}
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add item
                  </Button>
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-5">
              <h2 className="text-[16px] font-bold text-[#0f172a]">Budget &amp; timeline</h2>
              <div>
                <label className={LABEL}>Budget Type</label>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      ["fixed", "Fixed Price"],
                      ["hourly", "Hourly Rate"],
                    ] as const
                  ).map(([id, lab]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setBudgetKind(id)}
                      className={cn(
                        "rounded-[8px] border p-4 text-left text-[13px] font-semibold",
                        budgetKind === id
                          ? "border-[#6d9c9f] bg-[#e8f4f5]"
                          : "border-[#e2e8f0] bg-white"
                      )}
                    >
                      {lab}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={LABEL}>
                  {budgetKind === "fixed" ? "Budget Range *" : "Hourly range *"}
                </label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[12px] text-[#64748b]">
                      Min {budgetKind === "fixed" ? "(₹)" : "(₹/hr)"}
                    </span>
                    <input
                      type="number"
                      className={cn(INPUT, "mt-1")}
                      min={0}
                      value={minBudget}
                      onChange={(e) => setMinBudget(Number(e.target.value))}
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <span className="text-[12px] text-[#64748b]">
                      Max {budgetKind === "fixed" ? "(₹)" : "(₹/hr)"}
                    </span>
                    <input
                      type="number"
                      className={cn(INPUT, "mt-1")}
                      min={0}
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(Number(e.target.value))}
                      placeholder="50000"
                    />
                  </div>
                </div>
                <p className="mt-1 text-[12px] text-[#64748b]">
                  Suggested range for {category || "this category"}:{" "}
                  {suggestedRange(category || "Default")}
                </p>
              </div>
              <div>
                <label className={LABEL}>Project Duration *</label>
                <select
                  className={cn(INPUT, "mt-1.5")}
                  value={duration}
                  onChange={(e) =>
                    setDuration(e.target.value as (typeof DURATIONS)[number])
                  }
                >
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL}>Application Deadline *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        INPUT,
                        "mt-1.5 flex items-center justify-start text-left"
                      )}
                    >
                      {deadline ? format(deadline, "PPP") : "Pick a date"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deadline}
                      onSelect={setDeadline}
                      disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="space-y-5">
              <h2 className="text-[16px] font-bold text-[#0f172a]">Additional details</h2>
              <button
                type="button"
                onClick={() =>
                  setAttachments((a) => [...a, { name: `file-${a.length + 1}.pdf` }])
                }
                className="flex w-full flex-col items-center justify-center rounded-[8px] border-2 border-dashed border-[#6d9c9f]/40 bg-[#f8fafc] py-10"
              >
                <Upload className="mb-2 h-8 w-8 text-[#6d9c9f]" />
                <p className="text-[13px] font-semibold text-[#0f172a]">
                  Drag &amp; drop (demo)
                </p>
                <p className="text-[12px] text-[#64748b]">Click to add a placeholder file</p>
              </button>
              <ul className="space-y-2">
                {attachments.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-[8px] border border-[#e2e8f0] px-3 py-2 text-[13px] text-[#0f172a]"
                  >
                    {f.name}
                    <button
                      type="button"
                      onClick={() => setAttachments((a) => a.filter((_, j) => j !== i))}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <div>
                <label className={LABEL}>Special requirements (optional)</label>
                <textarea
                  className={cn(TEXTAREA, "mt-1.5 min-h-[100px]")}
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  placeholder="Anything else freelancers should know..."
                />
              </div>
            </section>
          )}

          {step === 5 && (
            <section className="space-y-4">
              <h2 className="text-[16px] font-bold text-[#0f172a]">Review</h2>
              <ReviewBlock
                title="Basics"
                onEdit={() => setStep(1)}
                rows={[
                  ["Title", title || "—"],
                  ["Category", category || "—"],
                  ["Urgent", isUrgent ? "Yes" : "No"],
                  ["Description", description.slice(0, 240) + (description.length > 240 ? "…" : "")],
                ]}
              />
              <ReviewBlock
                title="Requirements"
                onEdit={() => setStep(2)}
                rows={[
                  ["Skills", skills.join(", ") || "—"],
                  ["Experience", experienceLevel],
                  [
                    "Deliverables",
                    deliverables.filter(Boolean).join("; ") || "—",
                  ],
                ]}
              />
              <ReviewBlock
                title="Budget & timeline"
                onEdit={() => setStep(3)}
                rows={[
                  ["Type", budgetKind === "fixed" ? "Fixed" : "Hourly"],
                  ["Range", previewBudget],
                  ["Duration", duration],
                  ["Deadline", deadline ? format(deadline, "PPP") : "—"],
                ]}
              />
              <ReviewBlock
                title="More"
                onEdit={() => setStep(4)}
                rows={[["Notes", specialRequirements || "—"]]}
              />
            </section>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e2e8f0] pt-6">
            <Button
              type="button"
              variant="outline"
              disabled={step === 1 || loading !== "idle"}
              className="h-[42px] min-w-[100px] rounded-[8px] border-[#e2e8f0] text-[14px] font-semibold"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {step < 5 ? (
              <Button
                type="button"
                className="h-[42px] rounded-[8px] bg-gradient-to-r from-[#6d9c9f] to-[#2d7a7e] px-6 text-[14px] font-semibold text-white"
                onClick={() => setStep((s) => Math.min(5, s + 1))}
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={!canPublish || loading !== "idle"}
                title={!canPublish ? "Complete all checklist items" : undefined}
                className="h-[42px] rounded-[8px] bg-gradient-to-r from-[#6d9c9f] to-[#2d7a7e] px-6 text-[14px] font-semibold text-white disabled:opacity-50"
                onClick={() => void submit(false)}
              >
                {loading === "publish" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {editId ? "Updating…" : "Publishing…"}
                  </>
                ) : (
                  editId ? "Update Gig" : "Publish Gig"
                )}
              </Button>
            )}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#64748b]">
            Live preview
          </p>
          <div className="overflow-hidden rounded-[12px] border border-[#e2e8f0] bg-white shadow-md">
            <div className="relative h-[120px]">
              {bannerImage ? (
                <Image
                  src={bannerImage}
                  alt="Live preview banner"
                  fill
                  className="object-cover"
                  sizes="(min-width:1024px) 100vw, 100vw"
                />
              ) : (
                <div className="h-full bg-gradient-to-br from-[#6d9c9f] to-[#2d7a7e]" />
              )}
            </div>
            <div className="space-y-3 p-4">
              {isUrgent && (
                <span
                  className="inline-block rounded-[6px] px-2 py-0.5 text-[11px] font-bold"
                  style={{
                    background: "#fef2f2",
                    color: "#dc2626",
                  }}
                >
                  URGENT
                </span>
              )}
              <h4
                className={cn(
                  "text-lg font-bold",
                  title ? "text-[#0f172a]" : "text-[#94a3b8]"
                )}
              >
                {title || "Your Gig Title"}
              </h4>
              <p className="text-xs font-medium text-[#64748b]">
                {category || "Category"}
              </p>
              <p className="font-mono text-base font-semibold" style={{ color: TEAL }}>
                {previewBudget}
              </p>
              <div className="flex flex-wrap gap-1">
                {skills.length ? (
                  skills.slice(0, 8).map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-[#e8f4f5] px-2 py-0.5 text-[10px] font-semibold text-[#2d7a7e]"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-[#94a3b8]">Add skills above</span>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[12px] border border-[#e2e8f0] bg-white p-4">
            <h4 className="mb-3 text-[14px] font-bold text-[#0f172a]">Checklist</h4>
            <ul className="space-y-2">
              {checklist.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-[13px] text-[#0f172a]">
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px]",
                      c.done ? "border-[#22c55e] bg-[#22c55e] text-white" : "border-[#e2e8f0]"
                    )}
                  >
                    {c.done ? <Check className="h-3 w-3" /> : ""}
                  </span>
                  {c.label}
                </li>
              ))}
            </ul>
            <Button
              type="button"
              disabled={!canPublish || loading !== "idle"}
              className="mt-4 h-[52px] w-full rounded-[8px] bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-[14px] font-semibold text-white disabled:opacity-50"
              onClick={() => void submit(false)}
            >
              {loading === "publish" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {editId ? "Updating…" : "Publishing…"}
                </>
              ) : (
                editId ? "Update Gig" : "Publish Gig"
              )}
            </Button>
            <button
              type="button"
              disabled={loading !== "idle"}
              className="mt-2 w-full text-center text-[13px] font-semibold text-[#64748b] hover:text-[#0f172a]"
              onClick={() => void submit(true)}
            >
              {loading === "draft" ? "Saving…" : "Save as Draft"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

function ReviewBlock({
  title,
  rows,
  onEdit,
}: {
  title: string
  rows: [string, string][]
  onEdit: () => void
}) {
  return (
    <div className="rounded-[8px] border border-[#e2e8f0] p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-[#0f172a]">{title}</h3>
        <button
          type="button"
          className="text-[12px] font-semibold text-[#6d9c9f] hover:underline"
          onClick={onEdit}
        >
          Edit
        </button>
      </div>
      <dl className="space-y-1 text-[13px]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-2">
            <dt className="w-28 shrink-0 text-[#64748b]">{k}</dt>
            <dd className="text-[#0f172a]">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
