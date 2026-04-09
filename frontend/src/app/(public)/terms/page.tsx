import StaticPage from "@/components/shared/static-page-layout"

export default function TermsPage() {
  return (
    <StaticPage
      heroTitle="Terms of Service"
      content="These terms describe the responsibilities, rights, and platform rules for businesses and freelancers using Contractual."
      sections={[
        {
          title: "Key Terms",
          items: [
            "Users must provide accurate account and profile information.",
            "Payments and dispute handling follow platform policies.",
            "Both parties must communicate and collaborate in good faith.",
            "Violations of trust or safety policies may lead to account action.",
          ],
        },
      ]}
    />
  )
}
