"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin, Star, ShieldCheck, ExternalLink, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

interface FreelancerCardProps {
  id: string
  name: string
  image?: string | null
  headline?: string | null
  bio?: string | null
  location?: string | null
  hourlyRate?: number | null
  isVerified?: boolean
  skills?: { name: string }[]
}

export function FreelancerCard({
  id,
  name,
  image,
  headline,
  bio,
  location,
  hourlyRate,
  isVerified = false,
  skills = [],
}: FreelancerCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-[var(--border)] bg-white p-5 transition-all duration-300 hover:border-[var(--primary)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-4 ring-slate-50">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--primary)]/10 text-[var(--primary)] text-xl font-bold">
              {name.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-display text-lg font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--primary-dark)]">
              {name}
            </h3>
            {isVerified && (
              <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--primary)]" />
            )}
          </div>
          <p className="truncate text-sm font-medium text-[var(--primary-dark)]/80">
            {headline || "Top Freelancer"}
          </p>
          <div className="mt-1 flex items-center gap-3 text-xs text-[var(--text-secondary)]">
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> 4.9 (12 reviews)
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
        {bio || "Experienced professional delivering high-quality results for enterprise clients."}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {skills.slice(0, 3).map((s) => (
          <span
            key={s.name}
            className="rounded-full bg-[var(--bg-alt)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-primary)]"
          >
            {s.name}
          </span>
        ))}
        {skills.length > 3 && (
          <span className="rounded-full bg-[var(--bg-alt)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-secondary)]">
            +{skills.length - 3} more
          </span>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Hourly Rate
          </p>
          <p className="font-stat text-base font-bold text-[var(--text-primary)]">
            ₹{hourlyRate || 0}
          </p>
        </div>
        <Link
          href={`/freelancer/${id}`}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-[var(--primary-dark)] hover:shadow-teal-500/40"
        >
          View Profile
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
