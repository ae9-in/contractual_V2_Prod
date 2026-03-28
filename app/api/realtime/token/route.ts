import jwt from "jsonwebtoken"
import { auth } from "@/auth"
import { jsonErr, jsonOk } from "@/lib/api-response"

export const runtime = "nodejs"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return jsonErr("Unauthorized", 401)
  }
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    return jsonErr("Server misconfiguration", 500)
  }

  const token = jwt.sign(
    {
      sub: session.user.id,
      role: session.user.role ?? "FREELANCER",
    },
    secret,
    { expiresIn: "2h" }
  )

  return jsonOk({ token })
}
