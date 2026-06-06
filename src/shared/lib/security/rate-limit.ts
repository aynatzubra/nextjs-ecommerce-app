import { RATE_LIMIT_CLEANUP_INTERVAL, RATE_LIMIT_MAX_STORE_SIZE } from '@/shared/lib/security/constants'

type Entry = {
  count: number
  expiresAt: number
}

const store = new Map<string, Entry>()
let lastCleanup = Date.now()

export class RateLimitError extends Error {
  constructor() {
    super('RATE_LIMIT_EXCEEDED')
  }
}

function cleanupExpired(now: number) {
  lastCleanup = now
  
  for (const [key, value] of store.entries()) {
    if (value.expiresAt <= now) {
      store.delete(key)
    }
  }
}

export function clearRateLimitStore() {
  store.clear()
  lastCleanup = Date.now()
}

export function getRateLimitStoreSize() {
  return store.size
}

export async function rateLimit({
                                  key,
                                  limit,
                                  windowMs,
                                }: {
  key: string
  limit: number
  windowMs: number
}) {
  const now = Date.now()
  
  // CPU protection: clear strictly once per minute (O(N) isolated)
  if (now - lastCleanup >= RATE_LIMIT_CLEANUP_INTERVAL) {
    cleanupExpired(now)
  }
  
  const existing = store.get(key)
  
  // Memory protection + fail-close: if we are clogged and the key is new
  if (!existing && store.size >= RATE_LIMIT_MAX_STORE_SIZE) {
    throw new RateLimitError()
  }
  
  if (!existing || existing.expiresAt < now) {
    store.set(key, { count: 1, expiresAt: now + windowMs })
    return
  }
  
  if (existing.count >= limit) {
    throw new RateLimitError()
  }
  
  existing.count += 1
  store.set(key, existing)
}