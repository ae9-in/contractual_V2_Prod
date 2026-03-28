import { auth } from "@/auth"
import { NextResponse } from "next/server"

function homeForRole(role: string) {
  if (role === "ADMIN") return "/admin/dashboard"
  if (role === "BUSINESS") return "/business/dashboard"
  return "/freelancer/dashboard"
}

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ user: null, home: "/" })
  }
  const role = session.user.role ?? "FREELANCER"
  return NextResponse.json({
    user: session.user,
    home: homeForRole(role),
  })
}
