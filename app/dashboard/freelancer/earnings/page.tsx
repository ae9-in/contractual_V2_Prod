"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { cn } from "@/lib/utils"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Clock,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Building,
  RefreshCw,
  ChevronRight,
  Filter,
  Search,
} from "lucide-react"

const earningsData = {
  totalEarnings: 12840,
  availableBalance: 4250,
  pendingClearance: 2400,
  withdrawn: 6190,
  thisMonth: 3240,
  lastMonth: 2890,
}

const monthlyEarnings = [
  { month: "Oct", amount: 2100 },
  { month: "Nov", amount: 2450 },
  { month: "Dec", amount: 3200 },
  { month: "Jan", amount: 2890 },
  { month: "Feb", amount: 2960 },
  { month: "Mar", amount: 3240 },
]

const transactions = [
  { id: 1, type: "earning", description: "Full-Stack Web Application - TechCorp", amount: 2400, status: "Completed", date: "Mar 25, 2025", clearanceDate: "Apr 8, 2025" },
  { id: 2, type: "withdrawal", description: "Withdrawal to Bank Account", amount: -1500, status: "Completed", date: "Mar 20, 2025", clearanceDate: null },
  { id: 3, type: "earning", description: "UI/UX Design - DesignHive", amount: 1800, status: "Pending Clearance", date: "Mar 18, 2025", clearanceDate: "Apr 1, 2025" },
  { id: 4, type: "earning", description: "SEO Optimization - MarketEdge", amount: 650, status: "Completed", date: "Mar 15, 2025", clearanceDate: null },
  { id: 5, type: "withdrawal", description: "Withdrawal to PayPal", amount: -2000, status: "Completed", date: "Mar 10, 2025", clearanceDate: null },
  { id: 6, type: "earning", description: "API Integration - FinTech Startup", amount: 1200, status: "Completed", date: "Mar 8, 2025", clearanceDate: null },
  { id: 7, type: "earning", description: "WordPress Development - BlogMaster", amount: 800, status: "Completed", date: "Mar 5, 2025", clearanceDate: null },
  { id: 8, type: "refund", description: "Order Cancellation Refund", amount: -150, status: "Completed", date: "Mar 2, 2025", clearanceDate: null },
]

const withdrawalMethods = [
  { id: 1, type: "bank", name: "Chase Bank ****4523", icon: Building, default: true },
  { id: 2, type: "paypal", name: "alex.johnson@email.com", icon: CreditCard, default: false },
]

