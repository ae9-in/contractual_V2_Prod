"use client"

import { cn } from "@/lib/utils"
import { LucideIcon, TrendingUp, TrendingDown, ArrowRight } from "lucide-react"
import Link from "next/link"

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  href?: string
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = "vs last month",
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  href,
}: StatCardProps) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  const content = (
    <div className="group relative bg-white rounded-2xl border border-border p-6 hover:border-primary hover:shadow-xl hover:shadow-shadow-teal transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className={cn("p-3 rounded-xl", iconBg)}>
            <Icon className={cn("w-6 h-6", iconColor)} />
          </div>
          {href && (
            <ArrowRight className="w-5 h-5 text-text-secondary opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300" />
          )}
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="text-3xl font-bold text-text-primary mt-1 font-mono">{value}</p>
        </div>

        {change !== undefined && (
          <div className="flex items-center gap-2 mt-3">
            <span className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
              isPositive && "bg-green-100 text-green-700",
              isNegative && "bg-red-100 text-red-700",
              !isPositive && !isNegative && "bg-gray-100 text-gray-700"
            )}>
              {isPositive && <TrendingUp className="w-3 h-3" />}
              {isNegative && <TrendingDown className="w-3 h-3" />}
              {isPositive && "+"}
              {change}%
            </span>
            <span className="text-xs text-text-secondary">{changeLabel}</span>
          </div>
        )}
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}

interface MiniStatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: "up" | "down" | "neutral"
}

export function MiniStatCard({ label, value, icon: Icon, trend }: MiniStatCardProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-bg-alt rounded-xl">
      <div className="p-2.5 rounded-lg bg-white border border-border">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-text-secondary">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold text-text-primary font-mono">{value}</p>
          {trend && (
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              trend === "up" && "bg-green-500",
              trend === "down" && "bg-red-500",
              trend === "neutral" && "bg-gray-400"
            )} />
          )}
        </div>
      </div>
    </div>
  )
}

interface ProgressStatProps {
  label: string
  value: number
  max: number
  color?: string
}

export function ProgressStat({ label, value, max, color = "bg-primary" }: ProgressStatProps) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">{label}</span>
        <span className="font-semibold text-text-primary">{value}/{max}</span>
      </div>
      <div className="h-2 bg-bg-alt rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
