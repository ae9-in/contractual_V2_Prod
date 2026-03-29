"use client"

import { useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/layout"
import { StatusBadge } from "@/components/dashboard/data-table"
import { cn } from "@/lib/utils"
import {
  Search,
  Filter,
  Clock,
  IndianRupee,
  Star,
  Eye,
  MessageSquare,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  MoreHorizontal,
  Calendar,
  Building2,
  TrendingUp,
} from "lucide-react"

type ApplicationStatus = "all" | "pending" | "shortlisted" | "accepted" | "rejected" | "withdrawn"

const statusColors = {
  "Pending": { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" },
  "Under Review": { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  "Shortlisted": { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  "Accepted": { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  "Rejected": { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  "Withdrawn": { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" },
}

const mockApplications = [
  {
    id: 1,
    gigTitle: "Senior React Developer for SaaS Dashboard",
    company: "CloudTech Solutions",
    companyVerified: true,
    budget: "₹4,000 - ₹6,000",
    proposedRate: "₹5,500",
    coverLetter: "I have 5+ years of experience building complex SaaS dashboards with React, TypeScript, and modern data visualization libraries...",
    appliedDate: "Mar 20, 2025",
    status: "Shortlisted",
    lastActivity: "Client viewed your proposal",
    lastActivityTime: "2 hours ago",
    clientResponse: true,
    interviewScheduled: false,
  },
  {
    id: 2,
    gigTitle: "Full-Stack E-commerce Platform Development",
    company: "RetailPro Inc.",
    companyVerified: true,
    budget: "₹8,000 - ₹12,000",
    proposedRate: "₹10,500",
    coverLetter: "I specialize in building scalable e-commerce platforms with Next.js, handling high traffic and complex inventory systems...",
    appliedDate: "Mar 18, 2025",
    status: "Under Review",
    lastActivity: "Application submitted",
    lastActivityTime: "3 days ago",
    clientResponse: false,
    interviewScheduled: false,
  },
  {
    id: 3,
    gigTitle: "API Integration Specialist - Payment Gateways",
    company: "FinTech Startup",
    companyVerified: true,
    budget: "₹50 - ₹75/hr",
    proposedRate: "₹65/hr",
    coverLetter: "I have extensive experience integrating payment gateways including Stripe, PayPal, and Square...",
    appliedDate: "Mar 15, 2025",
    status: "Accepted",
    lastActivity: "Contract started",
    lastActivityTime: "1 day ago",
    clientResponse: true,
    interviewScheduled: false,
  },
  {
    id: 4,
    gigTitle: "WordPress Plugin Development",
    company: "BlogMaster Media",
    companyVerified: false,
    budget: "₹800 - ₹1,200",
    proposedRate: "₹1,000",
    coverLetter: "As a WordPress expert with 50+ plugins developed, I can build custom solutions tailored to your needs...",
    appliedDate: "Mar 12, 2025",
    status: "Rejected",
    lastActivity: "Client chose another freelancer",
    lastActivityTime: "5 days ago",
    clientResponse: true,
    interviewScheduled: false,
  },
  {
    id: 5,
    gigTitle: "Mobile App UI/UX Design - Fitness Tracking",
    company: "FitLife App",
    companyVerified: false,
    budget: "₹2,500 - ₹4,000",
    proposedRate: "₹3,200",
    coverLetter: "I design user-centered mobile experiences that drive engagement and conversion...",
    appliedDate: "Mar 10, 2025",
    status: "Pending",
    lastActivity: "Waiting for client review",
    lastActivityTime: "1 week ago",
    clientResponse: false,
    interviewScheduled: false,
  },
]

const stats = [
  { label: "Total Applications", value: "24", icon: FileText, trend: "+5 this week" },
  { label: "Shortlisted", value: "8", icon: Star, trend: "33% rate" },
  { label: "Interviews", value: "3", icon: MessageSquare, trend: "2 upcoming" },
  { label: "Accepted", value: "12", icon: CheckCircle, trend: "50% success" },
]

export default function FreelancerApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus>("all")
  const [selectedApp, setSelectedApp] = useState<number | null>(null)

  const filteredApplications = mockApplications.filter(app => {
    const matchesSearch = app.gigTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.company.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || 
                         app.status.toLowerCase().includes(statusFilter.toLowerCase())
    return matchesSearch && matchesStatus
  })

  return (
    <DashboardLayout userType="freelancer" userName="Alex Johnson">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">My Applications</h1>
        <p className="text-text-secondary mt-1">Track and manage your gig applications</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-border p-5 hover:border-primary hover:shadow-lg hover:shadow-shadow-teal transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs text-text-secondary">{stat.trend}</span>
            </div>
            <p className="text-2xl font-bold text-text-primary font-mono">{stat.value}</p>
            <p className="text-sm text-text-secondary mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by gig title or company..."
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-bg-alt border border-transparent focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "shortlisted", label: "Shortlisted" },
              { key: "accepted", label: "Accepted" },
              { key: "rejected", label: "Rejected" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key as ApplicationStatus)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                  statusFilter === tab.key
                    ? "bg-gradient-primary text-white shadow-md"
                    : "bg-bg-alt text-text-secondary hover:text-text-primary"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((app) => {
          const statusStyle = statusColors[app.status as keyof typeof statusColors]
          return (
            <div
              key={app.id}
              className={cn(
                "bg-white rounded-2xl border border-border overflow-hidden transition-all duration-300",
                selectedApp === app.id ? "border-primary shadow-xl shadow-shadow-teal" : "hover:border-primary/50 hover:shadow-lg"
              )}
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    {/* Status & Date */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
                        statusStyle.bg, statusStyle.text
                      )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", statusStyle.dot)} />
                        {app.status}
                      </span>
                      <span className="text-xs text-text-secondary">
                        Applied {app.appliedDate}
                      </span>
                      {app.clientResponse && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <Eye className="w-3 h-3" />
                          Client viewed
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <Link href={`/gig/${app.id}`}>
                      <h3 className="text-lg font-semibold text-text-primary hover:text-primary transition-colors line-clamp-1">
                        {app.gigTitle}
                      </h3>
                    </Link>

                    {/* Company */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold text-xs">
                        {app.company.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-medium text-text-primary">{app.company}</span>
                      {app.companyVerified && (
                        <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    {/* Budget Info */}
                    <div className="flex flex-wrap items-center gap-4 mt-4">
                      <div className="flex items-center gap-1.5 text-sm">
                        <IndianRupee className="w-4 h-4 text-text-secondary" />
                        <span className="text-text-secondary">Budget:</span>
                        <span className="font-medium text-text-primary">{app.budget}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-text-secondary">Your bid:</span>
                        <span className="font-semibold text-primary">{app.proposedRate}</span>
                      </div>
                    </div>

                    {/* Last Activity */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                      <Clock className="w-4 h-4 text-text-secondary" />
                      <span className="text-sm text-text-secondary">
                        {app.lastActivity} <span className="text-text-secondary/60">- {app.lastActivityTime}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row lg:flex-col items-center gap-2">
                    <Link
                      href={`/dashboard/freelancer/applications/${app.id}`}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-primary text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-shadow-teal transition-all"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    {app.status === "Shortlisted" && (
                      <Link
                        href={`/dashboard/freelancer/messages?gig=${app.id}`}
                        className="flex items-center gap-2 px-4 py-2.5 border border-primary text-primary rounded-xl text-sm font-medium hover:bg-primary-light transition-all"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </Link>
                    )}
                    {(app.status === "Pending" || app.status === "Under Review") && (
                      <button className="flex items-center gap-2 px-4 py-2.5 border border-border text-text-secondary rounded-xl text-sm font-medium hover:border-red-500 hover:text-red-500 transition-all">
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>

                {/* Cover Letter Preview (expandable) */}
                {selectedApp === app.id && (
                  <div className="mt-6 p-4 bg-bg-alt rounded-xl animate-slide-up">
                    <h4 className="text-sm font-semibold text-text-primary mb-2">Your Cover Letter</h4>
                    <p className="text-sm text-text-secondary">{app.coverLetter}</p>
                  </div>
                )}
              </div>

              {/* Expand/Collapse */}
              <button
                onClick={() => setSelectedApp(selectedApp === app.id ? null : app.id)}
                className="w-full py-3 text-sm font-medium text-primary hover:bg-primary-light border-t border-border transition-colors"
              >
                {selectedApp === app.id ? "Show Less" : "Show Cover Letter"}
              </button>
            </div>
          )
        })}

        {filteredApplications.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-border">
            <div className="w-16 h-16 mx-auto rounded-full bg-bg-alt flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No applications found</h3>
            <p className="text-text-secondary mb-6">Try adjusting your filters or search query</p>
            <Link
              href="/dashboard/freelancer/gigs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-xl font-medium hover:shadow-lg hover:shadow-shadow-teal transition-all"
            >
              Browse Available Gigs
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
