import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { FreelancerShell } from "@/components/freelancer/freelancer-shell"

export default async function FreelancerLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")
  if (session.user.role !== "FREELANCER") redirect("/")

  return (
    <FreelancerShell
      user={{
        id: session.user.id,
        name: session.user.name ?? "Freelancer",
        email: session.user.email ?? "",
        image: session.user.image ?? null,
      }}
    >
      {children}
    </FreelancerShell>
  )
}
