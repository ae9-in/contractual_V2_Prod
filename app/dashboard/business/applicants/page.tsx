"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, Filter, Star, MapPin, Clock, CheckCircle2, XCircle, 
  MessageSquare, Eye, ChevronDown, Download, MoreHorizontal,
  Briefcase, Award, Zap, Calendar, IndianRupee, Globe, User,
  ThumbsUp, ThumbsDown, FileText, ExternalLink, Video, Phone
} from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/layout"
import { DashboardHeader } from "@/components/dashboard/header"

const applicants = [
  {
    id: 1,
    name: "Alex Chen",
    avatar: null,
    title: "Senior Full Stack Developer",
    rating: 4.9,
    reviews: 127,
    level: "Top Rated Plus",
    location: "San Francisco, USA",
    hourlyRate: 85,
    jobSuccess: 98,
    totalEarned: "₹245K+",
    skills: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL"],
    appliedFor: "Senior React Developer for E-commerce Platform",
    appliedDate: "2 hours ago",
    coverLetter: "I have 8+ years of experience building scalable e-commerce platforms using React and Node.js. I've worked with companies like Shopify and BigCommerce...",
    status: "new",
    proposedRate: "₹75/hr",
    deliveryTime: "4 weeks",
    attachments: 2,
    verified: true,
    available: true
  },
  {
    id: 2,
    name: "Sarah Miller",
    avatar: null,
    title: "UI/UX Designer & Brand Specialist",
    rating: 5.0,
    reviews: 89,
    level: "Top Rated",
    location: "London, UK",
    hourlyRate: 65,
    jobSuccess: 100,
    totalEarned: "₹180K+",
    skills: ["Figma", "Adobe XD", "Branding", "UI Design", "Prototyping"],
    appliedFor: "Brand Identity Design for Tech Startup",
    appliedDate: "5 hours ago",
    coverLetter: "As a brand specialist with over 6 years of experience, I've helped 50+ startups create memorable brand identities. My approach focuses on...",
    status: "shortlisted",
    proposedRate: "₹1,200 fixed",
    deliveryTime: "2 weeks",
    attachments: 5,
    verified: true,
    available: true
  },
  {
    id: 3,
    name: "Michael Roberts",
    avatar: null,
    title: "Content Writer & SEO Specialist",
    rating: 4.8,
    reviews: 234,
    level: "Rising Talent",
    location: "Toronto, Canada",
    hourlyRate: 45,
    jobSuccess: 95,
    totalEarned: "₹85K+",
    skills: ["Blog Writing", "SEO", "Copywriting", "Technical Writing", "Research"],
    appliedFor: "Content Writer for SaaS Blog - 10 Articles",
    appliedDate: "1 day ago",
    coverLetter: "I specialize in creating engaging, SEO-optimized content for SaaS companies. I understand the technical nuances and can translate complex features...",
    status: "interviewing",
    proposedRate: "₹800 fixed",
    deliveryTime: "3 weeks",
    attachments: 3,
    verified: true,
    available: false
  },
  {
    id: 4,
    name: "Emma Wilson",
    avatar: null,
    title: "React Native Developer",
    rating: 4.7,
    reviews: 56,
    level: "Level 2",
    location: "Berlin, Germany",
    hourlyRate: 70,
    jobSuccess: 92,
    totalEarned: "₹65K+",
    skills: ["React Native", "iOS", "Android", "Redux", "Firebase"],
    appliedFor: "Mobile App UI/UX Redesign",
    appliedDate: "2 days ago",
    coverLetter: "I have extensive experience in mobile app development and have redesigned several apps that saw significant increases in user engagement...",
    status: "new",
    proposedRate: "₹4,500 fixed",
    deliveryTime: "5 weeks",
    attachments: 4,
    verified: false,
    available: true
  },
  {
    id: 5,
    name: "David Park",
    avatar: null,
    title: "SEO & Digital Marketing Expert",
    rating: 4.9,
    reviews: 178,
    level: "Top Rated",
    location: "Seoul, South Korea",
    hourlyRate: 55,
    jobSuccess: 97,
    totalEarned: "₹120K+",
    skills: ["SEO", "Google Analytics", "SEM", "Content Strategy", "Link Building"],
    appliedFor: "SEO Optimization for Corporate Website",
    appliedDate: "3 days ago",
    coverLetter: "With 7 years of SEO experience and a track record of ranking 200+ websites on the first page of Google, I can guarantee measurable results...",
    status: "rejected",
    proposedRate: "₹1,800 fixed",
    deliveryTime: "6 weeks",
    attachments: 2,
    verified: true,
    available: true
  }
]

