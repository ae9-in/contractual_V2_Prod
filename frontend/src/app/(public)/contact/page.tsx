import StaticPage from "@/components/shared/static-page-layout"

export default function ContactPage() {
  return (
    <StaticPage
      heroTitle="We're Here to Help"
      content="Reach out to our support team for any questions or assistance."
      items={["Email support: connect@contractual.pro", "Response within 24-48 hours"]}
      ctaText="Email Support"
      ctaLink="mailto:connect@contractual.pro"
    />
  )
}
