"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Grid3X3, List, ChevronDown, X } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { FilterSidebar } from "@/components/gigs/filter-sidebar"
import { GigCard } from "@/components/gig-card"
import { cn } from "@/lib/utils"
import { MOCK_GIGS } from "@/lib/mock-data"

export default function BrowsePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("best-match")
  const [activeFilters, setActiveFilters] = useState<string[]>(["Design", "Development"])
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter))
  }

  return (
    <main className="min-h-screen bg-[var(--bg-alt)]">
      <Navbar />

      <div className="pt-24 lg:pt-28 pb-16">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          <nav className="flex items-center gap-1 text-sm text-[var(--text-secondary)] mb-6">
            <Link href="/" className="hover:text-[var(--primary)]">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[var(--text-primary)]">Browse Gigs</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="hidden lg:block">
              <FilterSidebar />
            </div>

            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl border border-[var(--border)] text-[var(--text-primary)] font-medium"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters
            </button>

            {showMobileFilters && (
              <div className="lg:hidden fixed inset-0 z-50">
                <button
                  type="button"
                  className="absolute inset-0 bg-black/50 w-full h-full border-0 cursor-default"
                  aria-label="Close filters"
                  onClick={() => setShowMobileFilters(false)}
                />
                <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-white overflow-y-auto shadow-xl">
                  <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                    <h2 className="font-semibold text-lg">Filters</h2>
                    <button type="button" onClick={() => setShowMobileFilters(false)}>
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="p-4">
                    <FilterSidebar />
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1">
              <div className="bg-white rounded-xl border border-[var(--border)] p-4 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <p className="text-[var(--text-primary)]">
                    <span className="font-semibold font-mono">{MOCK_GIGS.length}</span> gigs found
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none pl-4 pr-10 py-2 text-sm border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                      >
                        <option value="best-match">Best Match</option>
                        <option value="newest">Newest</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
                    </div>

                    <div className="flex items-center gap-1 p-1 bg-[var(--bg-alt)] rounded-lg">
                      <button
                        type="button"
                        onClick={() => setViewMode("grid")}
                        className={cn(
                          "p-2 rounded-md transition-colors",
                          viewMode === "grid"
                            ? "bg-white text-[var(--primary)] shadow-sm"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        )}
                        aria-label="Grid view"
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("list")}
                        className={cn(
                          "p-2 rounded-md transition-colors",
                          viewMode === "list"
                            ? "bg-white text-[var(--primary)] shadow-sm"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        )}
                        aria-label="List view"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {activeFilters.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[var(--border)]">
                    {activeFilters.map((filter) => (
                      <span
                        key={filter}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary-light)] text-[var(--primary-dark)] text-sm font-medium rounded-full"
                      >
                        {filter}
                        <button
                          type="button"
                          onClick={() => removeFilter(filter)}
                          className="hover:bg-[var(--primary)]/20 rounded-full p-0.5"
                          aria-label={`Remove ${filter}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => setActiveFilters([])}
                      className="text-sm text-[var(--primary)] hover:text-[var(--primary-dark)] font-medium"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              <div
                className={cn(
                  "grid gap-5",
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1"
                )}
              >
                {MOCK_GIGS.map((gig) => (
                  <GigCard key={gig.id} {...gig} />
                ))}
              </div>

              <div className="flex justify-center mt-12">
                <button
                  type="button"
                  className="px-8 py-3 rounded-lg text-base font-semibold text-[var(--primary)] border-2 border-[var(--primary)] hover:bg-[var(--primary-light)] transition-all duration-300 btn-premium"
                >
                  Load More Gigs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
