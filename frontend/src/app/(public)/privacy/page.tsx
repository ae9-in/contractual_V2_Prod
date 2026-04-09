import StaticPage from "@/components/shared/static-page-layout"

export default function PrivacyPage() {
  return (
    <StaticPage
      heroTitle="Privacy Policy"
      content="Your privacy is important to us. This page explains how Contractual collects, uses, and protects your information."
      sections={[
        {
          title: "Privacy Commitments",
          items: [
            "Collect only the information needed to operate the platform.",
            "Use your data to improve matching, security, and support.",
            "Protect personal information through strong safeguards.",
            "Never sell personal data to third parties.",
          ],
        },
      ]}
    />
  )
}
