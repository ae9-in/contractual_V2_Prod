/** Mock data for freelancer dashboard (Unsplash + realistic copy). */

export const UNSPLASH = {
  dev: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop&q=80",
  design: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=200&fit=crop&q=80",
  marketing: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop&q=80",
  data: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop&q=80",
} as const

export type MockGig = {
  id: string
  title: string
  company: string
  category: string
  image: string
  match: number
  skills: string[]
  moreSkills: number
  duration: string
  applied: number
  location: string
  budget: string
  budgetMin: number
  budgetMax: number
  description: string[]
  requirements: string[]
  postedAgo: string
  views: number
  applicants: number
  level: string
}

export const GIGS: MockGig[] = [
  {
    id: "1",
    title: "Senior React Developer for SaaS Dashboard",
    company: "TechCorp Inc.",
    category: "Development",
    image: UNSPLASH.dev,
    match: 92,
    skills: ["React", "TypeScript", "Node.js"],
    moreSkills: 3,
    duration: "2 weeks",
    applied: 12,
    location: "Remote",
    budget: "₹800",
    budgetMin: 800,
    budgetMax: 1200,
    description: [
      "We need an experienced React engineer to ship a production analytics dashboard with real-time charts, role-based access, and tight integrations with our REST and GraphQL APIs.",
      "You will work with our design system (Storybook), write tests (Vitest + Playwright), and collaborate daily with product and backend.",
      "The ideal candidate has shipped complex data-heavy UIs and cares about performance, accessibility, and maintainable architecture.",
    ],
    requirements: [
      "5+ years with React and TypeScript in production",
      "Experience with TanStack Query, Zustand or similar",
      "Comfortable reviewing PRs and mentoring junior devs",
      "Overlap with US Eastern time at least 4 hours",
    ],
    postedAgo: "2 days ago",
    views: 248,
    applicants: 12,
    level: "Intermediate–Expert",
  },
  {
    id: "2",
    title: "Product UI Redesign — Design System",
    company: "DesignHive",
    category: "Design",
    image: UNSPLASH.design,
    match: 88,
    skills: ["Figma", "UI Kit", "Prototyping"],
    moreSkills: 2,
    duration: "3 weeks",
    applied: 8,
    location: "Remote",
    budget: "₹650",
    budgetMin: 600,
    budgetMax: 900,
    description: [
      "We are refreshing our B2B product UI. You will extend our Figma design system, produce high-fidelity screens, and hand off specs to engineering.",
      "Strong attention to spacing, typography, and component states is required.",
    ],
    requirements: [
      "Portfolio with SaaS or dashboard work",
      "Figma auto-layout and variables",
      "Ability to run async critiques with stakeholders",
    ],
    postedAgo: "1 day ago",
    views: 180,
    applicants: 8,
    level: "Intermediate",
  },
  {
    id: "3",
    title: "Growth Marketing — Paid Social + Landing Pages",
    company: "ScaleUp Labs",
    category: "Marketing",
    image: UNSPLASH.marketing,
    match: 85,
    skills: ["Meta Ads", "Copy", "Analytics"],
    moreSkills: 2,
    duration: "4 weeks",
    applied: 24,
    location: "Remote",
    budget: "₹1,200",
    budgetMin: 1000,
    budgetMax: 1500,
    description: [
      "Own paid social experiments and landing page iterations for our self-serve product. You will work with our growth lead and design partner.",
    ],
    requirements: [
      "Proven B2B SaaS growth experience",
      "Comfortable with GA4 and conversion tracking",
    ],
    postedAgo: "3 days ago",
    views: 310,
    applicants: 24,
    level: "Expert",
  },
  ...Array.from({ length: 9 }, (_, i) => {
    const imgs = [UNSPLASH.dev, UNSPLASH.design, UNSPLASH.marketing, UNSPLASH.data] as const
    const img = imgs[i % 4]
    const cats = ["Development", "Design", "Marketing", "Data"] as const
    const cat = cats[i % 4]
    const id = String(i + 4)
    return {
      id,
      title: `Contract ${i + 4}: ${cat} Project ${i + 4}`,
      company: `Company ${i + 100}`,
      category: cat,
      image: img,
      match: 75 + (i % 15),
      skills: ["React", "TypeScript", "Node.js"],
      moreSkills: 2,
      duration: `${1 + (i % 3)} weeks`,
      applied: 5 + i,
      location: i % 2 === 0 ? "Remote" : "New York, USA",
      budget: `$${400 + i * 50}`,
      budgetMin: 400 + i * 50,
      budgetMax: 800 + i * 50,
      description: [
        "We are looking for a reliable freelancer to deliver scoped work on time with clear communication.",
        "Details will be shared after NDA. Weekly syncs and written updates required.",
      ],
      requirements: ["Relevant portfolio", "English fluency", "Available 20+ hrs/week"],
      postedAgo: `${i + 1} days ago`,
      views: 100 + i * 17,
      applicants: 5 + i,
      level: "Intermediate",
    } satisfies MockGig
  }),
]

export function getGigById(id: string): MockGig | undefined {
  return GIGS.find((g) => g.id === id)
}
