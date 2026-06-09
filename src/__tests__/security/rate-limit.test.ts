import {
  clearRateLimitStore,
  getRateLimitStoreSize,
  rateLimit,
  RateLimitError,
} from '@/shared/lib/security/rate-limit'

import { RATE_LIMIT_CLEANUP_INTERVAL, RATE_LIMIT_MAX_STORE_SIZE } from '@/shared/lib/security/constants'

describe('rateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
    clearRateLimitStore()
    vi.clearAllMocks()
  })
  
  afterEach(() => {
    vi.useRealTimers()
    clearRateLimitStore()
  })
  
  it('allows first request', async () => {
    await expect(
      rateLimit({
        key: 'login:user1',
        limit: 5,
        windowMs: 60_000,
      }),
    ).resolves.toBeUndefined()
    
    expect(getRateLimitStoreSize()).toBe(1)
  })
  
  it('throws RateLimitError when limit is exceeded', async () => {
    for (let i = 0; i < 5; i++) {
      await rateLimit({
        key: 'login:user1',
        limit: 5,
        windowMs: 60_000,
      })
    }
    
    await expect(
      rateLimit({
        key: 'login:user1',
        limit: 5,
        windowMs: 60_000,
      }),
    ).rejects.toBeInstanceOf(RateLimitError)
  })
  
  it('isolates different keys', async () => {
    for (let i = 0; i < 5; i++) {
      await rateLimit({
        key: 'login:user1',
        limit: 5,
        windowMs: 60_000,
      })
    }
    
    await expect(
      rateLimit({
        key: 'login:user2',
        limit: 5,
        windowMs: 60_000,
      }),
    ).resolves.toBeUndefined()
    
    expect(getRateLimitStoreSize()).toBe(2)
  })
  
  it('resets counter after window expiration', async () => {
    await rateLimit({
      key: 'login:user1',
      limit: 1,
      windowMs: 1_000,
    })
    
    await expect(
      rateLimit({
        key: 'login:user1',
        limit: 1,
        windowMs: 1_000,
      }),
    ).rejects.toBeInstanceOf(RateLimitError)
    
    vi.advanceTimersByTime(1001)
    
    await expect(
      rateLimit({
        key: 'login:user1',
        limit: 1,
        windowMs: 1_000,
      }),
    ).resolves.toBeUndefined()
  })
  
  it('clearRateLimitStore resets all limits', async () => {
    await rateLimit({
      key: 'login:user1',
      limit: 1,
      windowMs: 60_000,
    })
    
    expect(getRateLimitStoreSize()).toBe(1)
    
    clearRateLimitStore()
    
    expect(getRateLimitStoreSize()).toBe(0)
    
    await expect(
      rateLimit({
        key: 'login:user1',
        limit: 1,
        windowMs: 60_000,
      }),
    ).resolves.toBeUndefined()
  })
  
  it('fails closed when store reaches MAX_STORE_SIZE and new key arrives', async () => {
    for (let i = 0; i < RATE_LIMIT_MAX_STORE_SIZE; i++) {
      await rateLimit({
        key: `key-${i}`,
        limit: 5,
        windowMs: 60_000,
      })
    }
    
    expect(getRateLimitStoreSize()).toBe(RATE_LIMIT_MAX_STORE_SIZE)
    
    await expect(
      rateLimit({
        key: 'new-key',
        limit: 5,
        windowMs: 60_000,
      }),
    ).rejects.toBeInstanceOf(RateLimitError)
  })
  
  it('allows existing key even when store is full', async () => {
    for (let i = 0; i < RATE_LIMIT_MAX_STORE_SIZE; i++) {
      await rateLimit({
        key: `key-${i}`,
        limit: 5,
        windowMs: 60_000,
      })
    }
    
    await expect(
      rateLimit({
        key: 'key-0',
        limit: 5,
        windowMs: 60_000,
      }),
    ).resolves.toBeUndefined()
  })
  
  it('triggers cleanup of expired entries after cleanup interval', async () => {
    await rateLimit({
      key: 'short-lived-key',
      limit: 5,
      windowMs: 1_000,
    })
    
    await rateLimit({
      key: 'long-lived-key',
      limit: 5,
      windowMs: RATE_LIMIT_CLEANUP_INTERVAL * 2,
    })
    
    expect(getRateLimitStoreSize()).toBe(2)
    
    vi.advanceTimersByTime(RATE_LIMIT_CLEANUP_INTERVAL + 1)
    
    await rateLimit({
      key: 'trigger-key',
      limit: 5,
      windowMs: 60_000,
    })
    
    expect(getRateLimitStoreSize()).toBe(2)
  })
})