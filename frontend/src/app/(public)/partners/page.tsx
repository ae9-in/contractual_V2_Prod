import StaticPage from "@/components/shared/static-page-layout"

export default function PartnersPage() {
  return (
    <StaticPage
      heroTitle="Grow Together"
      content="Partner with us to expand reach and create opportunities."
      sections={[
        {
          title: "Partnership Types",
          items: ["College partnerships", "Corporate collaborations", "Training partners"]
        }
      ]}
      ctaText="Become a Partner"
      ctaLink="/contact"
    />
  )
}
