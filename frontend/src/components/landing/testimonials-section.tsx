"use client"

import { useRef, useEffect, useState } from "react"
import { TestimonialCard } from "@/components/testimonial-card"

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "CEO",
    type: "business" as const,
    rating: 5,
    quote: "Contractual transformed how we hire freelancers. The structured gig system makes it easy to find exactly what we need, and the escrow payments give us peace of mind.",
    company: "TechStart Inc.",
  },
  {
    name: "James Rodriguez",
    role: "Full-Stack Developer",
    type: "freelancer" as const,
    rating: 5,
    quote: "I have tripled my income since joining Contractual. The platform connects me with serious clients who value quality work. The contract system protects both parties.",
    company: "React, Node.js",
  },
  {
    name: "Emily Chen",
    role: "Marketing Director",
    type: "business" as const,
    rating: 5,
    quote: "We have completed over 50 projects on Contractual. The quality of freelancers is exceptional, and the review system helps us make informed decisions quickly.",
    company: "GrowthLab Agency",
  },
  {
    name: "Michael Park",
    role: "UI/UX Designer",
    type: "freelancer" as const,
    rating: 5,
    quote: "The best platform for design work. Clients here understand the value of good design and the milestone-based payments keep projects on track.",
    company: "Figma, Sketch",
  },
  {
    name: "Lisa Thompson",
    role: "Startup Founder",
    type: "business" as const,
    rating: 4,
    quote: "As a startup, every hire matters. Contractual helped us build our entire MVP with freelancers. The talent pool is incredible and the process is seamless.",
    company: "LaunchPad.io",
  },
  {
    name: "David Kim",
    role: "Content Writer",
    type: "freelancer" as const,
    rating: 5,
    quote: "Finally a platform that respects writers. The gig structure means clear expectations, fair pay, and clients who appreciate quality content.",
    company: "SEO, Copywriting",
  },
]

export function TestimonialsSection() {
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
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-16 lg:py-20 bg-[var(--bg-alt)]">
      <div className="container-page">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
            What Our Users Say
          </h2>
        </div>

        {/* Testimonials grid - masonry-style */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className={`transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <TestimonialCard {...testimonial} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
