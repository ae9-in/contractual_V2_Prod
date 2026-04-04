import { handleMobileLogin } from "@/lib/mobile-auth-login";

/** Prefer `/api/mobile/login` in production — NextAuth's `/api/auth/*` catch‑all can intercept this path. */
export async function POST(req: Request) {
  return handleMobileLogin(req);
}
