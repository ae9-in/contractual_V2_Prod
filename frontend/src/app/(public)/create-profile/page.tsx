import StaticPage from "@/components/shared/static-page-layout"

export default function CreateProfilePage() {
  return (
    <StaticPage
      heroTitle="Build a Profile That Gets You Hired"
      content="Showcase your skills, experience, and portfolio to stand out and win higher-quality opportunities."
      items={[
        "Add a professional bio",
        "Highlight key skills",
        "Upload past work",
        "Keep your profile updated",
      ]}
      ctaText="Create Your Profile"
      ctaLink="/auth/register"
    />
  )
}
