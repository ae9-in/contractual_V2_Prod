import StaticPage from "@/components/shared/static-page-layout"

export default function HelpPage() {
  return (
    <StaticPage
      heroTitle="How Can We Help You?"
      content="Browse FAQs and guides to quickly resolve your queries."
      sections={[
        {
          title: "Quick Help Topics",
          items: [
            "Getting started with your freelancer or business account",
            "Using real-time messages and notifications",
            "Posting and applying to gigs safely",
            "Managing account settings and preferences",
          ],
        },
      ]}
      faq={[
        {
          question: "What is Contractual and how does it work?",
          answer:
            "Contractual is a professional freelancer marketplace where businesses post gigs and freelancers apply. It combines secured contract workflows, realtime messaging, notifications, and document attachments so both parties can collaborate reliably.",
        },
        {
          question: "How do I sign up as a freelancer or business?",
          answer:
            "Use the Register page to create an account, then choose whether you want to join as a freelancer or a business. Once signed in, freelancers can browse gigs and submit proposals, while businesses can post gigs, review applicants, and manage contracts.",
        },
        {
          question: "Can I upload files like PPT, PDF, or DOCX when posting a gig?",
          answer:
            "Yes. Contractual supports document uploads for gig attachments, including common formats such as PPT, PDF, DOCX, and images. This helps you share briefs, proposals, and deliverables directly through the platform.",
        },
        {
          question: "Are notifications and messages real-time?",
          answer:
            "Yes. The platform uses realtime socket notifications so new messages and alerts appear immediately. The message and bell icons update dynamically, and relevant pages refresh automatically when new activity arrives.",
        },
        {
          question: "How do I access and update my account settings?",
          answer:
            "Open the Settings page from your dashboard. You can manage company or account details, notification preferences, security options, and payment settings. Every setting section is designed to work, not just display placeholders.",
        },
        {
          question: "What should I do if I need extra help?",
          answer:
            "If you need more support, use the Contact page or reach out through the provided support channels. For urgent issues, include your account details and a clear description so the team can assist you quickly.",
        },
      ]}
    />
  )
}
