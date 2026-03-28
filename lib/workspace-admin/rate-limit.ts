/** In-memory rate limit (single Node process). Resets on cold start. */

type Entry = { count: number; blockedUntil: number; firstAt: number }

const store = new Map<string, Entry>()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5
const BLOCK_MS = 15 * 60 * 1000

function key(ip: string) {
  return `admin-login:${ip}`
}

export function getClientIp(req: { headers: Headers }): string {
  const xf = req.headers.get("x-forwarded-for")
  if (xf) return xf.split(",")[0]!.trim()
  const ri = req.headers.get("x-real-ip")
  if (ri) return ri.trim()
  return "unknown"
}

export function getAdminLoginState(ip: string): {
  attempts: number
  blocked: boolean
  showCaptcha: boolean
} {
  const e = store.get(key(ip))
  const now = Date.now()
  if (!e) return { attempts: 0, blocked: false, showCaptcha: false }
  if (e.blockedUntil > now) {
    return { attempts: e.count, blocked: true, showCaptcha: e.count >= 3 }
  }
  if (now - e.firstAt > WINDOW_MS) {
    store.delete(key(ip))
    return { attempts: 0, blocked: false, showCaptcha: false }
  }
  return {
    attempts: e.count,
    blocked: false,
    showCaptcha: e.count >= 3,
  }
}

export function recordAdminLoginFailure(ip: string) {
  const k = key(ip)
  const now = Date.now()
  let e = store.get(k)
  if (!e || now - e.firstAt > WINDOW_MS) {
    e = { count: 0, blockedUntil: 0, firstAt: now }
  }
  e.count += 1
  if (e.count >= MAX_ATTEMPTS) {
    e.blockedUntil = now + BLOCK_MS
  }
  store.set(k, e)
}

export function resetAdminLoginAttempts(ip: string) {
  store.delete(key(ip))
}
