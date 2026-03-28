"use client"

import Link from "next/link"
import { CreditCard } from "lucide-react"

export default function BusinessPaymentsPage() {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-[#e2e8f0] bg-white p-10 text-center shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <CreditCard className="mx-auto h-12 w-12 text-[#6d9c9f]" />
      <h1 className="mt-4 text-xl font-bold text-[#0f172a]">Payments</h1>
      <p className="mt-2 text-sm text-[#64748b]">Invoices, escrow, and payout history — connect your billing provider to go live.</p>
      <Link href="/business/dashboard" className="mt-6 inline-block text-sm font-semibold text-[#2d7a7e] hover:underline">
        ← Back to overview
      </Link>
    </div>
  )
}