const statusConfig = {
  new: { label: "New", color: "bg-blue-100 text-blue-700" },
  shortlisted: { label: "Shortlisted", color: "bg-green-100 text-green-700" },
  interviewing: { label: "Interviewing", color: "bg-amber-100 text-amber-700" },
  rejected: { label: "Declined", color: "bg-gray-100 text-gray-600" },
  hired: { label: "Hired", color: "bg-[var(--primary-light)] text-[var(--primary-dark)]" }
}

const levelConfig = {
  "Top Rated Plus": { color: "bg-amber-500 text-white", icon: Award },
  "Top Rated": { color: "bg-[var(--primary)] text-white", icon: Star },
  "Rising Talent": { color: "bg-green-500 text-white", icon: Zap },
  "Level 2": { color: "bg-blue-500 text-white", icon: User }
}

export default function ApplicantsPage() {
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGig, setSelectedGig] = useState("all")
  const [expandedApplicant, setExpandedApplicant] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  const gigs = [...new Set(applicants.map(a => a.appliedFor))]
  
  const filteredApplicants = applicants.filter(applicant => {
    if (filter !== "all" && applicant.status !== filter) return false
    if (selectedGig !== "all" && applicant.appliedFor !== selectedGig) return false
    if (searchQuery && !applicant.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <DashboardLayout userType="business">
      <DashboardHeader 
        title="Applicants" 
        subtitle="Review and manage applications for your gigs"
        userType="business"
      />

      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Applicants", value: applicants.length, color: "primary" },
            { label: "New", value: applicants.filter(a => a.status === "new").length, color: "blue" },
            { label: "Shortlisted", value: applicants.filter(a => a.status === "shortlisted").length, color: "green" },
            { label: "Interviewing", value: applicants.filter(a => a.status === "interviewing").length, color: "amber" },
            { label: "Hired", value: applicants.filter(a => a.status === "hired").length, color: "teal" }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                filter === (stat.label === "Total Applicants" ? "all" : stat.label.toLowerCase())
                  ? "border-[var(--primary)] bg-[var(--primary-light)] shadow-md"
                  : "border-[var(--border)] bg-white hover:border-[var(--primary)]"
              }`}
              onClick={() => setFilter(stat.label === "Total Applicants" ? "all" : stat.label.toLowerCase())}
            >
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
              <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl border border-[var(--border)] p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex gap-3 flex-wrap">
              <div className="relative">
                <select
                  value={selectedGig}
                  onChange={(e) => setSelectedGig(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] outline-none"
                >
                  <option value="all">All Gigs</option>
                  {gigs.map(gig => (
                    <option key={gig} value={gig}>{gig.slice(0, 40)}...</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border)] text-sm hover:border-[var(--primary)] transition-colors">
                <Filter className="w-4 h-4" />
                More Filters
              </button>
            </div>

            <div className="flex gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  placeholder="Search applicants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] outline-none transition-all"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-sm hover:border-[var(--primary)] transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Applicants List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredApplicants.map((applicant, index) => {
              const LevelIcon = levelConfig[applicant.level as keyof typeof levelConfig]?.icon || User
              const isExpanded = expandedApplicant === applicant.id
              
              return (
                <motion.div
                  key={applicant.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-[var(--border)] overflow-hidden hover:shadow-lg hover:border-[var(--primary)] transition-all duration-300"
                >
                  {/* Main Row */}
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Freelancer Info */}
                      <div className="flex gap-4 flex-1">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center text-white text-xl font-bold">
                            {applicant.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          {applicant.available && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link 
                              href={`/freelancer/${applicant.id}`}
                              className="text-lg font-semibold text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors"
                            >
                              {applicant.name}
                            </Link>
                            {applicant.verified && (
                              <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${levelConfig[applicant.level as keyof typeof levelConfig]?.color || "bg-gray-100 text-gray-600"}`}>
                              <LevelIcon className="w-3 h-3" />
                              {applicant.level}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[applicant.status as keyof typeof statusConfig].color}`}>
                              {statusConfig[applicant.status as keyof typeof statusConfig].label}
                            </span>
                          </div>
                          
                          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{applicant.title}</p>
                          
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1 text-amber-500">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="font-semibold">{applicant.rating}</span>
                              <span className="text-[var(--text-secondary)]">({applicant.reviews})</span>
                            </span>
                            <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                              <MapPin className="w-3.5 h-3.5" />
                              {applicant.location}
                            </span>
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {applicant.jobSuccess}% Success
                            </span>
                            <span className="text-[var(--text-secondary)]">
                              {applicant.totalEarned} earned
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {applicant.skills.slice(0, 4).map(skill => (
                              <span key={skill} className="px-2 py-0.5 rounded-full text-xs bg-[var(--bg-alt)] text-[var(--text-secondary)]">
                                {skill}
                              </span>
                            ))}
                            {applicant.skills.length > 4 && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--primary-light)] text-[var(--primary)]">
                                +{applicant.skills.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Info */}
                      <div className="flex flex-col items-end justify-between lg:w-56">
                        <div className="text-right">
                          <p className="text-xs text-[var(--text-secondary)]">Proposed Rate</p>
                          <p className="text-xl font-bold text-[var(--primary)]">{applicant.proposedRate}</p>
                          <p className="text-xs text-[var(--text-secondary)] mt-1">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {applicant.deliveryTime}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-4">
                          <button
                            onClick={() => setExpandedApplicant(isExpanded ? null : applicant.id)}
                            className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm font-medium hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            {isExpanded ? "Less" : "View Details"}
                          </button>
                          <button className="px-3 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            Message
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Applied For */}
                    <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <Briefcase className="w-4 h-4" />
                        Applied for: <span className="text-[var(--text-primary)] font-medium">{applicant.appliedFor}</span>
                      </div>
                      <span className="text-[var(--text-secondary)]">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {applicant.appliedDate}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 space-y-4">
                          <div className="h-px bg-[var(--border)]" />
                          
                          {/* Cover Letter */}
                          <div>
                            <h4 className="font-semibold text-[var(--text-primary)] mb-2">Cover Letter</h4>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-alt)] p-4 rounded-lg">
                              {applicant.coverLetter}
                            </p>
                          </div>

                          {/* Attachments */}
                          <div>
                            <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                              Attachments ({applicant.attachments})
                            </h4>
                            <div className="flex gap-3">
                              {[...Array(applicant.attachments)].map((_, i) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-alt)] rounded-lg border border-[var(--border)] hover:border-[var(--primary)] transition-colors cursor-pointer">
                                  <FileText className="w-4 h-4 text-[var(--primary)]" />
                                  <span className="text-sm text-[var(--text-primary)]">
                                    {i === 0 ? "Portfolio.pdf" : i === 1 ? "Resume.pdf" : `Sample_${i}.pdf`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3 pt-2">
                            <button className="flex-1 py-3 rounded-xl text-white font-medium transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2" style={{ background: "var(--gradient-amber)" }}>
                              <CheckCircle2 className="w-5 h-5" />
                              Hire Freelancer
                            </button>
                            <button className="flex-1 py-3 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-dark)] transition-all duration-300 flex items-center justify-center gap-2">
                              <Star className="w-5 h-5" />
                              Shortlist
                            </button>
                            <button className="flex-1 py-3 rounded-xl border border-[var(--border)] text-[var(--text-primary)] font-medium hover:border-[var(--primary)] transition-all duration-300 flex items-center justify-center gap-2">
                              <Video className="w-5 h-5" />
                              Schedule Interview
                            </button>
                            <button className="py-3 px-4 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-all duration-300">
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filteredApplicants.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white rounded-xl border border-[var(--border)]"
            >
              <div className="w-20 h-20 rounded-full bg-[var(--bg-alt)] flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-[var(--text-secondary)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No applicants found</h3>
              <p className="text-[var(--text-secondary)]">Try adjusting your filters or check back later</p>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
