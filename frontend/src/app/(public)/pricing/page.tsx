import StaticPage from "@/components/shared/static-page-layout"

export default function PricingPage() {
  return (
    <StaticPage
      heroTitle="Flexible Pricing for Every Business"
      content="We believe in transparent and fair pricing, and you only pay for the work you approve."
      items={[
        "Platform fee: percentage per transaction",
        "Optional promotions to boost gig visibility",
        "No upfront hiring costs",
      ]}
      ctaText="Start Posting for Free"
      ctaLink="/post-a-gig"
    />
  )
}
