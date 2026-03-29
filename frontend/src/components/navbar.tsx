"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const categories = [
  { icon: "💻", label: "Development" },
  { icon: "🎨", label: "Design" },
  { icon: "✍️", label: "Writing" },
  { icon: "📊", label: "Marketing" },
  { icon: "🎥", label: "Video" },
  { icon: "📱", label: "Social Media" },
  { icon: "🔍", label: "SEO" },
  { icon: "📈", label: "Data & Analytics" },
  { icon: "🤝", label: "Consulting" },
  { icon: "⚙️", label: "DevOps" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/92 backdrop-blur-xl border-b border-[var(--border)] shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
        {/* Main navbar — grid keeps logo, search, and CTAs from colliding */}
        <nav className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-3 lg:h-[72px] lg:gap-6">
          {/* Logo */}
          <Link href="/" className="flex min-w-0 items-center gap-2 justify-self-start">
            <div className="w-8 h-8 shrink-0 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <span
              className={cn(
                "font-display truncate text-lg font-bold transition-colors duration-300 sm:text-xl",
                scrolled ? "text-[var(--text-primary)]" : "text-white"
              )}
            >
              Contractual
            </span>
          </Link>

          {/* Center search — min-w-0 so the field can shrink inside the grid */}
          <div className="hidden min-w-0 justify-self-stretch px-2 lg:block xl:px-8">
            <div className={cn(
              "mx-auto flex w-full max-w-xl rounded-full border overflow-hidden transition-all duration-300",
              scrolled
                ? "bg-white border-[var(--border)]"
                : "bg-white/10 border-white/20 backdrop-blur-sm"
            )}>
              <input
                type="text"
                placeholder="Search for design, development, writing..."
                className={cn(
                  "min-w-0 flex-1 px-4 py-2.5 text-sm bg-transparent outline-none",
                  scrolled
                    ? "text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                    : "text-white placeholder:text-white/60"
                )}
              />
              <button
                type="button"
                className="shrink-0 px-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
            <Link
              href="/business/post-gig"
              className={cn(
                "hidden whitespace-nowrap text-sm font-medium transition-opacity hover:opacity-80 md:block",
                scrolled ? "text-[var(--primary)]" : "text-white"
              )}
            >
              Post a Gig
            </Link>

            <Link href="/auth/register">
              <button
                type="button"
                className="hidden sm:inline-flex px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[var(--cta-amber)] to-[var(--cta-amber-dark)] hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 sm:px-5"
              >
                Join Free
              </button>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn(
                "lg:hidden p-2 rounded-lg transition-colors -mr-1",
                scrolled ? "text-[var(--text-primary)]" : "text-white"
              )}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Category pills — hidden until scroll so the header is a single row on the hero */}
        <div
          className={cn(
            "hidden lg:block -mx-4 overflow-x-auto overflow-y-hidden scrollbar-hide transition-[max-height,opacity,padding] duration-300 ease-out",
            scrolled ? "max-h-16 opacity-100 px-4 pb-3 pt-1" : "max-h-0 opacity-0 pointer-events-none p-0"
          )}
        >
          <div className="flex items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(activeCategory === cat.label ? null : cat.label)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                  activeCategory === cat.label
                    ? "bg-[var(--primary-light)] border border-[var(--primary)] text-[var(--primary-dark)]"
                    : "bg-[var(--bg-alt)] border border-transparent text-[var(--text-secondary)] hover:border-[var(--border)] hover:text-[var(--text-primary)]"
                )}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden fixed inset-x-0 top-16 bg-white border-b border-[var(--border)] shadow-lg transition-all duration-300",
          mobileMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        )}
      >
        <div className="p-4 space-y-4">
          {/* Mobile search */}
          <div className="flex rounded-xl border border-[var(--border)] overflow-hidden">
            <input
              type="text"
              placeholder="Search gigs..."
              className="flex-1 px-4 py-3 text-sm bg-transparent outline-none"
            />
            <button className="px-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white">
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile categories */}
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat.label}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-[var(--bg-alt)] text-[var(--text-secondary)]"
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Mobile actions */}
          <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border)]">
            <Link href="/business/post-gig" className="text-[var(--primary)] font-medium py-2">
              Post a Gig
            </Link>

            <Link href="/auth/register">
              <button className="w-full px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[var(--cta-amber)] to-[var(--cta-amber-dark)]">
                Join Free
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
