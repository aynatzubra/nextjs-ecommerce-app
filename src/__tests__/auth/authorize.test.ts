import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooManyRequestsAuthError } from '@/features/auth/errors/auth-errors'

const validateCredentialsMock = vi.fn()
const getRequestIpMock = vi.fn()
const enforceLoginRateLimitsMock = vi.fn()

vi.mock('@/features/auth/services/validateCredentials.service', () => ({
  validateCredentials: validateCredentialsMock,
}))

vi.mock('@/shared/lib/security/getRequestIp', () => ({
  getRequestIp: getRequestIpMock,
}))

vi.mock(
  '@/features/auth/services/enforceLoginRateLimits.service',
  () => ({
    enforceLoginRateLimits: enforceLoginRateLimitsMock,
  }),
)

const { RateLimitError } = await import('@/shared/lib/security/rate-limit')

const {
  authorizeCredentials,
} = await import('@/features/auth/lib/authorizeCredentials')

describe('authorizeCredentials', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    
    getRequestIpMock.mockResolvedValue(null)
    enforceLoginRateLimitsMock.mockResolvedValue(undefined)
  })
  
  it('returns mapped user for valid credentials', async () => {
    getRequestIpMock.mockResolvedValue('127.0.0.1')
    
    validateCredentialsMock.mockResolvedValue({
      id: 'user-1',
      email: 'user@mail.com',
      role: 'USER',
      name: 'John',
    })
    
    const result = await authorizeCredentials({
      email: 'user@mail.com',
      password: 'password123',
    })
    
    expect(result).toEqual({
      id: 'user-1',
      email: 'user@mail.com',
      role: 'USER',
      name: 'John',
    })
    
    expect(validateCredentialsMock).toHaveBeenCalledTimes(1)
    expect(validateCredentialsMock).toHaveBeenCalledWith({
      email: 'user@mail.com',
      password: 'password123',
    })
    
    expect(enforceLoginRateLimitsMock)
      .toHaveBeenCalledWith(
        'user@mail.com',
        '127.0.0.1',
      )
  })
  
  it('returns null for invalid credentials payload', async () => {
    const result = await authorizeCredentials({
      email: 'not-an-email',
      password: '123',
    })
    
    expect(result).toBeNull()
    
    expect(validateCredentialsMock).not.toHaveBeenCalled()
    expect(enforceLoginRateLimitsMock).not.toHaveBeenCalled()
  })
  
  it('returns null for invalid credentials', async () => {
    getRequestIpMock.mockResolvedValue('127.0.0.1')
    
    validateCredentialsMock.mockRejectedValue(
      new Error('INVALID_CREDENTIALS'),
    )
    
    const result = await authorizeCredentials({
      email: 'user@mail.com',
      password: 'wrong-password',
    })
    
    expect(result).toBeNull()
    
    expect(validateCredentialsMock).toHaveBeenCalledTimes(1)
    expect(validateCredentialsMock).toHaveBeenCalledWith({
      email: 'user@mail.com',
      password: 'wrong-password',
    })
    
    expect(enforceLoginRateLimitsMock)
      .toHaveBeenCalledWith(
        'user@mail.com',
        '127.0.0.1',
      )
  })
  
  it('uses validateCredentials as single source of truth', async () => {
    getRequestIpMock.mockResolvedValue('127.0.0.1')
    
    const expectedUser = {
      id: 'user-1',
      email: 'user@mail.com',
      role: 'USER',
      name: null,
    }
    
    validateCredentialsMock.mockResolvedValue(expectedUser)
    
    const result = await authorizeCredentials({
      email: 'USER@MAIL.COM',
      password: 'password123',
    })
    
    expect(result).toEqual(expectedUser)
    
    expect(validateCredentialsMock).toHaveBeenCalledWith({
      email: 'user@mail.com',
      password: 'password123',
    })
  })
  
  it('delegates login rate limiting to shared service', async () => {
    getRequestIpMock.mockResolvedValue('127.0.0.1')
    
    validateCredentialsMock.mockResolvedValue({
      id: 'user-1',
      email: 'user@mail.com',
      role: 'USER',
      name: null,
    })
    
    await authorizeCredentials({
      email: 'USER@MAIL.COM',
      password: 'password123',
    })
    
    expect(enforceLoginRateLimitsMock).toHaveBeenCalledTimes(1)
    expect(enforceLoginRateLimitsMock)
      .toHaveBeenCalledWith(
        'user@mail.com',
        '127.0.0.1',
      )
  })
  
  it('throws TooManyRequestsAuthError when rate limit is exceeded', async () => {
    getRequestIpMock.mockResolvedValue('127.0.0.1')
    enforceLoginRateLimitsMock.mockRejectedValue(
      new RateLimitError(),
    )
    
    await expect(
      authorizeCredentials({
        email: 'user@mail.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(TooManyRequestsAuthError)
    
    expect(validateCredentialsMock).not.toHaveBeenCalled()
  })
  
  it('hides EMAIL_NOT_VERIFIED behind fail-closed null return', async () => {
    getRequestIpMock.mockResolvedValue('127.0.0.1')
    
    validateCredentialsMock.mockRejectedValue(
      new Error('EMAIL_NOT_VERIFIED'),
    )
    
    const result = await authorizeCredentials({
      email: 'user@mail.com',
      password: 'password123',
    })
    
    expect(result).toBeNull()
    
    expect(validateCredentialsMock).toHaveBeenCalledTimes(1)
    expect(validateCredentialsMock).toHaveBeenCalledWith({
      email: 'user@mail.com',
      password: 'password123',
    })
  })
})