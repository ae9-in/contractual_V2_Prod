import { Star } from "lucide-react"

interface TestimonialCardProps {
  name: string
  role: string
  type: "business" | "freelancer"
  avatar?: string
  rating: number
  quote: string
  company?: string
}

export function TestimonialCard({
  name,
  role,
  type,
  rating,
  quote,
  company,
}: TestimonialCardProps) {
  return (
    <div className="group bg-white rounded-2xl border border-[var(--border)] shadow-sm p-6 hover:shadow-lg hover:border-[var(--primary-light)] transition-all duration-300 relative overflow-hidden">
      {/* Left accent border */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--primary)]" />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center text-white font-semibold text-lg">
            {name.charAt(0)}
          </div>
          <div>
            <h4 className="font-semibold text-[var(--text-primary)]">{name}</h4>
            <p className="text-sm text-[var(--text-secondary)]">{role}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          type === "business" 
            ? "bg-[var(--primary-light)] text-[var(--primary-dark)]" 
            : "bg-amber-100 text-amber-700"
        }`}>
          {type === "business" ? "Business Owner" : "Freelancer"}
        </span>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Quote */}
      <p className="text-[var(--text-primary)] text-[15px] italic leading-relaxed mb-4">
        &ldquo;{quote}&rdquo;
      </p>

      {/* Company/skill tag */}
      {company && (
        <span className="inline-block px-3 py-1 bg-[var(--bg-alt)] text-[var(--text-secondary)] text-sm rounded-full">
          {company}
        </span>
      )}
    </div>
  )
}
