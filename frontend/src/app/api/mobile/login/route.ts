import { handleMobileLogin } from "@/lib/mobile-auth-login"

export async function POST(req: Request) {
  return handleMobileLogin(req)
}
