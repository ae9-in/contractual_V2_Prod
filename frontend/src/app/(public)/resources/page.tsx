import StaticPage from "@/components/shared/static-page-layout"

export default function ResourcesPage() {
  return (
    <StaticPage
      heroTitle="Learn. Grow. Succeed."
      content="Access guides, tips, and tools that help you build a stronger freelance journey."
      items={[
        "Freelancing tips",
        "Client management",
        "Pricing strategies",
        "Industry insights",
      ]}
      ctaText="Explore Resources"
      ctaLink="/blog"
    />
  )
}
