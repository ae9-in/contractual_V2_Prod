import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { BusinessShell } from "@/components/dashboard/business-shell"

export default async function BusinessLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")
  if (session.user.role !== "BUSINESS") redirect("/")

  return (
    <BusinessShell
      user={{
        name: session.user.name ?? "Business",
        email: session.user.email ?? "",
        image: session.user.image ?? null,
      }}
    >
      {children}
    </BusinessShell>
  )
}
