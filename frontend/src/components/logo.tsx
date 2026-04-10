import Link from "next/link"
import { cn } from "@/lib/utils"

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
        <svg
          viewBox="0 0 200 200"
          className={cn("text-white", sizeConfig.icon)}
          fill="currentColor"
          aria-hidden
        >
          {/* Purple hand */}
          <path
            d="M60 80c-8 0-15 7-15 15v20c0 8 7 15 15 15h10c4 0 8-2 10-5l20 30c2 3 6 5 10 5h5c8 0 15-7 15-15v-10l30-45c3-4 8-7 13-7 8 0 15 7 15 15v30c0 8-7 15-15 15h-20"
            fill="#6839CC"
          />

          {/* Orange accent curve */}
          <path
            d="M130 50c15 0 28 12 28 27v15c0 15-13 27-28 27"
            stroke="#FFA726"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />

          {/* Orange accent marks */}
          <g fill="#FFA726">
            <rect x="85" y="110" width="8" height="20" rx="4" />
            <rect x="100" y="115" width="8" height="25" rx="4" />
            <circle cx="115" cy="125" r="6" />
          </g>
        </svg>
      </span>

      {showText && (
        <span
          className={cn(
            "font-display font-bold tracking-tight text-white",
            sizeConfig.text
          )}
        >
          Contractual
        </span>
      )}
    </Link>
  )
}
