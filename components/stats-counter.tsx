"use client"

import { useEffect, useState, useRef } from "react"

interface StatItem {
  value: string
  numericValue: number
  suffix?: string
  prefix?: string
  label: string
}

interface StatsCounterProps {
  stats: StatItem[]
}

function useCountUp(end: number, duration: number = 2000, startCounting: boolean) {
  const [count, setCount] = useState(0)
  const countRef = useRef(0)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (!startCounting) return

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1)
      
      // Easing function for smooth count
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      countRef.current = Math.floor(easeOutQuart * end)
      setCount(countRef.current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration, startCounting])

  return count
}

function StatNumber({ stat, isVisible }: { stat: StatItem; isVisible: boolean }) {
  const count = useCountUp(stat.numericValue, 2000, isVisible)

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1)
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(num >= 10000 ? 0 : 1)
    }
    return num.toString()
  }

  const getSuffix = () => {
    if (stat.numericValue >= 1000000) return "M+"
    if (stat.numericValue >= 1000) return "K+"
    return stat.suffix || "+"
  }

  return (
    <span className="font-stat text-[var(--primary)] text-2xl md:text-[28px] font-bold">
      {stat.prefix || ""}
      {formatNumber(count)}
      {getSuffix()}
    </span>
  )
}

export function StatsCounter({ stats }: StatsCounterProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="w-full border-t border-b border-[var(--border)] bg-gradient-to-b from-[var(--bg-alt)] to-[var(--bg-main)] py-8 md:py-10"
    >
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-center md:justify-between flex-wrap gap-8">
          {stats.map((stat, index) => (
            <div key={stat.label} className="flex items-center gap-8">
              <div className="flex flex-col items-center md:items-start">
                <StatNumber stat={stat} isVisible={isVisible} />
                <span className="text-[var(--text-secondary)] text-sm mt-1">{stat.label}</span>
              </div>
              {index < stats.length - 1 && (
                <div className="hidden md:block w-px h-12 bg-[var(--border)]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
