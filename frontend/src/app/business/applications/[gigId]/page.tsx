import { ApplicationsGigPage } from "@/components/business/applications-gig-page"

export default async function BusinessApplicationsForGigRoute({ params }: { params: Promise<{ gigId: string }> }) {
  const { gigId } = await params
  return <ApplicationsGigPage gigId={gigId} />
}
