import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { ApprovalStatus, Role } from "@prisma/client"
import { headers } from "next/headers"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"



import { getClientIp, rateLimit } from "./rate-limit"

const nextAuthInstance = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 }, // BUG-015 Fix: 24h session
  pages: { signIn: "/auth/register" },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // BUG-009 Fix: Login Rate Limit
        const ip = await getClientIp()
        const rl = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000) // 5 per 15 min
        if (!rl.success) {
          throw new Error("Too many failed attempts. Please try again in 15 minutes.")
        }

        const email = (credentials?.email as string | undefined)?.toLowerCase().trim()
        const password = credentials?.password as string | undefined
        if (!email || !password) return null
        
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user?.passwordHash) return null
        
        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image ?? undefined,
          role: String(user.role),
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) return true
      const db = await prisma.user.findUnique({
        where: { email: user.email },
        select: {
          role: true,
          approvalStatus: true,
          rejectionReason: true,
          email: true,
        },
      })
      if (!db) return true
      if (db.role === Role.BUSINESS) {
        if (db.approvalStatus === ApprovalStatus.PENDING) {
          return `/auth/pending-approval?email=${encodeURIComponent(db.email)}`
        }
        if (db.approvalStatus === ApprovalStatus.REJECTED) {
          const q = new URLSearchParams({
            error: "rejected",
            reason: db.rejectionReason ?? "",
          })
          return `/auth/signin?${q.toString()}`
        }
        if (db.approvalStatus === ApprovalStatus.SUSPENDED) {
          return `/auth/signin?error=suspended`
        }
      }
      return true
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.sub = user.id
        token.role =
          typeof (user as { role?: unknown }).role === "string"
            ? (user as { role: string }).role
            : String((user as { role?: { toString: () => string } }).role ?? "FREELANCER")
        token.approvalStatus = (user as { approvalStatus?: string }).approvalStatus ?? "APPROVED"
      }
      if (trigger === "signIn" && user?.email && !("role" in user && (user as { role?: string }).role)) {
        const db = await prisma.user.findUnique({ where: { email: user.email! } })
        if (db) {
          token.role = String(db.role)
          token.approvalStatus = String(db.approvalStatus)
          token.id = db.id
          token.sub = db.id
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as string) ?? "FREELANCER"
        session.user.approvalStatus = (token.approvalStatus as string) ?? "APPROVED"
      }
      return session
    },
  },
})

const nextAuthAuth = nextAuthInstance.auth
export const { handlers, signIn, signOut } = nextAuthInstance

async function authWithBearerFallback() {
  const session = await nextAuthAuth()
  if (session?.user?.id) return session

  try {
    const h = await headers()
    const authHeader = h.get("authorization") ?? h.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) return session

    const token = authHeader.slice("Bearer ".length).trim()
    if (!token) return session

    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) return session

    const decoded = jwt.verify(token, secret) as {
      id?: string
      sub?: string
      email?: string
      role?: string
    }

    const userId = decoded.sub ?? decoded.id
    if (!userId) return session

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        approvalStatus: true,
      },
    })

    if (!user) return session

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image ?? undefined,
        role: String(user.role),
        approvalStatus: String(user.approvalStatus ?? ApprovalStatus.APPROVED),
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }
  } catch {
    return session
  }
}

export const auth = ((...args: unknown[]) => {
  if (args.length > 0) {
    return (nextAuthAuth as (...inner: unknown[]) => unknown)(...args)
  }
  return authWithBearerFallback()
}) as typeof nextAuthAuth

import { cache } from 'react'
export const getCurrentUser = cache(async () => {
  const session = await auth()
  return session?.user ?? null
})

export const getCurrentUserId = cache(async () => {
  const user = await getCurrentUser()
  return user?.id ?? null
})
