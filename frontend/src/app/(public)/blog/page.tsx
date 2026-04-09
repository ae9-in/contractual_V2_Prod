import StaticPage from "@/components/shared/static-page-layout"

export default function BlogPage() {
  return (
    <StaticPage
      heroTitle="Insights That Help You Grow"
      content="Stay updated with the latest trends, tips, and stories from the freelance ecosystem."
      sections={[
        {
          title: "Categories",
          items: ["Freelancing", "Business", "Technology", "Growth"]
        }
      ]}
    />
  )
}
