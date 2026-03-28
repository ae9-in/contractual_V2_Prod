import Link from "next/link"
import { CategoryCard } from "@/components/category-card"

const categories = [
  {
    imageSrc:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=640&h=360&fit=crop&q=80",
    imageAlt: "Code on a monitor — development and programming",
    name: "Development",
    gigCount: 1284,
    href: "/browse?category=development",
  },
  {
    imageSrc:
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=640&h=360&fit=crop&q=80",
    imageAlt: "Design workspace with graphics tablet — creative design",
    name: "Design",
    gigCount: 892,
    href: "/browse?category=design",
  },
  {
    imageSrc:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=640&h=360&fit=crop&q=80",
    imageAlt: "Notebook and pen — writing and content",
    name: "Writing",
    gigCount: 756,
    href: "/browse?category=writing",
  },
  {
    imageSrc:
      "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=640&h=360&fit=crop&q=80",
    imageAlt: "Marketing strategy and collaboration",
    name: "Marketing",
    gigCount: 634,
    href: "/browse?category=marketing",
  },
  {
    imageSrc:
      "https://images.unsplash.com/photo-1524712245354-2c4cb5b6a7ae?w=640&h=360&fit=crop&q=80",
    imageAlt: "Video production and cinema lighting",
    name: "Video",
    gigCount: 423,
    href: "/gigs?category=video",
  },
  {
    imageSrc:
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=640&h=360&fit=crop&q=80",
    imageAlt: "Mobile phone — social media content",
    name: "Social Media",
    gigCount: 567,
    href: "/browse?category=social-media",
  },
  {
    imageSrc:
      "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=640&h=360&fit=crop&q=80",
    imageAlt: "Laptop showing analytics — SEO and search",
    name: "SEO",
    gigCount: 345,
    href: "/browse?category=seo",
  },
  {
    imageSrc:
      "https://images.unsplash.com/photo-1551288049-bebda4e38c71?w=640&h=360&fit=crop&q=80",
    imageAlt: "Business dashboards and data visualization",
    name: "Data & Analytics",
    gigCount: 289,
    href: "/browse?category=data-analytics",
  },
]

export function CategoriesSection() {
  return (
    <section className="py-16 lg:py-20 bg-[var(--bg-alt)]">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
            Browse by Category
          </h2>
          <Link
            href="/browse"
            className="text-[var(--primary)] font-semibold hover:text-[var(--primary-dark)] transition-colors"
          >
            See All
          </Link>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category, index) => (
            <div
              key={category.name}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CategoryCard {...category} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
