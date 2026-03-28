"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, Search, Filter, MoreHorizontal, Eye, Edit2, Trash2, 
  Users, Clock, IndianRupee, TrendingUp, Pause, Play, Copy,
  CheckCircle2, XCircle, AlertCircle, ChevronDown, Calendar,
  BarChart3, Zap, Star, MessageSquare, ExternalLink
} from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/layout"
import { DashboardHeader } from "@/components/dashboard/header"

const myGigs = [
  {
    id: 1,
    title: "Senior React Developer for E-commerce Platform",
    category: "Development",
    status: "active",
    budget: { min: 2000, max: 5000 },
    applicants: 24,
    views: 486,
    posted: "2 days ago",
    deadline: "Dec 15, 2024",
    urgent: true,
    featured: true,
    hired: 0,
    shortlisted: 5
  },
  {
    id: 2,
    title: "Brand Identity Design for Tech Startup",
    category: "Design",
    status: "active",
    budget: { min: 800, max: 1500 },
    applicants: 18,
    views: 312,
    posted: "5 days ago",
    deadline: "Dec 20, 2024",
    urgent: false,
    featured: false,
    hired: 1,
    shortlisted: 3
  },
  {
    id: 3,
    title: "Content Writer for SaaS Blog - 10 Articles",
    category: "Writing",
    status: "paused",
    budget: { min: 500, max: 1000 },
    applicants: 32,
    views: 567,
    posted: "1 week ago",
    deadline: "Dec 25, 2024",
    urgent: false,
    featured: false,
    hired: 0,
    shortlisted: 8
  },
  {
    id: 4,
    title: "SEO Optimization for Corporate Website",
    category: "Marketing",
    status: "closed",
    budget: { min: 1200, max: 2000 },
    applicants: 15,
    views: 234,
    posted: "2 weeks ago",
    deadline: "Dec 1, 2024",
    urgent: false,
    featured: false,
    hired: 1,
    shortlisted: 2
  },
  {
    id: 5,
    title: "Mobile App UI/UX Redesign",
    category: "Design",
    status: "draft",
    budget: { min: 3000, max: 6000 },
    applicants: 0,
    views: 0,
    posted: "Not published",
    deadline: "Jan 10, 2025",
    urgent: false,
    featured: false,
    hired: 0,
    shortlisted: 0
  }
]

