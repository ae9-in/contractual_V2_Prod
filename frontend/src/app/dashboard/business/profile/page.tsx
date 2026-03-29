
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/layout"
import { User } from "lucide-react"

export default function BusinessProfilePage() {
  return (
    <DashboardLayout userType="business" userName="Alex Johnson">
      <div className="mx-auto max-w-lg rounded-2xl border border-[var(--border)] bg-white p-10 text-center shadow-sm">
        <User className="mx-auto h-12 w-12 text-[var(--primary)]" />
        <h1 className="mt-4 text-xl font-bold text-[var(--text-primary)]">Business profile</h1>
        <p className="mt-2 text-[var(--text-secondary)]">Company details and branding — wire your API to load live data.</p>
        <Link href="/dashboard/business" className="mt-6 inline-block text-sm font-semibold text-[var(--primary-dark)] hover:underline">
          ← Back to overview
        </Link>
      </div>
    </DashboardLayout>
  )
}
