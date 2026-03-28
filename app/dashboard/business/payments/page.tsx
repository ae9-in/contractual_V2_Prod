"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/layout"
import { CreditCard } from "lucide-react"

export default function BusinessPaymentsPage() {
  return (
    <DashboardLayout userType="business" userName="Alex Johnson">
      <div className="mx-auto max-w-lg rounded-2xl border border-[var(--border)] bg-white p-10 text-center shadow-sm">
        <CreditCard className="mx-auto h-12 w-12 text-[var(--primary)]" />
        <h1 className="mt-4 text-xl font-bold text-[var(--text-primary)]">Payments</h1>
        <p className="mt-2 text-[var(--text-secondary)]">Invoices, escrow, and payout history — connect your billing provider to go live.</p>
        <Link href="/dashboard/business" className="mt-6 inline-block text-sm font-semibold text-[var(--primary-dark)] hover:underline">
          ← Back to overview
        </Link>
      </div>
    </DashboardLayout>
  )
}
