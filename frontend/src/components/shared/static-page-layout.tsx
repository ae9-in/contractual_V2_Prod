import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { motion } from "framer-motion"
import { CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"

interface StaticPageProps {
  heroTitle: string
  content: string
  items?: string[]
  ctaText?: string
  ctaLink?: string
  sections?: { title: string; items: string[] }[]
}

export default function StaticPage({ heroTitle, content, items, ctaText, ctaLink, sections }: StaticPageProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-alt)]">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative bg-[var(--dark-surface)] pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#2d7a7e]/20 to-[#0f3460] opacity-50" />
          <div className="pointer-events-none absolute inset-0 noise-overlay opacity-[0.03]" />
          
          <div className="container-page relative z-10">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-8 tracking-tight">
                {heroTitle}
              </h1>
              <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-2xl font-medium">
                {content}
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20 lg:py-24">
          <div className="container-page">
            <div className="max-w-4xl">
              {items && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[var(--border)] shadow-sm">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-[var(--primary)]" />
                      </div>
                      <span className="text-lg font-medium text-[var(--text-primary)]">{item}</span>
                    </div>
                  ))}
                </div>
              )}

              {sections && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                  {sections.map((section, i) => (
                    <div key={i} className="group p-8 rounded-[24px] border border-[var(--border)] bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-[var(--primary)]/20">
                      <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6 font-display">{section.title}</h3>
                      <ul className="space-y-4">
                        {section.items.map((item, j) => (
                          <li key={j} className="text-[var(--text-secondary)] text-lg flex items-start gap-3">
                             <div className="mt-2 w-2 h-2 rounded-full bg-[var(--primary)] shrink-0" />
                             {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {ctaText && (
                <div className="mt-12">
                  <Link
                    href={ctaLink || "/"}
                    className="btn-primary inline-flex items-center gap-3 !px-10 !py-5 text-xl font-bold shadow-2xl shadow-teal-500/20"
                  >
                    {ctaText}
                    <ArrowRight className="w-6 h-6" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
