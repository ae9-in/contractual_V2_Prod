import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { ApprovalStatus, Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

const googleProviders =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
    : []

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/auth/signin" },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
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
    ...googleProviders,
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
      }
      if (trigger === "signIn" && user?.email && !("role" in user && (user as { role?: string }).role)) {
        const db = await prisma.user.findUnique({ where: { email: user.email! } })
        if (db) {
          token.role = String(db.role)
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
      }
      return session
    },
  },
})
