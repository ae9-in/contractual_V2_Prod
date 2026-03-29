type CacheEntry<T> = {
  data: T
  expiry: number
}

const cache = new Map<string, CacheEntry<any>>()

/**
 * Simple in-memory cache with TTL.
 * Default TTL: 60 seconds.
 */
export function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiry) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

export function setCached<T>(key: string, data: T, ttlSeconds = 60): void {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlSeconds * 1000
  })
}

export function clearCache(key?: string): void {
  if (key) cache.delete(key)
  else cache.clear()
}
