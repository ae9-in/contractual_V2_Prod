import { handleMobileLogin } from "@/lib/mobile-auth-login"

/**
 * Mobile app login — lives under `/api/app/*` (not `/api/auth/*`) so Auth.js
 * never intercepts the POST. Same DB + JWT as web users.
 */
export async function POST(req: Request) {
  return handleMobileLogin(req)
}
