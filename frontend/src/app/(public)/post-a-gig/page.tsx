import StaticPage from "@/components/shared/static-page-layout"

export default function PostGigPage() {
  return (
    <StaticPage
      heroTitle="Get Your Work Done by the Right Experts"
      content="Post your requirement, set your budget, and connect with skilled freelancers ready to deliver results."
      sections={[
        {
          title: "How It Works",
          items: [
            "Create your gig by describing project goals, timeline, and budget.",
            "Receive tailored proposals from relevant freelancers.",
            "Review profiles, portfolios, and ratings before selecting.",
            "Track progress with milestones and communication tools.",
            "Release payment only when the work is approved.",
          ],
        },
        {
          title: "Why Choose Us",
          items: [
            "Verified freelancers",
            "Transparent pricing",
            "Fast turnaround",
            "Secure payments",
          ],
        },
      ]}
      ctaText="Post a Gig Now"
      ctaLink="/business/post-gig"
    />
  )
}
