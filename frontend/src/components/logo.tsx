import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  showText?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
  linkClassName?: string
  textColorClassName?: string
}

export function Logo({
  showText = true,
  size = "md",
  className,
  linkClassName,
  textColorClassName = "text-[var(--text-primary)]",
}: LogoProps) {
  const sizes = {
    sm: { icon: "h-7 w-7", text: "text-lg", container: "h-8 w-8" },
    md: { icon: "h-9 w-9", text: "text-xl", container: "h-10 w-10" },
    lg: { icon: "h-11 w-11", text: "text-2xl", container: "h-12 w-12" },
  }

  const sizeConfig = sizes[size]

  return (
    <Link
      href="/"
      className={cn("group flex shrink-0 items-center gap-2.5", linkClassName)}
    >
      <div
        className={cn(
          "relative flex items-center justify-center transition-transform group-hover:scale-[1.05]",
          sizeConfig.container,
          className
        )}
      >
        <Image
          src="/WhatsApp_Image_2026-04-10_at_2.50.59_PM-removebg-preview.png"
          alt="Contractual Logo"
          fill
          className="object-contain"
          priority
        />
      </div>

      {showText && (
        <span
          className={cn(
            "font-display font-bold tracking-tight",
            textColorClassName,
            sizeConfig.text
          )}
        >
          Contractual
        </span>
      )}
    </Link>
  )
}

