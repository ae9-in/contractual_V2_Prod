"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { FileText, Users, CheckCircle } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Post Your Gig",
    description: "Businesses post detailed gigs with budget, skills needed, and deadline.",
  },
  {
    number: "02",
    icon: Users,
    title: "Review Applications",
    description: "Receive proposals from verified freelancers. Review profiles, ratings, and past work.",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Get It Done",
    description: "Hire, collaborate in real-time, review submissions, and release payment on completion.",
  },
]

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-16 lg:py-24 bg-white overflow-hidden">
      <div className="container-page">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
            How It Works
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line - desktop only */}
          <div className="hidden lg:block absolute top-[60px] left-[calc(16.67%+60px)] right-[calc(16.67%+60px)] h-0.5">
            <svg className="w-full h-full" preserveAspectRatio="none">
              <line
                x1="0"
                y1="50%"
                x2="100%"
                y2="50%"
                stroke="var(--primary)"
                strokeWidth="2"
                strokeDasharray="8 8"
                className={`transition-all duration-1000 ${isVisible ? "opacity-100" : "opacity-0"}`}
              />
            </svg>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`flex flex-col items-center text-center transition-all duration-700 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                {/* Number circle with icon */}
                <div className="relative mb-6">
                  <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-[var(--primary-light)] to-white border-2 border-[var(--primary)] flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-bold text-[var(--primary)]">{step.number}</span>
                      <step.icon className="w-6 h-6 text-[var(--primary-dark)] mt-1" />
                    </div>
                  </div>
                  
                  {/* Decorative ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-[var(--primary)]/20 scale-110" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">
                  {step.title}
                </h3>
                <p className="text-[var(--text-secondary)] max-w-[280px]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-16">
          <Link
            href="/business/post-gig"
            className="px-8 py-3.5 rounded-lg text-base font-semibold text-white bg-gradient-to-r from-[var(--cta-amber)] to-[var(--cta-amber-dark)] hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
          >
            Start Hiring Today
          </Link>
          <Link
            href="/auth/register"
            className="px-8 py-3.5 rounded-lg text-base font-semibold text-[var(--primary)] border-2 border-[var(--primary)] hover:bg-[var(--primary-light)] transition-all duration-300"
          >
            Join as Freelancer
          </Link>
        </div>
      </div>
    </section>
  )
}
