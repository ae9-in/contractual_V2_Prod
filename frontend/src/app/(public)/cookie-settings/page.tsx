import StaticPage from "@/components/shared/static-page-layout"

export default function CookieSettingsPage() {
  return (
    <StaticPage
      heroTitle="Cookie Settings"
      content="Manage your cookie preferences and choose how Contractual stores settings for analytics, personalization, and performance."
      items={[
        "Essential cookies required for core platform functionality",
        "Analytics cookies to help us improve performance",
        "Preference cookies for personalized user experience",
      ]}
    />
  )
}
