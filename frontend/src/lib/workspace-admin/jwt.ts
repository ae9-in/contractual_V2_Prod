import { SignJWT, jwtVerify } from "jose"

export const ADMIN_SESSION_COOKIE = "admin-session"

function getSecretKey(): Uint8Array {
  const s = process.env.ADMIN_SECRET_KEY
  if (!s) {
    throw new Error("ADMIN_SECRET_KEY is required but not set.")
  }
  return new TextEncoder().encode(s)
}

export async function signAdminToken(email: string): Promise<string> {
  return new SignJWT({ role: "ADMIN", email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecretKey())
}

export async function verifyAdminToken(token: string) {
  const { payload } = await jwtVerify(token, getSecretKey())
  if (payload.role !== "ADMIN") throw new Error("Invalid admin token")
  return payload as { role: "ADMIN"; email: string; exp?: number; iat?: number }
}
