import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { FreelancerShell } from "@/components/freelancer/freelancer-shell"

export default async function FreelancerLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()
  
  // Middleware handles redirection; layout only needs to pass cached user
  if (!user) return null

  return (
    <FreelancerShell
      user={{
        id: user.id,
        name: user.name ?? "Freelancer",
        email: user.email ?? "",
        image: user.image ?? null,
      }}
    >
      {children}
    </FreelancerShell>
  )
}
