import { beforeEach, describe, expect, it, vi } from 'vitest'
import { rateLimitKeys } from '@/shared/lib/security/rate-limit-keys'

const { rateLimitMock } = vi.hoisted(() => ({
  rateLimitMock: vi.fn(),
}))

vi.mock('@/shared/lib/security/rate-limit', () => ({
  RateLimitError: class RateLimitError extends Error {
  },
  rateLimit: rateLimitMock,
}))

const {
  enforceLoginRateLimits,
} = await import(
  '@/features/auth/services/enforceLoginRateLimits.service'
  )

describe('enforceLoginRateLimits', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })
  
  it('applies both IP and email rate limits', async () => {
    await enforceLoginRateLimits(
      'user@mail.com',
      '127.0.0.1',
    )
    
    expect(rateLimitMock).toHaveBeenCalledTimes(2)
    
    expect(rateLimitMock).toHaveBeenNthCalledWith(1, {
      key: rateLimitKeys.credentialsIp('127.0.0.1'),
      limit: 20,
      windowMs: 1000 * 60 * 15,
    })
    
    expect(rateLimitMock).toHaveBeenNthCalledWith(2, {
      key: rateLimitKeys.credentialsEmail('user@mail.com'),
      limit: 5,
      windowMs: 1000 * 60 * 15,
    })
  })
  
  it('uses only email limiter when ip is null', async () => {
    await enforceLoginRateLimits(
      'user@mail.com',
      null,
    )
    
    expect(rateLimitMock).toHaveBeenCalledTimes(1)
    
    expect(rateLimitMock).toHaveBeenCalledWith({
      key: rateLimitKeys.credentialsEmail('user@mail.com'),
      limit: 5,
      windowMs: 1000 * 60 * 15,
    })
  })
})