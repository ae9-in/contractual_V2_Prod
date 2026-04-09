import StaticPage from "@/components/shared/static-page-layout"

export default function TrustSafetyPage() {
  return (
    <StaticPage
      heroTitle="Your Safety Matters"
      content="We maintain a secure platform with verified users and protected transactions."
      sections={[
        {
          title: "Safety Features",
          items: ["Secure payments", "Profile verification", "Data protection"]
        }
      ]}
    />
  )
}
