import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

/** Shared handler so login works outside `/api/auth/*` (avoids NextAuth catch-all). */
export async function handleMobileLogin(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => null)
    const email = typeof body?.email === "string" ? body.email.trim() : ""
    const password = typeof body?.password === "string" ? body.password : ""
    const role = body?.role

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required", error: "Email and password are required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })
    console.log(`[handleMobileLogin] User lookup for ${email}: ${user ? 'Found' : 'Not Found'}`);

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials", error: "Invalid credentials" },
        { status: 401 }
      )
    }

    const normalizedRole = typeof role === "string" ? role.toUpperCase().trim() : undefined
    if (normalizedRole && String(user.role) !== normalizedRole) {
      console.log(`[handleMobileLogin] Role mismatch: User=${user.role}, Request=${normalizedRole}`);
      return NextResponse.json(
        { success: false, message: "Unauthorized role", error: "Unauthorized role" },
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    console.log(`[handleMobileLogin] Password match for ${email}: ${isValid}`);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials", error: "Invalid credentials" },
        { status: 401 }
      )
    }

    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      return NextResponse.json(
        { success: false, message: "Server configuration error", error: "Server configuration error" },
        { status: 500 }
      )
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: String(user.role),
      },
      secret,
      { expiresIn: "30d", subject: user.id }
    )

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: String(user.role),
        image: user.image,
      },
    })
  } catch (error) {
    console.error("Mobile auth error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error", error: "Internal server error" },
      { status: 500 }
    )
  }
}
