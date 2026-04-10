import Link from "next/link"
import { cn } from "@/lib/utils"
import { Zap } from "lucide-react"

interface LogoProps {
  showText?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
  linkClassName?: string
}

export function Logo({
  showText = true,
  size = "md",
  className,
  linkClassName,
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
      <span
        className={cn(
          "flex items-center justify-center rounded-2xl bg-[var(--gradient-primary)] shadow-[0_0_24px_var(--shadow-teal)] transition-transform group-hover:scale-[1.02]",
          sizeConfig.container,
          className
        )}
      >
        <Zap className={cn("text-white", sizeConfig.icon)} strokeWidth={2.5} />
      </span>

      {showText && (
        <span
          className={cn(
            "font-display font-bold tracking-tight text-[var(--text-primary)]",
            sizeConfig.text
          )}
        >
          Contractual
        </span>
      )}
    </Link>
  )
}

