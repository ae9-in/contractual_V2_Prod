import StaticPage from "@/components/shared/static-page-layout"

export default function FindGigsPage() {
  return (
    <StaticPage
      heroTitle="Discover Work That Fits Your Skills"
      content="Browse gigs from businesses across industries, apply, connect, and start earning."
      items={[
        "Smart job matching",
        "Real-time opportunities",
        "Direct client communication",
      ]}
      ctaText="Find Gigs Now"
      ctaLink="/browse"
    />
  )
}
