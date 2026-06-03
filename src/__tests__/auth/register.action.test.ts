import { describe, it, expect, vi, beforeEach } from 'vitest'

const registerUserServiceMock = vi.hoisted(() => vi.fn())

vi.mock('@/features/auth/services/registerUser.service', () => ({
  registerUserService: registerUserServiceMock,
}))

describe('registerUser action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })
  
  it('returns invalid input data when schema fails (and does not call service)', async () => {
    const { registerUser } = await import('@/features/auth/actions/register')
    
    const res = await registerUser({
      email: 'not-an-email',
      password: 'TestPass1',
      confirmPassword: 'TestPass1',
      name: 'Te',
    } as any)
    
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error).toBe('Invalid input data')
    }
    
    expect(registerUserServiceMock).not.toHaveBeenCalled()
  })
  
  it('returns success with userId when service succeeds', async () => {
    registerUserServiceMock.mockResolvedValue({
      user: { id: 'u1', email: 'user@mail.com' },
    })
    
    const { registerUser } = await import('@/features/auth/actions/register')
    const res = await registerUser({
      email: 'user@mail.com',
      password: 'TestPass1',
      confirmPassword: 'TestPass1',
      name: 'Test',
    } as any)
    
    expect(registerUserServiceMock).toHaveBeenCalledOnce()
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.userId).toBe('u1')
    }
  })
  
  it('maps USER_ALREADY_EXISTS to a friendly error', async () => {
    registerUserServiceMock.mockRejectedValue(new Error('USER_ALREADY_EXISTS'))
    
    const { registerUser } = await import('@/features/auth/actions/register')
    const res = await registerUser({
      email: 'user@mail.com',
      password: 'TestPass1',
      confirmPassword: 'TestPass1',
      name: 'Test',
    } as any)
    
    expect(registerUserServiceMock).toHaveBeenCalledOnce()
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error).toBe('Unable to create account')
    }
  })
})
