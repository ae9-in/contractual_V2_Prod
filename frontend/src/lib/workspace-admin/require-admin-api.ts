import { cookies } from "next/headers"
import { ADMIN_SESSION_COOKIE, verifyAdminToken } from "./jwt"

export async function requireWorkspaceAdmin() {
  const jar = await cookies()
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) return { ok: false as const, error: "Unauthorized" }
  try {
    const payload = await verifyAdminToken(token)
    return { ok: true as const, email: payload.email }
  } catch {
    return { ok: false as const, error: "Invalid session" }
  }
}