export default function FreelancerEarningsPage() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year" | "all">("month")
  const [transactionFilter, setTransactionFilter] = useState<"all" | "earnings" | "withdrawals">("all")

  const filteredTransactions = transactions.filter(t => {
    if (transactionFilter === "all") return true
    if (transactionFilter === "earnings") return t.type === "earning"
    if (transactionFilter === "withdrawals") return t.type === "withdrawal" || t.type === "refund"
    return true
  })

  const growthPercentage = ((earningsData.thisMonth - earningsData.lastMonth) / earningsData.lastMonth * 100).toFixed(1)

  return (
    <DashboardLayout userType="freelancer" userName="Alex Johnson">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">Earnings</h1>
            <p className="text-text-secondary mt-1">Track your income and manage withdrawals</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white rounded-xl border border-border p-1">
              {["week", "month", "year", "all"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range as any)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    timeRange === range
                      ? "bg-gradient-primary text-white shadow-md"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {range === "all" ? "All Time" : range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Available Balance */}
        <div className="bg-gradient-primary p-6 rounded-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Available</span>
            </div>
            <p className="text-sm text-white/70">Available Balance</p>
            <p className="text-3xl font-bold font-mono mt-1">${earningsData.availableBalance.toLocaleString()}</p>
            <button className="mt-4 w-full py-2.5 bg-white text-primary rounded-xl font-medium hover:bg-white/90 transition-colors">
              Withdraw Funds
            </button>
          </div>
        </div>

        {/* Pending Clearance */}
        <div className="bg-white p-6 rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-amber-100">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">Pending</span>
          </div>
          <p className="text-sm text-text-secondary">Pending Clearance</p>
          <p className="text-2xl font-bold text-text-primary font-mono mt-1">${earningsData.pendingClearance.toLocaleString()}</p>
          <p className="text-xs text-text-secondary mt-2">Clears within 14 days</p>
        </div>

        {/* This Month */}
        <div className="bg-white p-6 rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-green-100">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className={cn(
              "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium",
              Number(growthPercentage) >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            )}>
              {Number(growthPercentage) >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(Number(growthPercentage))}%
            </span>
          </div>
          <p className="text-sm text-text-secondary">This Month</p>
          <p className="text-2xl font-bold text-text-primary font-mono mt-1">${earningsData.thisMonth.toLocaleString()}</p>
          <p className="text-xs text-text-secondary mt-2">vs ${earningsData.lastMonth.toLocaleString()} last month</p>
        </div>

        {/* Total Earnings */}
        <div className="bg-white p-6 rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <IndianRupee className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">All Time</span>
          </div>
          <p className="text-sm text-text-secondary">Total Earnings</p>
          <p className="text-2xl font-bold text-text-primary font-mono mt-1">${earningsData.totalEarnings.toLocaleString()}</p>
          <p className="text-xs text-text-secondary mt-2">${earningsData.withdrawn.toLocaleString()} withdrawn</p>
        </div>
      </div>

      {/* Charts & Transactions Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Earnings Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary">Earnings Overview</h2>
            <button className="flex items-center gap-2 text-sm text-primary font-medium hover:text-primary-dark transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
          
          {/* Simple Bar Chart */}
          <div className="h-64 flex items-end gap-4">
            {monthlyEarnings.map((item, index) => {
              const maxAmount = Math.max(...monthlyEarnings.map(m => m.amount))
              const height = (item.amount / maxAmount) * 100
              const isCurrentMonth = index === monthlyEarnings.length - 1
              
              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center">
                    <span className="text-xs font-medium text-text-primary mb-1">
                      ${(item.amount / 1000).toFixed(1)}k
                    </span>
                    <div
                      className={cn(
                        "w-full rounded-t-lg transition-all duration-500 hover:opacity-80",
                        isCurrentMonth ? "bg-gradient-primary" : "bg-primary/30"
                      )}
                      style={{ height: `${height * 2}px` }}
                    />
                  </div>
                  <span className={cn(
                    "text-xs font-medium",
                    isCurrentMonth ? "text-primary" : "text-text-secondary"
                  )}>
                    {item.month}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Withdrawal Methods */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary">Withdrawal Methods</h2>
            <button className="text-sm text-primary font-medium hover:text-primary-dark transition-colors">
              + Add New
            </button>
          </div>
          
          <div className="space-y-3">
            {withdrawalMethods.map((method) => (
              <div
                key={method.id}
                className={cn(
                  "p-4 rounded-xl border transition-all cursor-pointer",
                  method.default 
                    ? "border-primary bg-primary-light" 
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2.5 rounded-lg",
                    method.default ? "bg-primary/20" : "bg-bg-alt"
                  )}>
                    <method.icon className={cn(
                      "w-5 h-5",
                      method.default ? "text-primary" : "text-text-secondary"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{method.name}</p>
                    <p className="text-xs text-text-secondary capitalize">{method.type}</p>
                  </div>
                  {method.default && (
                    <span className="text-xs bg-primary text-white px-2 py-1 rounded-full font-medium">
                      Default
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button className="mt-4 w-full py-3 bg-gradient-primary text-white rounded-xl font-medium hover:shadow-lg hover:shadow-shadow-teal transition-all">
            Withdraw ${earningsData.availableBalance.toLocaleString()}
          </button>
          <p className="text-xs text-center text-text-secondary mt-2">
            Processing takes 3-5 business days
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-lg font-semibold text-text-primary">Transaction History</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="h-10 pl-10 pr-4 rounded-lg bg-bg-alt border border-transparent focus:border-primary focus:bg-white text-sm w-64"
                />
              </div>
              <div className="flex items-center bg-bg-alt rounded-lg p-1">
                {[
                  { key: "all", label: "All" },
                  { key: "earnings", label: "Earnings" },
                  { key: "withdrawals", label: "Withdrawals" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setTransactionFilter(tab.key as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                      transactionFilter === tab.key
                        ? "bg-white shadow text-text-primary"
                        : "text-text-secondary hover:text-text-primary"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-bg-alt/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-bg-alt/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        transaction.type === "earning" ? "bg-green-100" :
                        transaction.type === "withdrawal" ? "bg-blue-100" : "bg-red-100"
                      )}>
                        {transaction.type === "earning" ? (
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                        ) : transaction.type === "withdrawal" ? (
                          <ArrowDownRight className="w-4 h-4 text-blue-600" />
                        ) : (
                          <RefreshCw className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{transaction.description}</p>
                        {transaction.clearanceDate && (
                          <p className="text-xs text-text-secondary mt-0.5">Clears: {transaction.clearanceDate}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-secondary">{transaction.date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
                      transaction.status === "Completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {transaction.status === "Completed" ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn(
                      "text-sm font-bold font-mono",
                      transaction.amount > 0 ? "text-green-600" : "text-text-primary"
                    )}>
                      {transaction.amount > 0 ? "+" : ""}{transaction.amount < 0 ? "-" : ""}${Math.abs(transaction.amount).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-text-secondary">Showing {filteredTransactions.length} transactions</p>
          <button className="text-sm text-primary font-medium hover:text-primary-dark transition-colors">
            Load More
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
