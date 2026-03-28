import { notFound } from "next/navigation"
import { getFreelancerById, MOCK_FREELANCERS } from "@/lib/mock-data"
import { FreelancerProfileView } from "@/components/freelancer/freelancer-profile-view"

export function generateStaticParams() {
  return MOCK_FREELANCERS.map((f) => ({ id: f.id }))
}

export default async function FreelancerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const f = getFreelancerById(id)
  if (!f) notFound()
  return <FreelancerProfileView f={f} />
}
