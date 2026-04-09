import { CategoriesSection } from "@/components/landing/categories-section"
import { DualCtaSection } from "@/components/landing/dual-cta-section"
import { HeroSection } from "@/components/landing/hero-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { LandingNavbar } from "@/components/landing/landing-navbar"
import { TrustedBySection } from "@/components/landing/trusted-by-section"
import { Footer } from "@/components/footer"
import { StatsCounter } from "@/components/stats-counter"

export const revalidate = 300

const stats = [
  { value: "8,000+", numericValue: 8000, label: "Businesses" },
  { value: "INR 13000+", numericValue: 13000, prefix: "INR ", label: "Contracts Closed" },
  { value: "3000+", numericValue: 3000, label: "Freelancers" },
  { value: "4.5", numericValue: 4.5, suffix: "*", label: "Avg Rating" },
]

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <LandingNavbar />
      <HeroSection />
      <StatsCounter stats={stats} />
      <CategoriesSection />
      <HowItWorksSection />
      <TrustedBySection />
      <DualCtaSection />
      <Footer />
    </main>
  )
}
