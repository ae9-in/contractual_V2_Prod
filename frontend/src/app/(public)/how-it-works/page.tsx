import StaticPage from "@/components/shared/static-page-layout"

export default function HowItWorksPage() {
  return (
    <StaticPage
      heroTitle="Simple. Efficient. Reliable."
      content="Built to simplify hiring and deliver outcomes for businesses of every size."
      sections={[
        {
          title: "Steps",
          items: [
            "Post a requirement and tell us what you need.",
            "Get matched with relevant freelancers.",
            "Evaluate options across profiles, reviews, and pricing.",
            "Start the project and collaborate with built-in tools.",
            "Pay securely and release funds only after approval.",
          ],
        },
      ]}
      ctaText="Start Hiring Today"
      ctaLink="/post-a-gig"
    />
  )
}
