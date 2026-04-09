import StaticPage from "@/components/shared/static-page-layout"

export default function AboutPage() {
  return (
    <StaticPage
      heroTitle="Building the Future of Work"
      content="We connect businesses with talented freelancers through a structured, trusted ecosystem. Our mission is to make work flexible, efficient, and outcome-driven."
      sections={[
        {
          title: "Our Values",
          items: ["Trust", "Transparency", "Efficiency", "Growth"]
        }
      ]}
    />
  )
}
