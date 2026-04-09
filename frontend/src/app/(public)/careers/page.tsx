import StaticPage from "@/components/shared/static-page-layout"

export default function CareersPage() {
  return (
    <StaticPage
      heroTitle="Join Our Team"
      content="We're building something impactful and we want you to be part of it."
      sections={[
        {
          title: "Explore",
          items: ["Open roles", "Culture & values", "Benefits"],
        },
      ]}
      ctaText="Apply Now"
      ctaLink="/auth/register"
    />
  )
}
