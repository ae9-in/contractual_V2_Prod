"use client"

import { useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/layout"
import { cn } from "@/lib/utils"
import {
  Search,
  Clock,
  IndianRupee,
  CheckCircle,
  AlertCircle,
  XCircle,
  MessageSquare,
  FileText,
  Upload,
  Calendar,
  ChevronRight,
  MoreHorizontal,
  Play,
  Pause,
  Timer,
  Package,
  Star,
  ExternalLink,
  RefreshCw,
} from "lucide-react"

type OrderStatus = "all" | "active" | "delivered" | "revision" | "completed" | "cancelled"

const mockOrders = [
  {
    id: "ORD-2024-001",
    gigTitle: "Full-Stack Web Application Development",
    client: "TechCorp Inc.",
    clientAvatar: null,
    clientRating: 4.9,
    package: "Premium",
    price: 2400,
    startDate: "Mar 15, 2025",
    deadline: "Mar 28, 2025",
    daysLeft: 3,
    status: "In Progress",
    progress: 65,
    deliverables: [
      { name: "Frontend Development", completed: true },
      { name: "Backend API", completed: true },
      { name: "Database Setup", completed: false },
      { name: "Testing & QA", completed: false },
    ],
    messages: 12,
    revisions: 2,
    revisionsUsed: 0,
    urgent: true,
  },
  {
    id: "ORD-2024-002",
    gigTitle: "UI/UX Design for Mobile App",
    client: "DesignHive",
    clientAvatar: null,
    clientRating: 4.8,
    package: "Standard",
    price: 1800,
    startDate: "Mar 10, 2025",
    deadline: "Mar 25, 2025",
    daysLeft: 0,
    status: "Delivered",
    progress: 100,
    deliverables: [
      { name: "Wireframes", completed: true },
      { name: "UI Design", completed: true },
      { name: "Prototype", completed: true },
    ],
    messages: 8,
    revisions: 3,
    revisionsUsed: 1,
    urgent: false,
  },
  {
    id: "ORD-2024-003",
    gigTitle: "SEO Optimization Package",
    client: "MarketEdge",
    clientAvatar: null,
    clientRating: 4.7,
    package: "Basic",
    price: 650,
    startDate: "Mar 20, 2025",
    deadline: "Apr 2, 2025",
    daysLeft: 8,
    status: "In Progress",
    progress: 30,
    deliverables: [
      { name: "SEO Audit", completed: true },
      { name: "Keyword Research", completed: false },
      { name: "On-page Optimization", completed: false },
      { name: "Report & Recommendations", completed: false },
    ],
    messages: 4,
    revisions: 1,
    revisionsUsed: 0,
    urgent: false,
  },
  {
    id: "ORD-2024-004",
    gigTitle: "E-commerce Website Redesign",
    client: "ShopStyle",
    clientAvatar: null,
    clientRating: 4.6,
    package: "Premium",
    price: 3200,
    startDate: "Mar 5, 2025",
    deadline: "Mar 20, 2025",
    daysLeft: -5,
    status: "Revision",
    progress: 95,
    deliverables: [
      { name: "Homepage Redesign", completed: true },
      { name: "Product Pages", completed: true },
      { name: "Checkout Flow", completed: true },
      { name: "Mobile Responsive", completed: false },
    ],
    messages: 18,
    revisions: 2,
    revisionsUsed: 1,
    urgent: true,
  },
  {
    id: "ORD-2024-005",
    gigTitle: "API Integration - Payment Gateway",
    client: "FinTech Startup",
    clientAvatar: null,
    clientRating: 5.0,
    package: "Standard",
    price: 1200,
    startDate: "Mar 1, 2025",
    deadline: "Mar 12, 2025",
    daysLeft: -13,
    status: "Completed",
    progress: 100,
    deliverables: [
      { name: "Stripe Integration", completed: true },
      { name: "PayPal Integration", completed: true },
      { name: "Webhook Handling", completed: true },
      { name: "Documentation", completed: true },
    ],
    messages: 6,
    revisions: 2,
    revisionsUsed: 0,
    urgent: false,
  },
]

const statusStyles = {
  "In Progress": { bg: "bg-blue-100", text: "text-blue-700", icon: Play },
  "Delivered": { bg: "bg-amber-100", text: "text-amber-700", icon: Package },
  "Revision": { bg: "bg-purple-100", text: "text-purple-700", icon: RefreshCw },
  "Completed": { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
  "Cancelled": { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
}

export default function FreelancerOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus>("all")

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.gigTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || 
                         order.status.toLowerCase().replace(" ", "").includes(statusFilter.toLowerCase())
    return matchesSearch && matchesStatus
  })

  const activeOrdersCount = mockOrders.filter(o => o.status === "In Progress" || o.status === "Revision").length
  const totalEarnings = mockOrders.filter(o => o.status === "Completed").reduce((sum, o) => sum + o.price, 0)

  return (
    <DashboardLayout userType="freelancer" userName="Alex Johnson">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">Active Orders</h1>
            <p className="text-text-secondary mt-1">Manage and deliver your ongoing projects</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-text-secondary">Active Orders</p>
              <p className="text-2xl font-bold text-primary font-mono">{activeOrdersCount}</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-right">
              <p className="text-sm text-text-secondary">Completed Earnings</p>
              <p className="text-2xl font-bold text-green-600 font-mono">${totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>
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
              placeholder="Search by order ID, gig title, or client..."
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-bg-alt border border-transparent focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { key: "all", label: "All Orders" },
              { key: "active", label: "In Progress" },
              { key: "delivered", label: "Delivered" },
              { key: "revision", label: "Revision" },
              { key: "completed", label: "Completed" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key as OrderStatus)}
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

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const statusStyle = statusStyles[order.status as keyof typeof statusStyles]
          const StatusIcon = statusStyle.icon
          const isOverdue = order.daysLeft < 0 && order.status !== "Completed"
          
          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-border overflow-hidden hover:border-primary hover:shadow-xl hover:shadow-shadow-teal transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-mono text-text-secondary bg-bg-alt px-2 py-1 rounded">
                        {order.id}
                      </span>
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
                        statusStyle.bg, statusStyle.text
                      )}>
                        <StatusIcon className="w-3 h-3" />
                        {order.status}
                      </span>
                      {order.urgent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                          <AlertCircle className="w-3 h-3" />
                          Urgent
                        </span>
                      )}
                      {isOverdue && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                          <Clock className="w-3 h-3" />
                          Overdue
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-1">
                      {order.gigTitle}
                    </h3>

                    {/* Client Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold text-xs">
                        {order.client.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <span className="font-medium text-text-primary">{order.client}</span>
                        <div className="flex items-center gap-1 text-sm text-text-secondary">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{order.clientRating}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {order.package} Package
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-text-secondary">Progress</span>
                        <span className="font-semibold text-text-primary">{order.progress}%</span>
                      </div>
                      <div className="h-2.5 bg-bg-alt rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            order.progress === 100 ? "bg-green-500" : "bg-gradient-primary"
                          )}
                          style={{ width: `${order.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Deliverables */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {order.deliverables.map((item, idx) => (
                        <span
                          key={idx}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium",
                            item.completed 
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          )}
                        >
                          {item.completed ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {item.name}
                        </span>
                      ))}
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {order.deadline}</span>
                      </div>
                      {order.daysLeft > 0 ? (
                        <div className="flex items-center gap-1.5 text-primary">
                          <Timer className="w-4 h-4" />
                          <span className="font-medium">{order.daysLeft} days left</span>
                        </div>
                      ) : order.status !== "Completed" && (
                        <div className="flex items-center gap-1.5 text-red-500">
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-medium">{Math.abs(order.daysLeft)} days overdue</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4" />
                        <span>{order.messages} messages</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <RefreshCw className="w-4 h-4" />
                        <span>{order.revisionsUsed}/{order.revisions} revisions</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Price & Actions */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end gap-4 lg:gap-2 lg:min-w-[160px]">
                    <div className="text-right">
                      <p className="text-sm text-text-secondary">Order Value</p>
                      <p className="text-2xl font-bold text-primary font-mono">${order.price.toLocaleString()}</p>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {order.status === "In Progress" && (
                        <Link
                          href={`/dashboard/freelancer/orders/${order.id}/deliver`}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-amber text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
                        >
                          <Upload className="w-4 h-4" />
                          Deliver
                        </Link>
                      )}
                      {order.status === "Revision" && (
                        <Link
                          href={`/dashboard/freelancer/orders/${order.id}/deliver`}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-primary text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Submit Revision
                        </Link>
                      )}
                      <Link
                        href={`/dashboard/freelancer/orders/${order.id}`}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-text-primary hover:border-primary hover:bg-primary-light transition-all"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {filteredOrders.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-border">
            <div className="w-16 h-16 mx-auto rounded-full bg-bg-alt flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No orders found</h3>
            <p className="text-text-secondary mb-6">Start applying to gigs to get your first order</p>
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
