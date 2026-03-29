import { PostGigWizardPage } from "@/components/business/post-gig-wizard"
import { notFound } from "next/navigation"

export default async function EditGigPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!id) notFound()

  return <PostGigWizardPage editId={id} />
}
