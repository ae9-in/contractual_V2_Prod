"use client"

import type { ReactNode } from "react"
import { FreelancerTopNav } from "./freelancer-top-nav"

export type FreelancerUser = {
  id: string
  name: string
  email: string
  image: string | null
}

export function FreelancerShell({
  children,
  user,
}: {
  children: ReactNode
  user: FreelancerUser
}) {
  return (
    <div className="min-h-screen bg-[#f4f6f9] font-sans text-[#0f172a] antialiased">
      <FreelancerTopNav user={user} />
      <div className="mx-auto max-w-[1280px] px-4 pb-8 pt-[76px] md:px-8">{children}</div>
    </div>
  )
}
