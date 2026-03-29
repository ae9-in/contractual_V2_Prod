"use client"

import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { GigCard } from "@/components/gig-card"
import { cn } from "@/lib/utils"
import { MOCK_GIGS } from "@/lib/mock-data"

const filters = ["All", "Design", "Development", "Writing"]

export function TopGigsSection() {
  const [activeFilter, setActiveFilter] = useState("All")
  const scrollRef = useRef<HTMLDivElement>(null)

  const pool = MOCK_GIGS.slice(0, 8)

  const filteredGigs =
    activeFilter === "All" ? pool : pool.filter((gig) => gig.category === activeFilter)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <section className="py-16 lg:py-20">
      <div className="container-page">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
            Top Gigs This Week
          </h2>

          <div className="flex items-center gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  activeFilter === filter
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--bg-alt)] text-[var(--text-secondary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary-dark)]"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="relative group">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white border border-[var(--border)] shadow-lg flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
          >
            {filteredGigs.map((gig) => (
              <GigCard key={gig.id} {...gig} />
            ))}
          </div>

          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white border border-[var(--border)] shadow-lg flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center mt-8">
          <a
            href="/browse"
            className="text-[var(--primary)] font-semibold hover:text-[var(--primary-dark)] transition-colors"
          >
            Browse All Gigs &rarr;
          </a>
        </div>
      </div>
    </section>
  )
}
