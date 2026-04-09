import StaticPage from "@/components/shared/static-page-layout"

export default function SuccessStoriesPage() {
  return (
    <StaticPage
      heroTitle="Real People. Real Success."
      content="Thousands of freelancers are building careers and growing income through our platform."
      items={[
        "\"Started with one gig, now working full-time freelance.\"",
        "\"Scaled my income 3x in 6 months.\"",
      ]}
      ctaText="Start Your Journey"
      ctaLink="/find-gigs"
    />
  )
}