const statusConfig = {
  active: { label: "Active", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  paused: { label: "Paused", color: "bg-amber-100 text-amber-700", icon: Pause },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-600", icon: XCircle },
  draft: { label: "Draft", color: "bg-blue-100 text-blue-700", icon: Edit2 }
}

export default function MyGigsPage() {
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGigs, setSelectedGigs] = useState<number[]>([])
  const [showActions, setShowActions] = useState<number | null>(null)

  const filteredGigs = myGigs.filter(gig => {
    if (filter !== "all" && gig.status !== filter) return false
    if (searchQuery && !gig.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const stats = {
    total: myGigs.length,
    active: myGigs.filter(g => g.status === "active").length,
    totalApplicants: myGigs.reduce((sum, g) => sum + g.applicants, 0),
    totalViews: myGigs.reduce((sum, g) => sum + g.views, 0)
  }

  return (
    <DashboardLayout userType="business">
      <DashboardHeader 
        title="My Gigs" 
        subtitle="Manage your posted gigs and review applicants"
        userType="business"
      />

      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Gigs", value: stats.total, icon: BarChart3, color: "primary" },
            { label: "Active Gigs", value: stats.active, icon: Zap, color: "green" },
            { label: "Total Applicants", value: stats.totalApplicants, icon: Users, color: "blue" },
            { label: "Total Views", value: stats.totalViews.toLocaleString(), icon: Eye, color: "amber" }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl border border-[var(--border)] p-4 hover:shadow-lg hover:border-[var(--primary)] transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  stat.color === "primary" ? "bg-[var(--primary-light)]" :
                  stat.color === "green" ? "bg-green-100" :
                  stat.color === "blue" ? "bg-blue-100" : "bg-amber-100"
                }`}>
                  <stat.icon className={`w-6 h-6 ${
                    stat.color === "primary" ? "text-[var(--primary)]" :
                    stat.color === "green" ? "text-green-600" :
                    stat.color === "blue" ? "text-blue-600" : "text-amber-600"
                  }`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters & Actions Bar */}
        <div className="bg-white rounded-xl border border-[var(--border)] p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {["all", "active", "paused", "draft", "closed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filter === status
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--bg-alt)] text-[var(--text-secondary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status !== "all" && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-white/20">
                      {myGigs.filter(g => g.status === status).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  placeholder="Search gigs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] outline-none transition-all"
                />
              </div>
              <Link
                href="/dashboard/business/post-gig"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 hover:scale-[1.02]"
                style={{ background: "var(--gradient-amber)" }}
              >
                <Plus className="w-4 h-4" />
                Post New Gig
              </Link>
            </div>
          </div>
        </div>

        {/* Gigs List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredGigs.map((gig, index) => {
              const StatusIcon = statusConfig[gig.status as keyof typeof statusConfig].icon
              return (
                <motion.div
                  key={gig.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-[var(--border)] p-5 hover:shadow-lg hover:border-[var(--primary)] transition-all duration-300 group"
                >
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Main Content */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedGigs.includes(gig.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedGigs([...selectedGigs, gig.id])
                            } else {
                              setSelectedGigs(selectedGigs.filter(id => id !== gig.id))
                            }
                          }}
                          className="mt-1.5 w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link 
                              href={`/dashboard/business/my-gigs/${gig.id}`}
                              className="text-lg font-semibold text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors"
                            >
                              {gig.title}
                            </Link>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig[gig.status as keyof typeof statusConfig].color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig[gig.status as keyof typeof statusConfig].label}
                            </span>
                            {gig.urgent && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                Urgent
                              </span>
                            )}
                            {gig.featured && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 flex items-center gap-1">
                                <Star className="w-3 h-3" /> Featured
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 mt-2 text-sm text-[var(--text-secondary)]">
                            <span className="px-2 py-0.5 rounded-full bg-[var(--bg-alt)]">{gig.category}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Posted {gig.posted}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Deadline: {gig.deadline}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center gap-6 mt-4 pl-7">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{gig.applicants}</p>
                            <p className="text-xs text-[var(--text-secondary)]">Applicants</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{gig.shortlisted}</p>
                            <p className="text-xs text-[var(--text-secondary)]">Shortlisted</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                            <Star className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{gig.hired}</p>
                            <p className="text-xs text-[var(--text-secondary)]">Hired</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                            <Eye className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{gig.views}</p>
                            <p className="text-xs text-[var(--text-secondary)]">Views</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex flex-col items-end justify-between lg:w-48">
                      <div className="text-right">
                        <p className="text-sm text-[var(--text-secondary)]">Budget</p>
                        <p className="text-xl font-bold text-[var(--primary)]">
                          ${gig.budget.min.toLocaleString()} - ${gig.budget.max.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <Link
                          href={`/dashboard/business/my-gigs/${gig.id}/applicants`}
                          className="px-3 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors flex items-center gap-1"
                        >
                          <Users className="w-4 h-4" />
                          View Applicants
                        </Link>
                        <div className="relative">
                          <button
                            onClick={() => setShowActions(showActions === gig.id ? null : gig.id)}
                            className="p-2 rounded-lg hover:bg-[var(--bg-alt)] transition-colors"
                          >
                            <MoreHorizontal className="w-5 h-5 text-[var(--text-secondary)]" />
                          </button>
                          
                          <AnimatePresence>
                            {showActions === gig.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-[var(--border)] shadow-xl z-10 overflow-hidden"
                              >
                                {[
                                  { icon: Eye, label: "View Gig", href: `/gig/${gig.id}` },
                                  { icon: Edit2, label: "Edit Gig", href: `/dashboard/business/my-gigs/${gig.id}/edit` },
                                  { icon: Copy, label: "Duplicate", action: () => {} },
                                  { icon: gig.status === "active" ? Pause : Play, label: gig.status === "active" ? "Pause Gig" : "Activate Gig", action: () => {} },
                                  { icon: ExternalLink, label: "Share Gig", action: () => {} },
                                  { icon: Trash2, label: "Delete", action: () => {}, danger: true }
                                ].map((item, i) => (
                                  <button
                                    key={i}
                                    onClick={() => {
                                      setShowActions(null)
                                      item.action?.()
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                      item.danger 
                                        ? "text-red-600 hover:bg-red-50" 
                                        : "text-[var(--text-primary)] hover:bg-[var(--bg-alt)]"
                                    }`}
                                  >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filteredGigs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-full bg-[var(--bg-alt)] flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-10 h-10 text-[var(--text-secondary)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No gigs found</h3>
              <p className="text-[var(--text-secondary)] mb-6">Try adjusting your filters or post a new gig</p>
              <Link
                href="/dashboard/business/post-gig"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium"
                style={{ background: "var(--gradient-amber)" }}
              >
                <Plus className="w-5 h-5" />
                Post Your First Gig
              </Link>
            </motion.div>
          )}
        </div>

        {/* Bulk Actions */}
        <AnimatePresence>
          {selectedGigs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[var(--dark-surface)] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50"
            >
              <span className="text-sm">
                <strong>{selectedGigs.length}</strong> gig{selectedGigs.length > 1 ? "s" : ""} selected
              </span>
              <div className="w-px h-6 bg-white/20" />
              <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors">
                Pause All
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors">
                Close All
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm transition-colors">
                Delete All
              </button>
              <button 
                onClick={() => setSelectedGigs([])}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
