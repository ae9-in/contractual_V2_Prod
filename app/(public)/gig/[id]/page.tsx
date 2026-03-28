import { notFound } from "next/navigation"
import { getAllGigIds, getGigById } from "@/lib/mock-data"
import { GigDetailView } from "@/components/gig/gig-detail-view"

export function generateStaticParams() {
  return getAllGigIds().map((id) => ({ id }))
}

export default async function GigPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const gig = getGigById(id)
  if (!gig) notFound()
  return <GigDetailView gig={gig} />
}
