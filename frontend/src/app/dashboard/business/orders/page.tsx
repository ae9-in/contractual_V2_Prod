
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { FileSignature } from "lucide-react"

export default function BusinessOrdersPage() {
  return (
    <DashboardLayout userType="business" userName="Alex Rivera">
      <div className="page-section-enter mx-auto max-w-3xl rounded-2xl border border-[var(--border)] bg-white p-10 text-center shadow-sm">
        <FileSignature className="mx-auto h-12 w-12 text-[var(--primary)]" />
        <h1 className="mt-4 text-2xl font-bold text-[var(--text-primary)]">Active contracts</h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          Track delivery milestones, revisions, and escrow releases in one place — same ergonomics as top freelance platforms.
        </p>
        <Button asChild className="mt-6 rounded-xl bg-[var(--primary)] btn-premium">
          <Link href="/contracts/demo-1042">Open sample contract</Link>
        </Button>
      </div>
    </DashboardLayout>
  )
}
