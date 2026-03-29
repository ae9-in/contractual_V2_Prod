"use client"

import { useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/layout"
import { StatusBadge } from "@/components/dashboard/data-table"
import { cn } from "@/lib/utils"
import {
  Search,
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  MapPin,
  Clock,
  IndianRupee,
  Star,
  Heart,
  Bookmark,
  ExternalLink,
  Zap,
  TrendingUp,
  Users,
  Briefcase,
  X,
  SlidersHorizontal,
} from "lucide-react"

const categories = [
  "All Categories",
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Graphic Design",
  "Content Writing",
  "Digital Marketing",
  "Video & Animation",
  "Data Science",
  "DevOps & Cloud",
]

const skillLevels = ["All Levels", "Entry Level", "Intermediate", "Expert"]
const projectTypes = ["All Types", "Fixed Price", "Hourly", "Contract"]
const durations = ["Any Duration", "Less than 1 week", "1-4 weeks", "1-3 months", "3+ months"]

const mockGigs = [
  {
    id: 1,
    title: "Senior React Developer for SaaS Dashboard",
    company: "CloudTech Solutions",
    companyVerified: true,
    description: "We're looking for an experienced React developer to build a comprehensive SaaS dashboard with real-time data visualization, user management, and advanced analytics features.",
    budget: "₹4,000 - ₹6,000",
    budgetType: "Fixed Price",
    duration: "1-3 months",
    skills: ["React", "TypeScript", "Redux", "Chart.js", "Tailwind CSS"],
    location: "Remote",
    postedTime: "2 hours ago",
    applicants: 12,
    rating: 4.9,
    reviews: 47,
    urgency: "high",
    saved: false,
  },
  {
    id: 2,
    title: "Full-Stack E-commerce Platform Development",
    company: "RetailPro Inc.",
    companyVerified: true,
    description: "Build a complete e-commerce platform with product management, shopping cart, payment integration (Stripe), order tracking, and admin dashboard.",
    budget: "₹8,000 - ₹12,000",
    budgetType: "Fixed Price",
    duration: "3+ months",
    skills: ["Next.js", "Node.js", "PostgreSQL", "Stripe", "AWS"],
    location: "Remote",
    postedTime: "5 hours ago",
    applicants: 28,
    rating: 4.8,
    reviews: 124,
    urgency: "medium",
    saved: true,
  },
  {
    id: 3,
    title: "Mobile App UI/UX Design - Fitness Tracking",
    company: "FitLife App",
    companyVerified: false,
    description: "Design a modern, intuitive UI/UX for a fitness tracking mobile app. Includes workout logging, progress tracking, social features, and gamification elements.",
    budget: "₹2,500 - ₹4,000",
    budgetType: "Fixed Price",
    duration: "1-4 weeks",
    skills: ["Figma", "UI Design", "UX Research", "Prototyping", "Mobile Design"],
    location: "Remote",
    postedTime: "1 day ago",
    applicants: 45,
    rating: 4.7,
    reviews: 32,
    urgency: "low",
    saved: false,
  },
  {
    id: 4,
    title: "WordPress Website Migration & Optimization",
    company: "BlogMaster Media",
    companyVerified: true,
    description: "Migrate existing WordPress site to new hosting, optimize for speed and SEO, implement caching, and set up proper security measures.",
    budget: "₹800 - ₹1,200",
    budgetType: "Fixed Price",
    duration: "Less than 1 week",
    skills: ["WordPress", "PHP", "MySQL", "SEO", "Server Administration"],
    location: "Remote",
    postedTime: "2 days ago",
    applicants: 8,
    rating: 4.6,
    reviews: 18,
    urgency: "high",
    saved: false,
  },
  {
    id: 5,
    title: "API Integration Specialist - Payment Gateways",
    company: "FinTech Startup",
    companyVerified: true,
    description: "Integrate multiple payment gateways (Stripe, PayPal, Square) into existing Node.js backend. Include webhook handling and transaction logging.",
    budget: "₹50 - ₹75/hr",
    budgetType: "Hourly",
    duration: "1-4 weeks",
    skills: ["Node.js", "REST APIs", "Stripe", "PayPal API", "MongoDB"],
    location: "Remote",
    postedTime: "3 days ago",
    applicants: 15,
    rating: 4.9,
    reviews: 67,
    urgency: "medium",
    saved: true,
  },
  {
    id: 6,
    title: "Content Writer for Tech Blog - 20 Articles",
    company: "TechInsider",
    companyVerified: true,
    description: "Write 20 high-quality, SEO-optimized articles about emerging technologies, AI, cloud computing, and software development best practices.",
    budget: "₹1,500 - ₹2,500",
    budgetType: "Fixed Price",
    duration: "1-4 weeks",
    skills: ["Content Writing", "SEO", "Technical Writing", "Research", "Copywriting"],
    location: "Remote",
    postedTime: "4 days ago",
    applicants: 52,
    rating: 4.5,
    reviews: 89,
    urgency: "low",
    saved: false,
  },
]

export default function FreelancerGigsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedLevel, setSelectedLevel] = useState("All Levels")
  const [selectedType, setSelectedType] = useState("All Types")
  const [selectedDuration, setSelectedDuration] = useState("Any Duration")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [sortBy, setSortBy] = useState("relevance")
  const [showFilters, setShowFilters] = useState(false)
  const [savedGigs, setSavedGigs] = useState<number[]>([2, 5])

  const toggleSave = (gigId: number) => {
    setSavedGigs(prev => 
      prev.includes(gigId) 
        ? prev.filter(id => id !== gigId)
        : [...prev, gigId]
    )
  }

  const activeFilters = [
    selectedCategory !== "All Categories" && selectedCategory,
    selectedLevel !== "All Levels" && selectedLevel,
    selectedType !== "All Types" && selectedType,
    selectedDuration !== "Any Duration" && selectedDuration,
  ].filter(Boolean)

  return (
    <DashboardLayout userType="freelancer" userName="Alex Johnson">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">Find Work</h1>
            <p className="text-text-secondary mt-1">Browse and apply to gigs matching your skills</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">
              <strong className="text-text-primary font-mono">1,284</strong> gigs available
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-2xl border border-border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gigs by title, skills, or keywords..."
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-bg-alt border border-transparent focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-12 pl-4 pr-10 rounded-xl bg-bg-alt border border-transparent focus:border-primary focus:bg-white appearance-none cursor-pointer text-sm font-medium text-text-primary"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-5 h-12 rounded-xl font-medium text-sm transition-all",
              showFilters
                ? "bg-primary text-white"
                : "bg-bg-alt text-text-primary hover:bg-primary/10"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilters.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </button>

          {/* View Toggle */}
          <div className="flex items-center bg-bg-alt rounded-xl p-1">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2.5 rounded-lg transition-all",
                viewMode === "list" ? "bg-white shadow text-primary" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2.5 rounded-lg transition-all",
                viewMode === "grid" ? "bg-white shadow text-primary" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Skill Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-bg-alt border border-transparent focus:border-primary appearance-none cursor-pointer text-sm"
                >
                  {skillLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Project Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-bg-alt border border-transparent focus:border-primary appearance-none cursor-pointer text-sm"
                >
                  {projectTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Duration</label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-bg-alt border border-transparent focus:border-primary appearance-none cursor-pointer text-sm"
                >
                  {durations.map((duration) => (
                    <option key={duration} value={duration}>{duration}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-bg-alt border border-transparent focus:border-primary appearance-none cursor-pointer text-sm"
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="newest">Newest First</option>
                  <option value="budget-high">Budget: High to Low</option>
                  <option value="budget-low">Budget: Low to High</option>
                  <option value="applicants">Fewest Applicants</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border">
            <span className="text-sm text-text-secondary">Active filters:</span>
            {activeFilters.map((filter, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
              >
                {filter}
                <button 
                  onClick={() => {
                    if (filter === selectedCategory) setSelectedCategory("All Categories")
                    if (filter === selectedLevel) setSelectedLevel("All Levels")
                    if (filter === selectedType) setSelectedType("All Types")
                    if (filter === selectedDuration) setSelectedDuration("Any Duration")
                  }}
                  className="hover:text-primary-dark"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            <button
              onClick={() => {
                setSelectedCategory("All Categories")
                setSelectedLevel("All Levels")
                setSelectedType("All Types")
                setSelectedDuration("Any Duration")
              }}
              className="text-sm text-red-500 font-medium hover:text-red-600 ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Gigs List */}
      <div className={cn(
        "gap-4",
        viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2" : "flex flex-col"
      )}>
        {mockGigs.map((gig) => (
          <div
            key={gig.id}
            className="group bg-white rounded-2xl border border-border hover:border-primary hover:shadow-xl hover:shadow-shadow-teal transition-all duration-300 overflow-hidden"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {gig.urgency === "high" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                        <Zap className="w-3 h-3" />
                        Urgent
                      </span>
                    )}
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      gig.budgetType === "Fixed Price" ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-700"
                    )}>
                      {gig.budgetType}
                    </span>
                    <span className="text-xs text-text-secondary">{gig.postedTime}</span>
                  </div>
                  <Link href={`/gig/${gig.id}`}>
                    <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-2">
                      {gig.title}
                    </h3>
                  </Link>
                </div>
                <button
                  onClick={() => toggleSave(gig.id)}
                  className={cn(
                    "p-2.5 rounded-xl transition-all",
                    savedGigs.includes(gig.id)
                      ? "bg-red-100 text-red-500"
                      : "bg-bg-alt text-text-secondary hover:text-red-500 hover:bg-red-50"
                  )}
                >
                  <Heart className={cn("w-5 h-5", savedGigs.includes(gig.id) && "fill-current")} />
                </button>
              </div>

              {/* Company Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">
                  {gig.company.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-text-primary">{gig.company}</span>
                    {gig.companyVerified && (
                      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-medium text-text-primary">{gig.rating}</span>
                    <span>({gig.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                {gig.description}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {gig.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-lg bg-bg-alt text-text-secondary text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <IndianRupee className="w-4 h-4" />
                    <span className="font-semibold text-primary">{gig.budget}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <Clock className="w-4 h-4" />
                    {gig.duration}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <Users className="w-4 h-4" />
                    {gig.applicants} applicants
                  </div>
                </div>
                <Link
                  href={`/gig/${gig.id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-shadow-teal transition-all"
                >
                  Apply Now
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center mt-8">
        <button className="px-8 py-3 border-2 border-primary text-primary rounded-xl font-medium hover:bg-primary hover:text-white transition-all">
          Load More Gigs
        </button>
      </div>
    </DashboardLayout>
  )
}
