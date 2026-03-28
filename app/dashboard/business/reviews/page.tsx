"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Star } from "lucide-react"

export default function BusinessReviewsPage() {
  return (
    <DashboardLayout userType="business" userName="Alex Johnson">
      <div className="mx-auto max-w-lg rounded-2xl border border-[var(--border)] bg-white p-10 text-center shadow-sm">
        <Star className="mx-auto h-12 w-12 text-[var(--cta-amber)]" />
        <h1 className="mt-4 text-xl font-bold text-[var(--text-primary)]">Reviews</h1>
        <p className="mt-2 text-[var(--text-secondary)]">Ratings from freelancers you&apos;ve hired will appear here.</p>
        <Link href="/dashboard/business" className="mt-6 inline-block text-sm font-semibold text-[var(--primary-dark)] hover:underline">
          ← Back to overview
        </Link>
      </div>
    </DashboardLayout>
  )
}
