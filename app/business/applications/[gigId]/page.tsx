"use client"

import { useParams } from "next/navigation"
import { ApplicationsGigPage } from "@/components/business/applications-gig-page"

export default function BusinessApplicationsForGigRoute() {
  const params = useParams()
  const gigId = String(params.gigId ?? "")

  return <ApplicationsGigPage gigId={gigId} />
}
