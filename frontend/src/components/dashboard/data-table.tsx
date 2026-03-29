"use client"

import { cn } from "@/lib/utils"
import { MoreHorizontal, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface DataTableProps {
  columns: {
    key: string
    label: string
    width?: string
    align?: "left" | "center" | "right"
    render?: (value: any, row: any) => React.ReactNode
  }[]
  data: any[]
  onRowClick?: (row: any) => void
  emptyMessage?: string
}

export function DataTable({ columns, data, onRowClick, emptyMessage = "No data available" }: DataTableProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-bg-alt flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-text-secondary">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider",
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right",
                  !column.align && "text-left"
                )}
                style={{ width: column.width }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "hover:bg-bg-alt transition-colors",
                onRowClick && "cursor-pointer"
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "px-4 py-4 text-sm",
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right"
                  )}
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface StatusBadgeProps {
  status: string
  variant?: "default" | "success" | "warning" | "error" | "info"
}

export function StatusBadge({ status, variant = "default" }: StatusBadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    error: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  }

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
      variants[variant]
    )}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        variant === "success" && "bg-green-500",
        variant === "warning" && "bg-amber-500",
        variant === "error" && "bg-red-500",
        variant === "info" && "bg-blue-500",
        variant === "default" && "bg-gray-500"
      )} />
      {status}
    </span>
  )
}

interface AvatarGroupProps {
  avatars: { name: string; image?: string }[]
  max?: number
  size?: "sm" | "md" | "lg"
}

export function AvatarGroup({ avatars, max = 4, size = "md" }: AvatarGroupProps) {
  const displayed = avatars.slice(0, max)
  const remaining = avatars.length - max

  const sizes = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  }

  return (
    <div className="flex -space-x-2">
      {displayed.map((avatar, index) => (
        <div
          key={index}
          className={cn(
            "rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium ring-2 ring-white",
            sizes[size]
          )}
          title={avatar.name}
        >
          {avatar.image ? (
            <div className="relative h-full w-full overflow-hidden rounded-full">
              <Image
                src={avatar.image}
                alt={avatar.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
          ) : (
            avatar.name.split(" ").map(n => n[0]).join("").slice(0, 2)
          )}
        </div>
      ))}
      {remaining > 0 && (
        <div className={cn(
          "rounded-full bg-bg-alt flex items-center justify-center text-text-secondary font-medium ring-2 ring-white",
          sizes[size]
        )}>
          +{remaining}
        </div>
      )}
    </div>
  )
}

interface ActivityItemProps {
  icon: React.ReactNode
  title: string
  description: string
  time: string
  iconBg?: string
}

export function ActivityItem({ icon, title, description, time, iconBg = "bg-primary/10" }: ActivityItemProps) {
  return (
    <div className="flex gap-4 py-4 border-b border-border last:border-0">
      <div className={cn("p-2.5 rounded-xl h-fit", iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        <p className="text-sm text-text-secondary mt-0.5 truncate">{description}</p>
      </div>
      <span className="text-xs text-text-secondary whitespace-nowrap">{time}</span>
    </div>
  )
}

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="w-20 h-20 rounded-2xl bg-bg-alt flex items-center justify-center mb-6">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary max-w-sm mb-6">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-xl font-medium hover:shadow-lg hover:shadow-shadow-teal transition-all duration-300"
        >
          {action.label}
          <ExternalLink className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}
