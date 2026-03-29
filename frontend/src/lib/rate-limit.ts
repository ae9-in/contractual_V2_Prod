import { headers } from "next/headers"

type RateLimitEntry = {
  count: number
  firstAt: number
}

const store = new Map<string, RateLimitEntry>()

export async function getClientIp(): Promise<string> {
  const h = await headers()
  const xf = h.get("x-forwarded-for")
  if (xf) return xf.split(",")[0]!.trim()
  const ri = h.get("x-real-ip")
  if (ri) return ri.trim()
  return "unknown"
}

/**
 * Simple in-memory rate limiter.
 * @param key Unique key for the action (e.g. `login:1.2.3.4`)
 * @param limit Max attempts allowed in the window
 * @param windowMs Time window in milliseconds
 * @returns { success: boolean, remaining: number, reset: number }
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  let entry = store.get(key)

  if (!entry || now - entry.firstAt > windowMs) {
    entry = { count: 0, firstAt: now }
  }

  entry.count += 1
  store.set(key, entry)

  const success = entry.count <= limit
  const reset = entry.firstAt + windowMs
  const remaining = Math.max(0, limit - entry.count)

  return { success, remaining, reset }
}

export function clearRateLimit(key: string) {
  store.delete(key)
}
