"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Star,
  Briefcase,
  Clock,
  Calendar,
  MessageSquare,
  UserPlus,
  Share2,
  MapPin,
  Globe,
  Award,
  Zap,
  CheckCircle,
  TrendingUp,
  Shield,
  ExternalLink,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import type { MockFreelancer } from "@/lib/mock-data"
import { MOCK_GIGS } from "@/lib/mock-data"

const badges = [
  { name: "Top Rated", icon: Star, description: "Top freelancers" },
  { name: "Fast Responder", icon: Zap, description: "Quick replies" },
  { name: "Perfect Score", icon: CheckCircle, description: "High ratings" },
  { name: "Rising Talent", icon: TrendingUp, description: "Growing profile" },
  { name: "Verified", icon: Shield, description: "Identity verified" },
  { name: "Pro Member", icon: Award, description: "Premium" },
]

export function FreelancerProfileView({ f }: { f: MockFreelancer }) {
  const [showFullBio, setShowFullBio] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const activeGigs = MOCK_GIGS.slice(0, 2)

  return (
    <main className="min-h-screen bg-[var(--bg-alt)]">
      <Navbar />

      <div className="relative h-[220px] overflow-hidden">
        <Image
          src={f.bannerImage}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-[var(--gradient-hero)] opacity-80" />
        <div className="absolute inset-0 noise-overlay pointer-events-none" />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 lg:px-6 -mt-20 relative z-10 pb-16">
        <div className="bg-white rounded-2xl border border-[var(--border)] shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative">
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                {f.avatar ? (
                  <Image src={f.avatar} alt="" fill className="object-cover" sizes="128px" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center text-white text-3xl font-semibold">
                    {f.name?.charAt(0) || "F"}
                  </div>
                )}
              </div>
              {f.online && (
                <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-4 border-white">
                  <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2 flex-wrap">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                  {f.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--primary-light)] text-[var(--primary-dark)] text-sm font-medium rounded-full w-fit">
                  <Star className="w-4 h-4 fill-current" /> {f.level}
                </span>
              </div>
              <p className="text-[var(--text-secondary)] mb-4">{f.headline}</p>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    f.online ? "bg-green-500" : "bg-gray-300"
                  )}
                />
                {f.online ? "Online now" : "Away"}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3 flex-wrap">
              <button
                type="button"
                className="px-6 py-3 rounded-lg text-base font-semibold text-white bg-gradient-to-r from-[var(--cta-amber)] to-[var(--cta-amber-dark)] hover:scale-[1.02] transition-all btn-premium"
              >
                Hire Me
              </button>
              <button
                type="button"
                className="px-6 py-3 rounded-lg text-base font-semibold text-white bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] hover:scale-[1.02] transition-all flex items-center gap-2 btn-premium"
              >
                <MessageSquare className="w-5 h-5" /> Message
              </button>
              <button
                type="button"
                onClick={() => setIsFollowing(!isFollowing)}
                className={cn(
                  "px-4 py-3 rounded-lg text-base font-semibold border-2 transition-all flex items-center gap-2",
                  isFollowing
                    ? "bg-[var(--primary-light)] border-[var(--primary)] text-[var(--primary-dark)]"
                    : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                )}
              >
                <UserPlus className="w-5 h-5" />
                {isFollowing ? "Following" : "Follow"}
              </button>
              <button
                type="button"
                className="p-3 rounded-lg border-2 border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all"
                aria-label="Share profile"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[var(--border)]">
            {[
              { icon: Star, value: f.rating.toFixed(1), label: "Rating", color: "text-amber-500" },
              {
                icon: Briefcase,
                value: String(f.jobsCompleted),
                label: "Jobs Done",
                color: "text-[var(--primary)]",
              },
              {
                icon: Clock,
                value: `< ${f.responseHours}hr`,
                label: "Response",
                color: "text-green-500",
              },
              { icon: Calendar, value: "2 yrs", label: "Member", color: "text-blue-500" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <stat.icon className={cn("w-5 h-5 shrink-0", stat.color)} />
                <div>
                  <p className="font-bold font-mono text-[var(--text-primary)]">{stat.value}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 mt-6 md:hidden">
            <button
              type="button"
              className="w-full px-6 py-3 rounded-lg text-base font-semibold text-white bg-gradient-to-r from-[var(--cta-amber)] to-[var(--cta-amber-dark)]"
            >
              Hire Me
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 px-4 py-3 rounded-lg text-base font-semibold text-white bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" /> Message
              </button>
              <button
                type="button"
                onClick={() => setIsFollowing(!isFollowing)}
                className="px-4 py-3 rounded-lg border-2 border-[var(--border)] text-[var(--text-secondary)]"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 lg:max-w-[65%] space-y-6">
            <div className="bg-white rounded-xl border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">About Me</h2>
              <div
                className={cn(
                  "text-[var(--text-primary)] leading-relaxed",
                  !showFullBio && "line-clamp-4"
                )}
              >
                <p>{f.bio}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowFullBio(!showFullBio)}
                className="mt-3 text-[var(--primary)] font-medium hover:text-[var(--primary-dark)]"
              >
                {showFullBio ? "Show Less" : "Show More"}
              </button>
            </div>

            <div className="bg-white rounded-xl border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Skills & Expertise
              </h2>
              <div className="flex flex-wrap gap-2">
                {f.skills.map((skill) => (
                  <span
                    key={skill.name}
                    className="px-4 py-2 bg-[var(--primary-light)] text-[var(--primary-dark)] text-sm font-medium rounded-full border border-[#b0d4d6]"
                  >
                    {skill.name}{" "}
                    <span className="text-[var(--primary)]/70">({skill.level})</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Portfolio</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {f.portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer"
                  >
                    <Image src={item.image} alt="" fill className="object-cover" sizes="200px" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white/90 text-[var(--text-primary)] text-sm font-medium rounded-lg flex items-center gap-2">
                        View Project <ExternalLink className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Experience</h2>
              <div className="relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-[var(--primary-light)]" />
                <div className="space-y-6">
                  {f.experience.map((exp) => (
                    <div key={exp.title + exp.period} className="relative pl-8">
                      <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-[var(--primary)] border-4 border-[var(--primary-light)]" />
                      <div className="bg-[var(--bg-alt)] rounded-xl p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                          <h3 className="font-semibold text-[var(--text-primary)]">{exp.title}</h3>
                          <span className="text-sm text-[var(--text-secondary)]">{exp.period}</span>
                        </div>
                        <p className="text-sm text-[var(--primary)] font-medium mb-2">{exp.company}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Certifications</h2>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {f.certifications.map((cert) => (
                  <div
                    key={cert.name}
                    className="flex-shrink-0 w-[200px] p-4 bg-white rounded-xl border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center mb-3">
                      <Shield className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <h3 className="font-semibold text-[var(--text-primary)] text-sm mb-1">{cert.name}</h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {cert.issuer} • {cert.date}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Reviews Received</h2>
              <div className="flex items-center gap-6 mb-8 pb-6 border-b border-[var(--border)]">
                <div className="text-center">
                  <p className="text-4xl font-bold font-mono text-[var(--primary)]">
                    {f.rating.toFixed(1)}
                  </p>
                  <div className="flex items-center gap-0.5 mt-1 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {f.reviewCount} reviews
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                {f.reviews.map((review, idx) => (
                  <div
                    key={`${review.name}-${idx}`}
                    className="pb-6 border-b border-[var(--border)] last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                        {review.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--text-primary)]">{review.name}</p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {review.company} • {review.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-3.5 h-3.5",
                              i < review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "fill-gray-200 text-gray-200"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-[var(--text-primary)] leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:w-[35%] space-y-6">
            <div className="bg-white rounded-xl border border-[var(--border)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-600 font-semibold">Available for Work</span>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-1">Hourly Rate</p>
                  <p className="text-2xl font-bold font-mono text-[var(--primary)]">${f.hourlyRate}/hr</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-1">Fixed Price Projects</p>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">From ₹500</p>
                </div>
                <hr className="border-[var(--border)]" />
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                    <span className="text-[var(--text-primary)]">English (Native)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                    <span className="text-[var(--text-primary)]">Remote · Global</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[var(--border)] p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Active Gigs</h3>
              <div className="space-y-4">
                {activeGigs.map((gig) => (
                  <Link
                    key={gig.id}
                    href={`/gig/${gig.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-md transition-all"
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
                      <Image src={gig.image} alt="" fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-[var(--text-primary)] text-sm truncate">
                        {gig.title}
                      </h4>
                      <p className="text-[var(--primary)] font-semibold font-mono">${gig.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[var(--border)] p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Achievements</h3>
              <div className="grid grid-cols-2 gap-3">
                {badges.map((badge) => (
                  <div
                    key={badge.name}
                    className="p-3 rounded-lg bg-[var(--bg-alt)] border border-transparent hover:border-[var(--primary-light)] transition-colors"
                  >
                    <badge.icon className="w-5 h-5 text-[var(--primary)] mb-2" />
                    <p className="font-medium text-[var(--text-primary)] text-sm">{badge.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{badge.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
