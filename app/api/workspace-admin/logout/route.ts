import { NextResponse } from "next/server"
import { jsonOk } from "@/lib/api-response"
import { ADMIN_SESSION_COOKIE } from "@/lib/workspace-admin/jwt"

export async function POST() {
  const res = jsonOk({ success: true })
  res.cookies.delete(ADMIN_SESSION_COOKIE)
  return res
}
