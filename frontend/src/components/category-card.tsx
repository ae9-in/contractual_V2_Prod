"use client"

import Image from "next/image"
import Link from "next/link"

interface CategoryCardProps {
  imageSrc: string
  imageAlt: string
  name: string
  gigCount: number
  href: string
}

export function CategoryCard({ imageSrc, imageAlt, name, gigCount, href }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden bg-white rounded-2xl border border-[var(--border)] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:bg-gradient-to-br hover:from-[var(--primary)] hover:to-[var(--primary-dark)] hover:border-transparent hover:shadow-[0_12px_36px_var(--shadow-teal)] hover:-translate-y-1 transition-all duration-250"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--bg-alt)]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80 group-hover:from-[var(--primary)]/40 group-hover:via-[var(--primary-dark)]/20 transition-opacity duration-250" />
      </div>
      <div className="flex flex-col items-center p-5 pt-4">
        <h3 className="text-base font-semibold text-[var(--text-primary)] group-hover:text-white transition-colors duration-250 text-center">
          {name}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] group-hover:text-white/80 transition-colors duration-250">
          {gigCount.toLocaleString()} gigs
        </p>
      </div>
    </Link>
  )
}
