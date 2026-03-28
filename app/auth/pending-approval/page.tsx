"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Clock } from "lucide-react"

function PendingInner() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-alt)] p-6">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
          <Clock className="h-10 w-10 text-amber-500" strokeWidth={1.5} />
        </div>
        <h1 className="font-bricolage text-2xl font-bold text-[var(--text-primary)]">
          Application Under Review
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
          Your business account is being reviewed by our team. You&apos;ll receive an email once
          approved (usually within 24 hours).
        </p>
        {email ? (
          <p className="mt-4 rounded-lg bg-[var(--bg-alt)] px-3 py-2 font-mono text-xs text-[var(--text-secondary)]">
            {email}
          </p>
        ) : null}
        <Link
          href="/"
          className="mt-8 inline-block text-sm font-semibold text-[var(--primary-dark)] hover:underline"
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}

export default function PendingApprovalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-alt)]" />}>
      <PendingInner />
    </Suspense>
  )
}
