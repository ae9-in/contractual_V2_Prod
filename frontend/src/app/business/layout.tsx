import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { BusinessShell } from "@/components/dashboard/business-shell"

export default async function BusinessLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()
  
  if (!user) return null

  return (
    <BusinessShell
      user={{
        name: user.name ?? "Business",
        email: user.email ?? "",
        image: user.image ?? null,
      }}
    >
      {children}
    </BusinessShell>
  )
}
