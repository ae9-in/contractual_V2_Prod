import StaticPage from "@/components/shared/static-page-layout"

export default function BrowseTalentPage() {
  return (
    <StaticPage
      heroTitle="Find the Perfect Talent for Your Needs"
      content="Explore a diverse pool of freelancers across multiple categories and filter by skills, experience, budget, and ratings."
      items={[
        "Top Rated Freelancers",
        "Trending Skills",
        "Recently Active",
        "Recommended for You",
      ]}
      ctaText="Browse Talent"
      ctaLink="/browse?type=talent"
    />
  )
}
