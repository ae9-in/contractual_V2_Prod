/** Business dashboard mock data — Contractual */

export const MOCK_SKILL_POOL = [
  "React",
  "TypeScript",
  "Next.js",
  "Node.js",
  "Figma",
  "UI/UX",
  "Python",
  "AWS",
  "PostgreSQL",
  "GraphQL",
  "SEO",
  "Content Strategy",
  "Video Editing",
  "Motion Design",
]

export const CATEGORY_OPTIONS = [
  { id: "development", label: "Development", emoji: "💻" },
  { id: "design", label: "Design", emoji: "🎨" },
  { id: "writing", label: "Writing", emoji: "✍️" },
  { id: "marketing", label: "Marketing", emoji: "📊" },
  { id: "video", label: "Video & Animation", emoji: "🎥" },
  { id: "social", label: "Social Media", emoji: "📱" },
  { id: "seo", label: "SEO", emoji: "🔍" },
  { id: "data", label: "Data & Analytics", emoji: "📈" },
  { id: "consulting", label: "Consulting", emoji: "🤝" },
  { id: "devops", label: "DevOps & Cloud", emoji: "⚙️" },
] as const

export const TIMELINE_OPTIONS = [
  { id: "lt1", label: "⚡ Less than 1 week" },
  { id: "1-2", label: "📅 1–2 weeks" },
  { id: "2-4", label: "🗓 2–4 weeks" },
  { id: "1-3m", label: "📆 1–3 months" },
  { id: "ongoing", label: "🔄 Ongoing / Long-term" },
] as const

export type GigStatus = "Open" | "In Review" | "Urgent" | "Closed" | "Draft"

export interface MockGigRow {
  id: string
  title: string
  categoryId: string
  categoryEmoji: string
  categoryLabel: string
  budget: string
  applications: number
  status: GigStatus
  deadline: string
  daysLeft: number | null
}

export const MOCK_GIG_ROWS: MockGigRow[] = [
  {
    id: "g1",
    title: "Full-Stack SaaS Dashboard — React + Node",
    categoryId: "development",
    categoryEmoji: "💻",
    categoryLabel: "Development",
    budget: "₹4,200",
    applications: 24,
    status: "Open",
    deadline: "Apr 12, 2026",
    daysLeft: 14,
  },
  {
    id: "g2",
    title: "Brand refresh + landing page motion",
    categoryId: "design",
    categoryEmoji: "🎨",
    categoryLabel: "Design",
    budget: "₹2,350",
    applications: 18,
    status: "In Review",
    deadline: "Mar 30, 2026",
    daysLeft: 2,
  },
  {
    id: "g3",
    title: "Urgent API migration (48h window)",
    categoryId: "development",
    categoryEmoji: "💻",
    categoryLabel: "Development",
    budget: "₹8,000",
    applications: 42,
    status: "Urgent",
    deadline: "Mar 29, 2026",
    daysLeft: 1,
  },
  {
    id: "g4",
    title: "Weekly blog posts (draft saved)",
    categoryId: "writing",
    categoryEmoji: "✍️",
    categoryLabel: "Writing",
    budget: "₹640",
    applications: 0,
    status: "Draft",
    deadline: "—",
    daysLeft: null,
  },
  {
    id: "g5",
    title: "Q1 SEO technical audit",
    categoryId: "seo",
    categoryEmoji: "🔍",
    categoryLabel: "SEO",
    budget: "₹900",
    applications: 11,
    status: "Closed",
    deadline: "Feb 1, 2026",
    daysLeft: null,
  },
]

export interface MockApplicationCard {
  id: string
  freelancerName: string
  initials: string
  rating: number
  topRated: boolean
  tagline: string
  skills: string[]
  bid: number
  bidType: "Fixed" | "Hourly"
  deliveryDays: number
  gigTitle: string
}

export const MOCK_APPLICATIONS: MockApplicationCard[] = [
  {
    id: "a1",
    freelancerName: "Maya Chen",
    initials: "MC",
    rating: 4.9,
    topRated: true,
    tagline: "Product designer · Design systems · Figma expert",
    skills: ["Figma", "UI Kit", "Prototyping"],
    bid: 2400,
    bidType: "Fixed",
    deliveryDays: 5,
    gigTitle: "Brand refresh + landing",
  },
  {
    id: "a2",
    freelancerName: "Jordan Okonkwo",
    initials: "JO",
    rating: 5,
    topRated: true,
    tagline: "Senior React · TypeScript · Next.js",
    skills: ["React", "Next.js", "Node"],
    bid: 75,
    bidType: "Hourly",
    deliveryDays: 14,
    gigTitle: "SaaS Dashboard",
  },
  {
    id: "a3",
    freelancerName: "Sofia Rossi",
    initials: "SR",
    rating: 4.8,
    topRated: false,
    tagline: "Content strategist · B2B SaaS",
    skills: ["SEO", "Copy", "Research"],
    bid: 890,
    bidType: "Fixed",
    deliveryDays: 7,
    gigTitle: "Blog sprint",
  },
]

export const SPARKLINE_VIEWS = [
  { i: 0, v: 120 },
  { i: 1, v: 180 },
  { i: 2, v: 210 },
  { i: 3, v: 195 },
  { i: 4, v: 260 },
  { i: 5, v: 310 },
  { i: 6, v: 284 },
]

export const RADIAL_APPLICATION_RATE = [{ name: "rate", value: 34, fill: "var(--primary)" }]

export interface ActivityItem {
  id: string
  dot: "green" | "blue" | "amber" | "red"
  message: string
  time: string
  action?: { label: string; href: string }
}

export const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    dot: "green",
    message: "New application from @maya_designs on 'React Dashboard'",
    time: "5 min ago",
  },
  {
    id: "2",
    dot: "blue",
    message: "Contract signed with @dev_pro for '₹840 — Logo Redesign'",
    time: "2h ago",
  },
  {
    id: "3",
    dot: "amber",
    message: "Application shortlisted for 'API Integration'",
    time: "4h ago",
  },
  {
    id: "4",
    dot: "green",
    message: "Payment of ₹1,200 released to @content_king",
    time: "Yesterday",
  },
  {
    id: "5",
    dot: "red",
    message: "Gig 'SEO Audit' expires in 2 days — Renew?",
    time: "2 days left",
    action: { label: "Renew Now", href: "/business/dashboard/my-gigs" },
  },
]
