"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterSidebarProps {
  onFilterChange?: (filters: Record<string, unknown>) => void
}

const fallbackCategories = [
  { name: "Development", count: 1284 },
  { name: "Design", count: 892 },
  { name: "Writing", count: 756 },
  { name: "Marketing", count: 634 },
  { name: "Video", count: 423 },
  { name: "SEO", count: 345 },
  { name: "Data", count: 289 },
  { name: "Consulting", count: 198 },
]

const deliveryTimes = [
  { label: "Any", value: "any" },
  { label: "Within 24hrs", value: "within1" },
  { label: "3 Days", value: "within3" },
  { label: "7 Days", value: "within7" },
  { label: "14 Days+", value: "within14" },
]

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  EXPERT: "Expert",
}

const fallbackLevels = Object.keys(LEVEL_LABEL).map((name) => ({ name, count: 0 }))

const gigStatuses = ["Open", "Accepting Applications", "Urgent"]

export function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [facetLoading, setFacetLoading] = useState(true)
  const [facetError, setFacetError] = useState<string | null>(null)
  const [facetCategories, setFacetCategories] = useState<{ name: string; count: number }[]>([])
  const [facetLevels, setFacetLevels] = useState<{ name: string; count: number }[]>([])

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [budgetMin, setBudgetMin] = useState("")
  const [budgetMax, setBudgetMax] = useState("")
  const [selectedDelivery, setSelectedDelivery] = useState("any")
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["Open"])
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    budget: true,
    delivery: true,
    level: false,
    status: true,
  })
  const [showAllCategories, setShowAllCategories] = useState(false)

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const toggleLevel = (level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    )
  }

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    )
  }

  const clearAll = () => {
    setSelectedCategories([])
    setBudgetMin("")
    setBudgetMax("")
    setSelectedDelivery("any")
    setSelectedLevels([])
    setSelectedStatuses(["Open"])
    onFilterChange?.({})
  }

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await fetch("/api/gigs/facets", { cache: "no-store" })
        const json = (await res.json()) as {
          data?: {
            categories?: { name: string; count: number }[]
            experienceLevels?: { name: string; count: number }[]
          }
          error?: string
        }
        if (!res.ok) throw new Error(json.error ?? "Failed to load filters")
        if (!active) return
        setFacetCategories(Array.isArray(json.data?.categories) ? json.data!.categories! : [])
        setFacetLevels(Array.isArray(json.data?.experienceLevels) ? json.data!.experienceLevels! : [])
        setFacetError(null)
      } catch (e) {
        if (!active) return
        setFacetError(e instanceof Error ? e.message : "Failed to load filters")
      } finally {
        if (active) setFacetLoading(false)
      }
    }

    void load()
    const interval = setInterval(() => void load(), 15000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  const categories = facetError ? fallbackCategories : facetCategories
  const experienceLevels = facetError ? fallbackLevels : (facetLevels.length ? facetLevels : fallbackLevels)

  const displayedCategories = showAllCategories ? categories : categories.slice(0, 5)

  const presets = useMemo(
    () => [
      { label: "₹0-₹500", min: 0, max: 500 },
      { label: "₹500-₹2K", min: 500, max: 2000 },
      { label: "₹2K+", min: 2000, max: undefined as number | undefined },
    ],
    []
  )

  const applyFilters = () => {
    const urgent = selectedStatuses.includes("Urgent")
    const filters: Record<string, unknown> = {
      category: selectedCategories.length ? selectedCategories.join(",") : undefined,
      minBudget: budgetMin ? Number(budgetMin) : undefined,
      maxBudget: budgetMax ? Number(budgetMax) : undefined,
      deadline: selectedDelivery !== "any" ? selectedDelivery : undefined,
      experienceLevel: selectedLevels.length ? selectedLevels.join(",") : undefined,
      urgent: urgent ? "true" : undefined,
    }
    onFilterChange?.(filters)
  }

  return (
    <aside className="w-full lg:w-[260px] shrink-0">
      <div className="sticky top-24 bg-white rounded-2xl border border-[var(--border)] p-5 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Filters</h3>
          <button
            onClick={clearAll}
            className="text-sm text-[var(--primary)] hover:text-[var(--primary-dark)] font-medium"
          >
            Clear All
          </button>
        </div>

        <hr className="border-[var(--border)]" />

        {/* Category Filter */}
        <FilterSection
          title="Category"
          expanded={expandedSections.category}
          onToggle={() => toggleSection("category")}
        >
          <div className="space-y-3">
            {displayedCategories.map((cat) => (
              <label
                key={cat.name}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.name)}
                  onChange={() => toggleCategory(cat.name)}
                  className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] accent-[var(--primary)]"
                />
                <span className="text-sm text-[var(--text-primary)] group-hover:text-[var(--primary)]">
                  {cat.name}
                </span>
                {!facetLoading && !facetError && (
                  <span className="text-xs text-[var(--text-secondary)] ml-auto">
                    ({cat.count})
                  </span>
                )}
              </label>
            ))}
            {categories.length > 5 && (
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="text-sm text-[var(--primary)] hover:text-[var(--primary-dark)] font-medium"
              >
                {showAllCategories ? "Show less" : "Show more +"}
              </button>
            )}
          </div>
        </FilterSection>

        {/* Budget Range */}
        <FilterSection
          title="Budget Range"
          expanded={expandedSections.budget}
          onToggle={() => toggleSection("budget")}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
              <span className="text-[var(--text-secondary)]">-</span>
              <input
                type="number"
                placeholder="Max"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {["₹0-₹500", "₹500-₹2K", "₹2K+"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    const s = String(preset)
                    if (s.includes("+")) {
                      setBudgetMin("2000")
                      setBudgetMax("")
                      return
                    }
                    const [a, b] = s.split("-")
                    const min = (a ?? "").replace(/[^\d]/g, "")
                    const max = (b ?? "").replace(/[^\d]/g, "")
                    if (min) setBudgetMin(min)
                    if (max) setBudgetMax(max)
                  }}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-full transition-all",
                    budgetMin === preset.split("-")[0]?.replace("$", "")
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--bg-alt)] text-[var(--text-secondary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary-dark)]"
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </FilterSection>

        {/* Delivery Time */}
        <FilterSection
          title="Delivery Time"
          expanded={expandedSections.delivery}
          onToggle={() => toggleSection("delivery")}
        >
          <div className="space-y-3">
            {deliveryTimes.map((time) => (
              <label
                key={time.value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="delivery"
                  value={time.value}
                  checked={selectedDelivery === time.value}
                  onChange={() => setSelectedDelivery(time.value)}
                  className="w-4 h-4 border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] accent-[var(--primary)]"
                />
                <span className="text-sm text-[var(--text-primary)] group-hover:text-[var(--primary)]">
                  {time.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Skill Level */}
        <FilterSection
          title="Skill Level"
          expanded={expandedSections.level}
          onToggle={() => toggleSection("level")}
        >
          <div className="space-y-3">
            {experienceLevels.map((level) => (
              <label
                key={level.name}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedLevels.includes(level.name)}
                  onChange={() => toggleLevel(level.name)}
                  className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] accent-[var(--primary)]"
                />
                <span className="text-sm text-[var(--text-primary)] group-hover:text-[var(--primary)]">
                  {LEVEL_LABEL[level.name] ?? level.name}
                </span>
                {!facetLoading && !facetError && (
                  <span className="text-xs text-[var(--text-secondary)] ml-auto">
                    ({level.count})
                  </span>
                )}
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Gig Status */}
        <FilterSection
          title="Gig Status"
          expanded={expandedSections.status}
          onToggle={() => toggleSection("status")}
        >
          <div className="flex flex-wrap gap-2">
            {gigStatuses.map((status) => (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full transition-all",
                  selectedStatuses.includes(status)
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--bg-alt)] text-[var(--text-secondary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary-dark)]"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Apply button */}
        <button
          type="button"
          onClick={applyFilters}
          className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--shadow-teal)] transition-all duration-300"
        >
          Apply Filters
        </button>
      </div>
    </aside>
  )
}

interface FilterSectionProps {
  title: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function FilterSection({ title, expanded, onToggle, children }: FilterSectionProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left"
      >
        <h4 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h4>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-[var(--text-secondary)]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
        )}
      </button>
      {expanded && <div className="mt-4">{children}</div>}
    </div>
  )
}
