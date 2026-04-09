import StaticPage from "@/components/shared/static-page-layout"

export default function DisputesPage() {
  return (
    <StaticPage
      heroTitle="Fair & Transparent Resolutions"
      content="We ensure a structured process to resolve conflicts between freelancers and clients."
      sections={[
        {
          title: "Resolution Steps",
          items: ["1. Submit dispute", "2. Review by team", "3. Resolution provided"]
        }
      ]}
    />
  )
}
